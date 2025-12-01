import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ISO8583Message, ISO8583Parser } from '../iso8583/iso8583-parser.service';
import * as net from 'net';
export interface RoutingRule {
    id: string;
    name: string;
    priority: number;
    conditions: RoutingCondition[];
    destination: RoutingDestination;
    enabled: boolean;
    fallbackDestination?: RoutingDestination;
}
export interface RoutingCondition {
    field: number;
    operator: 'equals' | 'startsWith' | 'contains' | 'in' | 'range';
    value: any;
}
export interface RoutingDestination {
    id: string;
    name: string;
    type: 'issuer' | 'acquirer' | 'network' | 'processor';
    host: string;
    port: number;
    ssl: boolean;
    timeout: number;
    maxConnections: number;
}
export interface TransactionMetrics {
    totalProcessed: number;
    successCount: number;
    errorCount: number;
    timeoutCount: number;
    avgProcessingTime: number;
    peakTPS: number;
    currentTPS: number;
}
export declare class TransactionSwitch implements OnModuleInit, OnModuleDestroy {
    private readonly iso8583Parser;
    private readonly eventEmitter;
    private readonly logger;
    private connectionPools;
    private routingRules;
    private pendingTransactions;
    private metrics;
    private tpsWindow;
    private tpsInterval;
    private circuitBreakers;
    constructor(iso8583Parser: ISO8583Parser, eventEmitter: EventEmitter2);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    process(message: ISO8583Message, source?: string): Promise<ISO8583Message>;
    private route;
    private matchesRule;
    private sendAndReceive;
    private sendToDestination;
    handleResponse(buffer: Buffer, connection: net.Socket): void;
    private generateRequestKey;
    private getDefaultDestination;
    private initializeConnectionPools;
    private loadRoutingRules;
    private updateMetrics;
    private startTPSTracker;
    private getCircuitBreaker;
    getMetrics(): TransactionMetrics;
    reloadRoutingRules(): Promise<void>;
}
