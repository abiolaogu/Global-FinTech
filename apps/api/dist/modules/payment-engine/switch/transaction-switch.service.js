"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TransactionSwitch_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionSwitch = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const iso8583_parser_service_1 = require("../iso8583/iso8583-parser.service");
const net = require("net");
let TransactionSwitch = TransactionSwitch_1 = class TransactionSwitch {
    constructor(iso8583Parser, eventEmitter) {
        this.iso8583Parser = iso8583Parser;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(TransactionSwitch_1.name);
        this.connectionPools = new Map();
        this.routingRules = [];
        this.pendingTransactions = new Map();
        this.metrics = {
            totalProcessed: 0,
            successCount: 0,
            errorCount: 0,
            timeoutCount: 0,
            avgProcessingTime: 0,
            peakTPS: 0,
            currentTPS: 0,
        };
        this.tpsWindow = [];
        this.circuitBreakers = new Map();
    }
    async onModuleInit() {
        this.logger.log('Initializing Transaction Switch...');
        await this.loadRoutingRules();
        await this.initializeConnectionPools();
        this.startTPSTracker();
        this.logger.log('Transaction Switch initialized successfully');
    }
    async onModuleDestroy() {
        this.logger.log('Shutting down Transaction Switch...');
        if (this.tpsInterval) {
            clearInterval(this.tpsInterval);
        }
        for (const [destId, pool] of this.connectionPools) {
            await pool.close();
            this.logger.log(`Closed connection pool for ${destId}`);
        }
        this.logger.log('Transaction Switch shut down successfully');
    }
    async process(message, source) {
        const startTime = Date.now();
        const requestKey = this.generateRequestKey(message);
        try {
            const destination = await this.route(message);
            if (!destination) {
                throw new Error('No routing destination found');
            }
            const breaker = this.getCircuitBreaker(destination.id);
            if (breaker.isOpen()) {
                throw new Error(`Circuit breaker OPEN for ${destination.name}`);
            }
            const pool = this.connectionPools.get(destination.id);
            if (!pool) {
                throw new Error(`No connection pool for ${destination.id}`);
            }
            const response = await this.sendAndReceive(pool, message, destination.timeout);
            this.updateMetrics(true, Date.now() - startTime);
            breaker.recordSuccess();
            this.eventEmitter.emit('transaction.completed', {
                requestKey,
                mti: message.mti,
                destination: destination.id,
                processingTime: Date.now() - startTime,
                success: true,
            });
            return response;
        }
        catch (error) {
            this.logger.error(`Transaction failed: ${error.message}`, error.stack);
            this.updateMetrics(false, Date.now() - startTime);
            const destination = await this.route(message);
            if (destination) {
                const breaker = this.getCircuitBreaker(destination.id);
                breaker.recordFailure();
            }
            this.eventEmitter.emit('transaction.failed', {
                requestKey,
                mti: message.mti,
                error: error.message,
                processingTime: Date.now() - startTime,
            });
            if (destination && destination.fallbackDestination) {
                this.logger.log(`Trying fallback destination: ${destination.fallbackDestination.name}`);
                return this.sendToDestination(message, destination.fallbackDestination);
            }
            throw error;
        }
        finally {
            this.pendingTransactions.delete(requestKey);
        }
    }
    async route(message) {
        const sortedRules = this.routingRules
            .filter((r) => r.enabled)
            .sort((a, b) => b.priority - a.priority);
        for (const rule of sortedRules) {
            if (this.matchesRule(message, rule)) {
                this.logger.debug(`Matched routing rule: ${rule.name}`);
                return rule.destination;
            }
        }
        return this.getDefaultDestination(message.mti);
    }
    matchesRule(message, rule) {
        for (const condition of rule.conditions) {
            const fieldValue = message.fields.get(condition.field);
            if (!fieldValue) {
                return false;
            }
            switch (condition.operator) {
                case 'equals':
                    if (fieldValue !== condition.value)
                        return false;
                    break;
                case 'startsWith':
                    if (!fieldValue.toString().startsWith(condition.value))
                        return false;
                    break;
                case 'contains':
                    if (!fieldValue.toString().includes(condition.value))
                        return false;
                    break;
                case 'in':
                    if (!Array.isArray(condition.value) || !condition.value.includes(fieldValue)) {
                        return false;
                    }
                    break;
                case 'range':
                    const [min, max] = condition.value;
                    const numValue = parseFloat(fieldValue);
                    if (numValue < min || numValue > max)
                        return false;
                    break;
            }
        }
        return true;
    }
    async sendAndReceive(pool, message, timeout) {
        return new Promise(async (resolve, reject) => {
            const requestKey = this.generateRequestKey(message);
            let timeoutHandle;
            try {
                timeoutHandle = setTimeout(() => {
                    this.pendingTransactions.delete(requestKey);
                    this.metrics.timeoutCount++;
                    reject(new Error(`Transaction timeout after ${timeout}ms`));
                }, timeout);
                this.pendingTransactions.set(requestKey, {
                    message,
                    timestamp: Date.now(),
                    resolve,
                    reject,
                    timeoutHandle,
                });
                const connection = await pool.getConnection();
                const messageBuffer = this.iso8583Parser.build(message);
                const lengthBuffer = Buffer.allocUnsafe(2);
                lengthBuffer.writeUInt16BE(messageBuffer.length, 0);
                const fullMessage = Buffer.concat([lengthBuffer, messageBuffer]);
                connection.write(fullMessage);
                this.logger.debug(`Sent message ${requestKey} to ${connection.remoteAddress}:${connection.remotePort}`);
            }
            catch (error) {
                if (timeoutHandle)
                    clearTimeout(timeoutHandle);
                this.pendingTransactions.delete(requestKey);
                reject(error);
            }
        });
    }
    async sendToDestination(message, destination) {
        const pool = this.connectionPools.get(destination.id);
        if (!pool) {
            throw new Error(`No connection pool for ${destination.id}`);
        }
        return this.sendAndReceive(pool, message, destination.timeout);
    }
    handleResponse(buffer, connection) {
        try {
            const message = this.iso8583Parser.parse(buffer);
            const requestKey = this.generateRequestKey(message);
            const pending = this.pendingTransactions.get(requestKey);
            if (pending) {
                clearTimeout(pending.timeoutHandle);
                this.pendingTransactions.delete(requestKey);
                pending.resolve(message);
            }
            else {
                this.logger.warn(`Received response for unknown request: ${requestKey}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to handle response: ${error.message}`);
        }
    }
    generateRequestKey(message) {
        const stan = message.fields.get(11) || '000000';
        const rrn = message.fields.get(37) || '';
        const terminalId = message.fields.get(41) || '';
        return `${stan}_${rrn}_${terminalId}`;
    }
    getDefaultDestination(mti) {
        return null;
    }
    async initializeConnectionPools() {
        const destinations = [
            {
                id: 'visa-network',
                name: 'Visa Network',
                type: 'network',
                host: 'visa.network.example.com',
                port: 8583,
                ssl: true,
                timeout: 30000,
                maxConnections: 100,
            },
            {
                id: 'mastercard-network',
                name: 'Mastercard Network',
                type: 'network',
                host: 'mc.network.example.com',
                port: 8583,
                ssl: true,
                timeout: 30000,
                maxConnections: 100,
            },
        ];
        for (const dest of destinations) {
            const pool = new ConnectionPool(dest, this);
            await pool.initialize();
            this.connectionPools.set(dest.id, pool);
            this.logger.log(`Initialized connection pool for ${dest.name}`);
        }
    }
    async loadRoutingRules() {
        this.routingRules = [
            {
                id: 'visa-routing',
                name: 'Route Visa cards to Visa network',
                priority: 100,
                enabled: true,
                conditions: [
                    {
                        field: 2,
                        operator: 'startsWith',
                        value: '4',
                    },
                ],
                destination: {
                    id: 'visa-network',
                    name: 'Visa Network',
                    type: 'network',
                    host: 'visa.network.example.com',
                    port: 8583,
                    ssl: true,
                    timeout: 30000,
                    maxConnections: 100,
                },
            },
            {
                id: 'mastercard-routing',
                name: 'Route Mastercard to MC network',
                priority: 100,
                enabled: true,
                conditions: [
                    {
                        field: 2,
                        operator: 'startsWith',
                        value: '5',
                    },
                ],
                destination: {
                    id: 'mastercard-network',
                    name: 'Mastercard Network',
                    type: 'network',
                    host: 'mc.network.example.com',
                    port: 8583,
                    ssl: true,
                    timeout: 30000,
                    maxConnections: 100,
                },
            },
        ];
        this.logger.log(`Loaded ${this.routingRules.length} routing rules`);
    }
    updateMetrics(success, processingTime) {
        this.metrics.totalProcessed++;
        if (success) {
            this.metrics.successCount++;
        }
        else {
            this.metrics.errorCount++;
        }
        this.metrics.avgProcessingTime =
            (this.metrics.avgProcessingTime * (this.metrics.totalProcessed - 1) + processingTime) /
                this.metrics.totalProcessed;
        this.tpsWindow.push(Date.now());
    }
    startTPSTracker() {
        this.tpsInterval = setInterval(() => {
            const now = Date.now();
            const oneSecondAgo = now - 1000;
            this.tpsWindow = this.tpsWindow.filter((t) => t > oneSecondAgo);
            this.metrics.currentTPS = this.tpsWindow.length;
            if (this.metrics.currentTPS > this.metrics.peakTPS) {
                this.metrics.peakTPS = this.metrics.currentTPS;
            }
        }, 100);
    }
    getCircuitBreaker(destinationId) {
        let breaker = this.circuitBreakers.get(destinationId);
        if (!breaker) {
            breaker = new CircuitBreaker(destinationId, {
                failureThreshold: 5,
                successThreshold: 2,
                timeout: 60000,
            });
            this.circuitBreakers.set(destinationId, breaker);
        }
        return breaker;
    }
    getMetrics() {
        return Object.assign({}, this.metrics);
    }
    async reloadRoutingRules() {
        this.logger.log('Reloading routing rules...');
        await this.loadRoutingRules();
        this.logger.log('Routing rules reloaded successfully');
    }
};
exports.TransactionSwitch = TransactionSwitch;
exports.TransactionSwitch = TransactionSwitch = TransactionSwitch_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [iso8583_parser_service_1.ISO8583Parser, typeof (_a = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _a : Object])
], TransactionSwitch);
class ConnectionPool {
    constructor() {
        this.connections = [];
        this.availableConnections = [];
        this.waitingQueue = [];
        this.logger = new common_1.Logger(ConnectionPool.name);
    }
}
{ }
async;
initialize();
Promise < void  > {
    const: initialConnections = Math.min(5, this.destination.maxConnections),
    for(let, i = 0, i, , initialConnections, i) { }
}++;
{
    await this.createConnection();
}
this.logger.log(`Initialized ${initialConnections} connections to ${this.destination.name}`);
async;
getConnection();
Promise < net.Socket > {
    : .availableConnections.length > 0
};
{
    return this.availableConnections.pop();
}
if (this.connections.length < this.destination.maxConnections) {
    return await this.createConnection();
}
return new Promise((resolve) => {
    this.waitingQueue.push(resolve);
});
releaseConnection(connection, net.Socket);
void {
    const: waiting = this.waitingQueue.shift(),
    if(waiting) {
        waiting(connection);
        return;
    },
    this: .availableConnections.push(connection)
};
async;
createConnection();
Promise < net.Socket > {
    const: connection = new net.Socket(),
    connection, : .setTimeout(this.destination.timeout),
    connection, : .setKeepAlive(true, 60000),
    connection, : .setNoDelay(true),
    let, messageBuffer = Buffer.alloc(0),
    connection, : .on('data', (data) => {
        messageBuffer = Buffer.concat([messageBuffer, data]);
        while (messageBuffer.length >= 2) {
            const messageLength = messageBuffer.readUInt16BE(0);
            if (messageBuffer.length >= messageLength + 2) {
                const messageData = messageBuffer.slice(2, messageLength + 2);
                this.switch.handleResponse(messageData, connection);
                messageBuffer = messageBuffer.slice(messageLength + 2);
            }
            else {
                break;
            }
        }
    }),
    connection, : .on('error', (error) => {
        this.logger.error(`Connection error to ${this.destination.name}: ${error.message}`);
        this.removeConnection(connection);
    }),
    connection, : .on('close', () => {
        this.logger.warn(`Connection closed to ${this.destination.name}`);
        this.removeConnection(connection);
    }),
    await, new: Promise((resolve, reject) => {
        connection.connect(this.destination.port, this.destination.host, () => {
            this.logger.log(`Connected to ${this.destination.host}:${this.destination.port}`);
            resolve();
        });
        connection.once('error', reject);
    }),
    this: .connections.push(connection),
    return: connection
};
removeConnection(connection, net.Socket);
void {
    const: index = this.connections.indexOf(connection),
    if(index) { }
} > -1;
{
    this.connections.splice(index, 1);
}
const availIndex = this.availableConnections.indexOf(connection);
if (availIndex > -1) {
    this.availableConnections.splice(availIndex, 1);
}
connection.destroy();
async;
close();
Promise < void  > {
    : .connections
};
{
    conn.destroy();
}
this.connections = [];
this.availableConnections = [];
this.waitingQueue = [];
class CircuitBreaker {
    constructor(id, config) {
        this.id = id;
        this.config = config;
        this.state = 'CLOSED';
        this.failureCount = 0;
        this.successCount = 0;
        this.lastFailureTime = null;
    }
    recordSuccess() {
        if (this.state === 'HALF_OPEN') {
            this.successCount++;
            if (this.successCount >= this.config.successThreshold) {
                this.state = 'CLOSED';
                this.failureCount = 0;
                this.successCount = 0;
            }
        }
        else {
            this.failureCount = 0;
        }
    }
    recordFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        if (this.failureCount >= this.config.failureThreshold) {
            this.state = 'OPEN';
        }
    }
    isOpen() {
        if (this.state === 'OPEN') {
            if (this.lastFailureTime &&
                Date.now() - this.lastFailureTime >= this.config.timeout) {
                this.state = 'HALF_OPEN';
                this.successCount = 0;
                return false;
            }
            return true;
        }
        return false;
    }
    getState() {
        return this.state;
    }
}
//# sourceMappingURL=transaction-switch.service.js.map