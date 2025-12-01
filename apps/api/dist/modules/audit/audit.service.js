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
var AuditService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_entity_1 = require("./entities/audit-log.entity");
let AuditService = AuditService_1 = class AuditService {
    constructor(auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
        this.logger = new common_1.Logger(AuditService_1.name);
    }
    async log(data) {
        try {
            const auditLog = this.auditLogRepository.create({
                userId: data.userId || null,
                action: data.action,
                resource: data.resource,
                resourceId: data.resourceId || null,
                details: data.details || null,
                ipAddress: data.ipAddress || null,
                userAgent: data.userAgent || null,
                status: data.status,
                errorMessage: data.errorMessage || null,
            });
            await this.auditLogRepository.save(auditLog);
            this.logger.log(`Audit: ${data.action} on ${data.resource}${data.resourceId ? ` (${data.resourceId})` : ''} by user ${data.userId || 'SYSTEM'} - ${data.status}`);
        }
        catch (error) {
            this.logger.error('Failed to write audit log', error.stack);
        }
    }
    async logUserAction(userId, action, resource, resourceId, details, ipAddress, userAgent) {
        await this.log({
            userId,
            action,
            resource,
            resourceId,
            details,
            ipAddress,
            userAgent,
            status: 'SUCCESS',
        });
    }
    async logSystemAction(action, resource, resourceId, details) {
        await this.log({
            action,
            resource,
            resourceId,
            details,
            status: 'SUCCESS',
        });
    }
    async logSecurityEvent(userId, action, details, ipAddress, status = 'FAILURE') {
        await this.log({
            userId,
            action,
            resource: 'SECURITY',
            details,
            ipAddress,
            status,
        });
    }
    async getUserAuditLogs(userId, limit = 100) {
        return this.auditLogRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async getResourceAuditLogs(resource, resourceId, limit = 100) {
        return this.auditLogRepository.find({
            where: { resource, resourceId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async getFailedActions(limit = 100) {
        return this.auditLogRepository.find({
            where: { status: 'FAILURE' },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async getSecurityEvents(limit = 100) {
        return this.auditLogRepository.find({
            where: { resource: 'SECURITY' },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = AuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLogEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], AuditService);
//# sourceMappingURL=audit.service.js.map