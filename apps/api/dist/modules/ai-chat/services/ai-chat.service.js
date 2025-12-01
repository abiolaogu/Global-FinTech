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
var AIChatService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const chat_session_entity_1 = require("../entities/chat-session.entity");
const chat_message_entity_1 = require("../entities/chat-message.entity");
const ai_intent_service_1 = require("./ai-intent.service");
const action_executor_service_1 = require("./action-executor.service");
let AIChatService = AIChatService_1 = class AIChatService {
    constructor(sessionRepository, messageRepository, intentService, actionExecutor) {
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
        this.intentService = intentService;
        this.actionExecutor = actionExecutor;
        this.logger = new common_1.Logger(AIChatService_1.name);
    }
    async sendMessage(userId, dto) {
        var _a, _b;
        let session;
        if (dto.sessionId) {
            session = await this.sessionRepository.findOne({
                where: { sessionId: dto.sessionId, userId },
            });
            if (!session) {
                throw new common_1.NotFoundException('Session not found');
            }
        }
        else {
            session = await this.createSession(userId, dto.metadata);
        }
        const userMessage = await this.saveMessage({
            sessionId: session.sessionId,
            userId,
            role: chat_message_entity_1.MessageRole.USER,
            content: dto.message,
            status: chat_message_entity_1.MessageStatus.COMPLETED,
        });
        const context = await this.getConversationContext(session.sessionId);
        const intent = await this.intentService.detectIntent(dto.message, context);
        this.logger.debug(`Detected intent: ${intent.name} (confidence: ${intent.confidence})`);
        await this.messageRepository.update(userMessage.messageId, {
            detectedIntent: intent.name,
            intentConfidence: intent.confidence.toString(),
            entities: intent.entities,
            alternatives: intent.alternatives,
        });
        let response = this.intentService.generateResponse(intent, context);
        let actionResult = null;
        if (intent.confidence >= 0.6 && intent.name !== 'unknown' && intent.name !== 'get_help') {
            try {
                actionResult = await this.actionExecutor.executeAction(intent, userId, context);
                if (actionResult.success) {
                    response = actionResult.message;
                }
                else {
                    response = actionResult.error || actionResult.message;
                }
            }
            catch (error) {
                this.logger.error(`Action execution failed: ${error.message}`, error.stack);
                response = 'I encountered an error processing your request. Please try again.';
            }
        }
        else if (intent.confidence < 0.6 && ((_a = intent.alternatives) === null || _a === void 0 ? void 0 : _a.length) > 0) {
            const alternativeNames = intent.alternatives.map((a) => a.name).join(', ');
            response = `I'm not quite sure what you meant. Did you want to: ${alternativeNames}?`;
        }
        const assistantMessage = await this.saveMessage({
            sessionId: session.sessionId,
            userId,
            role: chat_message_entity_1.MessageRole.ASSISTANT,
            content: response,
            status: chat_message_entity_1.MessageStatus.COMPLETED,
            detectedIntent: intent.name,
            intentConfidence: intent.confidence.toString(),
            actionType: (actionResult === null || actionResult === void 0 ? void 0 : actionResult.success) ? intent.name : null,
            actionStatus: (actionResult === null || actionResult === void 0 ? void 0 : actionResult.success) ? 'completed' : actionResult ? 'failed' : null,
            actionResultId: ((_b = actionResult === null || actionResult === void 0 ? void 0 : actionResult.data) === null || _b === void 0 ? void 0 : _b.id) || null,
            actionError: (actionResult === null || actionResult === void 0 ? void 0 : actionResult.error) || null,
        });
        await this.updateSession(session.sessionId, {
            messageCount: session.messageCount + 2,
            lastActivityAt: new Date(),
            lastIntent: intent.name,
            actionsExecuted: actionResult ? session.actionsExecuted + 1 : session.actionsExecuted,
            successfulActions: (actionResult === null || actionResult === void 0 ? void 0 : actionResult.success)
                ? session.successfulActions + 1
                : session.successfulActions,
            failedActions: actionResult && !actionResult.success
                ? session.failedActions + 1
                : session.failedActions,
        });
        return {
            sessionId: session.sessionId,
            messageId: assistantMessage.messageId,
            response,
            intent: {
                name: intent.name,
                confidence: intent.confidence,
                entities: intent.entities,
            },
            actionResult: actionResult === null || actionResult === void 0 ? void 0 : actionResult.data,
            requiresConfirmation: actionResult === null || actionResult === void 0 ? void 0 : actionResult.requiresConfirmation,
            confirmationData: actionResult === null || actionResult === void 0 ? void 0 : actionResult.confirmationData,
        };
    }
    async confirmAction(userId, sessionId, confirmationData) {
        const session = await this.sessionRepository.findOne({
            where: { sessionId, userId },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        const response = `Action confirmed! Processing your ${confirmationData.action} request.`;
        const assistantMessage = await this.saveMessage({
            sessionId,
            userId,
            role: chat_message_entity_1.MessageRole.ASSISTANT,
            content: response,
            status: chat_message_entity_1.MessageStatus.COMPLETED,
            actionType: confirmationData.action,
            actionStatus: 'confirmed',
        });
        return {
            sessionId,
            messageId: assistantMessage.messageId,
            response,
        };
    }
    async getSession(userId, sessionId) {
        const session = await this.sessionRepository.findOne({
            where: { sessionId, userId },
            relations: ['messages'],
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        return session;
    }
    async getUserSessions(userId, limit = 20) {
        return this.sessionRepository.find({
            where: { userId },
            order: { lastActivityAt: 'DESC' },
            take: limit,
        });
    }
    async getMessages(userId, sessionId, limit = 50) {
        const session = await this.sessionRepository.findOne({
            where: { sessionId, userId },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        return this.messageRepository.find({
            where: { sessionId },
            order: { createdAt: 'ASC' },
            take: limit,
        });
    }
    async closeSession(userId, sessionId) {
        const session = await this.sessionRepository.findOne({
            where: { sessionId, userId },
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        await this.sessionRepository.update(sessionId, {
            status: chat_session_entity_1.SessionStatus.CLOSED,
            closedAt: new Date(),
        });
    }
    async rateMessage(userId, messageId, isHelpful, feedback) {
        const message = await this.messageRepository.findOne({
            where: { messageId, userId },
        });
        if (!message) {
            throw new common_1.NotFoundException('Message not found');
        }
        await this.messageRepository.update(messageId, {
            isHelpful,
            feedbackType: isHelpful ? 'thumbs_up' : 'thumbs_down',
            feedbackComment: feedback,
        });
    }
    async createSession(userId, metadata) {
        const session = this.sessionRepository.create({
            userId,
            status: chat_session_entity_1.SessionStatus.ACTIVE,
            lastActivityAt: new Date(),
            deviceType: metadata === null || metadata === void 0 ? void 0 : metadata.deviceType,
            platform: metadata === null || metadata === void 0 ? void 0 : metadata.platform,
            userAgent: metadata === null || metadata === void 0 ? void 0 : metadata.userAgent,
            ipAddress: metadata === null || metadata === void 0 ? void 0 : metadata.ipAddress,
        });
        return this.sessionRepository.save(session);
    }
    async saveMessage(data) {
        const message = this.messageRepository.create(data);
        return this.messageRepository.save(message);
    }
    async updateSession(sessionId, data) {
        await this.sessionRepository.update(sessionId, data);
    }
    async getConversationContext(sessionId) {
        var _a;
        const recentMessages = await this.messageRepository.find({
            where: { sessionId },
            order: { createdAt: 'DESC' },
            take: 5,
        });
        const lastIntent = (_a = recentMessages.find((m) => m.detectedIntent)) === null || _a === void 0 ? void 0 : _a.detectedIntent;
        const topics = new Set(recentMessages
            .filter((m) => m.detectedIntent)
            .map((m) => this.getTopicFromIntent(m.detectedIntent)));
        return {
            lastIntent,
            activeTopics: Array.from(topics),
            recentMessages: recentMessages.map((m) => ({
                role: m.role,
                content: m.content,
                intent: m.detectedIntent,
            })),
        };
    }
    getTopicFromIntent(intent) {
        if (intent.includes('money') || intent.includes('payment'))
            return 'payments';
        if (intent.includes('invest'))
            return 'investments';
        if (intent.includes('rosca'))
            return 'rosca';
        if (intent.includes('loan'))
            return 'loans';
        if (intent.includes('balance') || intent.includes('transaction'))
            return 'accounts';
        return 'general';
    }
};
exports.AIChatService = AIChatService;
exports.AIChatService = AIChatService = AIChatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(chat_session_entity_1.ChatSessionEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(chat_message_entity_1.ChatMessageEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, ai_intent_service_1.AIIntentService,
        action_executor_service_1.ActionExecutorService])
], AIChatService);
//# sourceMappingURL=ai-chat.service.js.map