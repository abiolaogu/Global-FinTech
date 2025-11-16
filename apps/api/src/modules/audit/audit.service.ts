import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditLogRepository: Repository<AuditLogEntity>,
  ) {}

  async log(data: AuditLogData): Promise<void> {
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

      this.logger.log(
        `Audit: ${data.action} on ${data.resource}${data.resourceId ? ` (${data.resourceId})` : ''} by user ${data.userId || 'SYSTEM'} - ${data.status}`,
      );
    } catch (error) {
      this.logger.error('Failed to write audit log', error.stack);
      // Don't throw - audit logging failures shouldn't break operations
    }
  }

  async logUserAction(
    userId: string,
    action: string,
    resource: string,
    resourceId?: string,
    details?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
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

  async logSystemAction(
    action: string,
    resource: string,
    resourceId?: string,
    details?: any,
  ): Promise<void> {
    await this.log({
      action,
      resource,
      resourceId,
      details,
      status: 'SUCCESS',
    });
  }

  async logSecurityEvent(
    userId: string | null,
    action: string,
    details: any,
    ipAddress?: string,
    status: 'SUCCESS' | 'FAILURE' = 'FAILURE',
  ): Promise<void> {
    await this.log({
      userId,
      action,
      resource: 'SECURITY',
      details,
      ipAddress,
      status,
    });
  }

  async getUserAuditLogs(userId: string, limit: number = 100) {
    return this.auditLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' as any },
      take: limit,
    });
  }

  async getResourceAuditLogs(resource: string, resourceId: string, limit: number = 100) {
    return this.auditLogRepository.find({
      where: { resource, resourceId },
      order: { createdAt: 'DESC' as any },
      take: limit,
    });
  }

  async getFailedActions(limit: number = 100) {
    return this.auditLogRepository.find({
      where: { status: 'FAILURE' },
      order: { createdAt: 'DESC' as any },
      take: limit,
    });
  }

  async getSecurityEvents(limit: number = 100) {
    return this.auditLogRepository.find({
      where: { resource: 'SECURITY' },
      order: { createdAt: 'DESC' as any },
      take: limit,
    });
  }
}
