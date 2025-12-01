import { ChatMessageEntity } from './chat-message.entity';
export declare enum SessionStatus {
    ACTIVE = "active",
    IDLE = "idle",
    CLOSED = "closed"
}
export declare class ChatSessionEntity {
    sessionId: string;
    userId: string;
    status: SessionStatus;
    title: string;
    messageCount: number;
    lastActivityAt: Date;
    context: any;
    activeTopics: string[];
    lastIntent: string;
    userPreferences: any;
    deviceType: string;
    platform: string;
    userAgent: string;
    ipAddress: string;
    actionsExecuted: number;
    successfulActions: number;
    failedActions: number;
    satisfactionScore: string;
    messages: ChatMessageEntity[];
    createdAt: Date;
    updatedAt: Date;
    closedAt: Date;
}
