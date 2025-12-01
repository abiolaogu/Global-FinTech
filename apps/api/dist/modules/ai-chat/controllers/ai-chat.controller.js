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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AIChatGateway_1;
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIChatGateway = exports.AIChatController = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const ai_chat_service_1 = require("../services/ai-chat.service");
const common_2 = require("@nestjs/common");
class RateMessageDto {
}
class ConfirmActionDto {
}
let AIChatController = class AIChatController {
    constructor(aiChatService) {
        this.aiChatService = aiChatService;
    }
    async sendMessage(req, dto) {
        var _a;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || 'usr_demo';
        return this.aiChatService.sendMessage(userId, dto);
    }
    async confirmAction(req, sessionId, dto) {
        var _a;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || 'usr_demo';
        return this.aiChatService.confirmAction(userId, sessionId, dto.confirmationData);
    }
    async getSessions(req, limit) {
        var _a;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || 'usr_demo';
        return this.aiChatService.getUserSessions(userId, limit);
    }
    async getSession(req, sessionId) {
        var _a;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || 'usr_demo';
        return this.aiChatService.getSession(userId, sessionId);
    }
    async getMessages(req, sessionId, limit) {
        var _a;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || 'usr_demo';
        return this.aiChatService.getMessages(userId, sessionId, limit);
    }
    async closeSession(req, sessionId) {
        var _a;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || 'usr_demo';
        await this.aiChatService.closeSession(userId, sessionId);
        return { message: 'Session closed successfully' };
    }
    async rateMessage(req, messageId, dto) {
        var _a;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || 'usr_demo';
        await this.aiChatService.rateMessage(userId, messageId, dto.isHelpful, dto.feedback);
        return { message: 'Feedback recorded successfully' };
    }
};
exports.AIChatController = AIChatController;
__decorate([
    (0, common_1.Post)('messages'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AIChatController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/confirm'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, ConfirmActionDto]),
    __metadata("design:returntype", Promise)
], AIChatController.prototype, "confirmAction", null);
__decorate([
    (0, common_1.Get)('sessions'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], AIChatController.prototype, "getSessions", null);
__decorate([
    (0, common_1.Get)('sessions/:sessionId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AIChatController.prototype, "getSession", null);
__decorate([
    (0, common_1.Get)('sessions/:sessionId/messages'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number]),
    __metadata("design:returntype", Promise)
], AIChatController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/close'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AIChatController.prototype, "closeSession", null);
__decorate([
    (0, common_1.Post)('messages/:messageId/rate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('messageId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, RateMessageDto]),
    __metadata("design:returntype", Promise)
], AIChatController.prototype, "rateMessage", null);
exports.AIChatController = AIChatController = __decorate([
    (0, common_1.Controller)('ai-chat'),
    __metadata("design:paramtypes", [ai_chat_service_1.AIChatService])
], AIChatController);
let AIChatGateway = AIChatGateway_1 = class AIChatGateway {
    constructor(aiChatService) {
        this.aiChatService = aiChatService;
        this.logger = new common_2.Logger(AIChatGateway_1.name);
        this.userSockets = new Map();
    }
    handleConnection(client) {
        var _a, _b;
        const userId = ((_a = client.handshake.auth) === null || _a === void 0 ? void 0 : _a.userId) || ((_b = client.handshake.query) === null || _b === void 0 ? void 0 : _b.userId);
        if (userId) {
            this.userSockets.set(userId, client.id);
            this.logger.log(`User ${userId} connected with socket ${client.id}`);
            client.emit('connected', {
                message: 'Connected to AtlasX AI Assistant',
                features: [
                    'Send & receive money',
                    'Check balances',
                    'Invest in opportunities',
                    'Join ROSCA circles',
                    'Apply for loans',
                    'Manage your account',
                ],
            });
        }
        else {
            this.logger.warn(`Connection attempt without userId from ${client.id}`);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        var _a;
        const userId = (_a = Array.from(this.userSockets.entries())
            .find(([_, socketId]) => socketId === client.id)) === null || _a === void 0 ? void 0 : _a[0];
        if (userId) {
            this.userSockets.delete(userId);
            this.logger.log(`User ${userId} disconnected`);
        }
    }
    async handleMessage(client, data) {
        var _a, _b;
        const userId = ((_a = client.handshake.auth) === null || _a === void 0 ? void 0 : _a.userId) || ((_b = client.handshake.query) === null || _b === void 0 ? void 0 : _b.userId);
        if (!userId) {
            return { error: 'Unauthorized' };
        }
        try {
            client.emit('assistant_typing', { typing: true });
            const response = await this.aiChatService.sendMessage(userId, {
                sessionId: data.sessionId,
                message: data.message,
                metadata: data.metadata,
            });
            client.emit('assistant_typing', { typing: false });
            client.emit('message_response', response);
            return response;
        }
        catch (error) {
            this.logger.error(`Error processing message: ${error.message}`, error.stack);
            client.emit('assistant_typing', { typing: false });
            client.emit('error', { message: 'Failed to process message' });
            return { error: 'Failed to process message' };
        }
    }
    async handleConfirmAction(client, data) {
        var _a, _b;
        const userId = ((_a = client.handshake.auth) === null || _a === void 0 ? void 0 : _a.userId) || ((_b = client.handshake.query) === null || _b === void 0 ? void 0 : _b.userId);
        if (!userId) {
            return { error: 'Unauthorized' };
        }
        try {
            const response = await this.aiChatService.confirmAction(userId, data.sessionId, data.confirmationData);
            client.emit('action_confirmed', response);
            return response;
        }
        catch (error) {
            this.logger.error(`Error confirming action: ${error.message}`, error.stack);
            client.emit('error', { message: 'Failed to confirm action' });
            return { error: 'Failed to confirm action' };
        }
    }
    async handleStartSession(client, data) {
        var _a, _b;
        const userId = ((_a = client.handshake.auth) === null || _a === void 0 ? void 0 : _a.userId) || ((_b = client.handshake.query) === null || _b === void 0 ? void 0 : _b.userId);
        if (!userId) {
            return { error: 'Unauthorized' };
        }
        return {
            message: 'Ready to assist you! How can I help today?',
            suggestions: [
                'Check my balance',
                'Send money to someone',
                'Show my investment portfolio',
                'Find ROSCA circles',
                'Apply for a loan',
            ],
        };
    }
    async handleGetSuggestions(client) {
        return {
            suggestions: [
                { text: 'Check balance', action: 'check_balance' },
                { text: 'Send money', action: 'send_money' },
                { text: 'View investments', action: 'view_investments' },
                { text: 'Join ROSCA', action: 'join_rosca' },
                { text: 'Apply for loan', action: 'apply_loan' },
                { text: 'Transaction history', action: 'view_transactions' },
            ],
        };
    }
    async handleQuickAction(client, data) {
        var _a, _b;
        const userId = ((_a = client.handshake.auth) === null || _a === void 0 ? void 0 : _a.userId) || ((_b = client.handshake.query) === null || _b === void 0 ? void 0 : _b.userId);
        if (!userId) {
            return { error: 'Unauthorized' };
        }
        const actionMessages = {
            check_balance: 'Check my balance',
            send_money: 'I want to send money',
            view_investments: 'Show my investment portfolio',
            join_rosca: 'Show me ROSCA circles',
            apply_loan: 'I want to apply for a loan',
            view_transactions: 'Show my recent transactions',
        };
        const message = actionMessages[data.action] || data.action;
        return this.handleMessage(client, {
            message,
            sessionId: data.sessionId,
        });
    }
    async notifyUser(userId, notification) {
        const socketId = this.userSockets.get(userId);
        if (socketId) {
            this.server.to(socketId).emit('notification', notification);
        }
    }
};
exports.AIChatGateway = AIChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", typeof (_a = typeof socket_io_1.Server !== "undefined" && socket_io_1.Server) === "function" ? _a : Object)
], AIChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _b : Object, Object]),
    __metadata("design:returntype", Promise)
], AIChatGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('confirm_action'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _c : Object, Object]),
    __metadata("design:returntype", Promise)
], AIChatGateway.prototype, "handleConfirmAction", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('start_session'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _d : Object, Object]),
    __metadata("design:returntype", Promise)
], AIChatGateway.prototype, "handleStartSession", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get_suggestions'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], AIChatGateway.prototype, "handleGetSuggestions", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('quick_action'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _f : Object, Object]),
    __metadata("design:returntype", Promise)
], AIChatGateway.prototype, "handleQuickAction", null);
exports.AIChatGateway = AIChatGateway = AIChatGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        namespace: '/ai-chat',
    }),
    __metadata("design:paramtypes", [ai_chat_service_1.AIChatService])
], AIChatGateway);
//# sourceMappingURL=ai-chat.controller.js.map