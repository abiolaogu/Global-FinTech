export declare class AuditLogEntity {
    logId: string;
    userId: string | null;
    action: string;
    resource: string;
    resourceId: string | null;
    details: any;
    ipAddress: string | null;
    userAgent: string | null;
    status: 'SUCCESS' | 'FAILURE';
    errorMessage: string | null;
    createdAt: Date;
}
