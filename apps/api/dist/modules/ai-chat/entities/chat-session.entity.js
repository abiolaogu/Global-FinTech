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
exports.ChatSessionEntity = exports.SessionStatus = void 0;
const typeorm_1 = require("typeorm");
const chat_message_entity_1 = require("./chat-message.entity");
var SessionStatus;
(function (SessionStatus) {
    SessionStatus["ACTIVE"] = "active";
    SessionStatus["IDLE"] = "idle";
    SessionStatus["CLOSED"] = "closed";
})(SessionStatus || (exports.SessionStatus = SessionStatus = {}));
let ChatSessionEntity = class ChatSessionEntity {
};
exports.ChatSessionEntity = ChatSessionEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ChatSessionEntity.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], ChatSessionEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: SessionStatus.ACTIVE }),
    __metadata("design:type", String)
], ChatSessionEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], ChatSessionEntity.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ChatSessionEntity.prototype, "messageCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], ChatSessionEntity.prototype, "lastActivityAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], ChatSessionEntity.prototype, "context", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], ChatSessionEntity.prototype, "activeTopics", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], ChatSessionEntity.prototype, "lastIntent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], ChatSessionEntity.prototype, "userPreferences", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], ChatSessionEntity.prototype, "deviceType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], ChatSessionEntity.prototype, "platform", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], ChatSessionEntity.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], ChatSessionEntity.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ChatSessionEntity.prototype, "actionsExecuted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ChatSessionEntity.prototype, "successfulActions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ChatSessionEntity.prototype, "failedActions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", String)
], ChatSessionEntity.prototype, "satisfactionScore", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => chat_message_entity_1.ChatMessageEntity, (message) => message.session),
    __metadata("design:type", Array)
], ChatSessionEntity.prototype, "messages", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ChatSessionEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ChatSessionEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ChatSessionEntity.prototype, "closedAt", void 0);
exports.ChatSessionEntity = ChatSessionEntity = __decorate([
    (0, typeorm_1.Entity)('chat_sessions')
], ChatSessionEntity);
//# sourceMappingURL=chat-session.entity.js.map