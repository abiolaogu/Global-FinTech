import { Repository } from 'typeorm';
import { AuditLogEntity } from './entities/audit-log.entity';
export interface AuditLogData {
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
    status: 'SUCCESS' | 'FAILURE';
    errorMessage?: string;
}
export declare class AuditService {
    private readonly auditLogRepository;
    private readonly logger;
    constructor(auditLogRepository: Repository<AuditLogEntity>);
    log(data: AuditLogData): Promise<void>;
    logUserAction(userId: string, action: string, resource: string, resourceId?: string, details?: any, ipAddress?: string, userAgent?: string): Promise<void>;
    logSystemAction(action: string, resource: string, resourceId?: string, details?: any): Promise<void>;
    logSecurityEvent(userId: string | null, action: string, details: any, ipAddress?: string, status?: 'SUCCESS' | 'FAILURE'): Promise<void>;
    getUserAuditLogs(userId: string, limit?: number): Promise<any>;
    getResourceAuditLogs(resource: string, resourceId: string, limit?: number): Promise<any>;
    getFailedActions(limit?: number): Promise<any>;
    getSecurityEvents(limit?: number): Promise<any>;
}
