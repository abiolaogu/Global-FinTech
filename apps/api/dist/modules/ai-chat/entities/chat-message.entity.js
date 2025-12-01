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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMessageEntity = exports.MessageStatus = exports.MessageRole = void 0;
const typeorm_1 = require("typeorm");
const chat_session_entity_1 = require("./chat-session.entity");
var MessageRole;
(function (MessageRole) {
    MessageRole["USER"] = "user";
    MessageRole["ASSISTANT"] = "assistant";
    MessageRole["SYSTEM"] = "system";
})(MessageRole || (exports.MessageRole = MessageRole = {}));
var MessageStatus;
(function (MessageStatus) {
    MessageStatus["PENDING"] = "pending";
    MessageStatus["PROCESSING"] = "processing";
    MessageStatus["COMPLETED"] = "completed";
    MessageStatus["FAILED"] = "failed";
})(MessageStatus || (exports.MessageStatus = MessageStatus = {}));
let ChatMessageEntity = class ChatMessageEntity {
};
exports.ChatMessageEntity = ChatMessageEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ChatMessageEntity.prototype, "messageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], ChatMessageEntity.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => chat_session_entity_1.ChatSessionEntity, (session) => session.messages),
    (0, typeorm_1.JoinColumn)({ name: 'sessionId' }),
    __metadata("design:type", chat_session_entity_1.ChatSessionEntity)
], ChatMessageEntity.prototype, "session", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], ChatMessageEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], ChatMessageEntity.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], ChatMessageEntity.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: MessageStatus.COMPLETED }),
    __metadata("design:type", String)
], ChatMessageEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], ChatMessageEntity.prototype, "detectedIntent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 4, nullable: true }),
    __metadata("design:type", String)
], ChatMessageEntity.prototype, "intentConfidence", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], ChatMessageEntity.prototype, "entities", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], ChatMessageEntity.prototype, "alternatives", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], ChatMessageEntity.prototype, "actionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], ChatMessageEntity.prototype, "actionParams", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], ChatMessageEntity.prototype, "actionStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ChatMessageEntity.prototype, "actionResultId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ChatMessageEntity.prototype, "actionError", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], ChatMessageEntity.prototype, "context", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], ChatMessageEntity.prototype, "references", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], ChatMessageEntity.prototype, "sentiment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 4, nullable: true }),
    __metadata("design:type", String)
], ChatMessageEntity.prototype, "sentimentScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ChatMessageEntity.prototype, "responseTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], ChatMessageEntity.prototype, "modelVersion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ChatMessageEntity.prototype, "tokensUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', nullable: true }),
    __metadata("design:type", Boolean)
], ChatMessageEntity.prototype, "isHelpful", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], ChatMessageEntity.prototype, "feedbackType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ChatMessageEntity.prototype, "feedbackComment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], ChatMessageEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], ChatMessageEntity.prototype, "isEdited", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], ChatMessageEntity.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], ChatMessageEntity.prototype, "createdAt", void 0);
exports.ChatMessageEntity = ChatMessageEntity = __decorate([
    (0, typeorm_1.Entity)('chat_messages')
], ChatMessageEntity);
//# sourceMappingURL=chat-message.entity.js.map