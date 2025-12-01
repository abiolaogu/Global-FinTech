import { ChatSessionEntity } from './chat-session.entity';
export declare enum MessageRole {
    USER = "user",
    ASSISTANT = "assistant",
    SYSTEM = "system"
}
export declare enum MessageStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare class ChatMessageEntity {
    messageId: string;
    sessionId: string;
    session: ChatSessionEntity;
    userId: string;
    role: MessageRole;
    content: string;
    status: MessageStatus;
    detectedIntent: string;
    intentConfidence: string;
    entities: any;
    alternatives: any;
    actionType: string;
    actionParams: any;
    actionStatus: string;
    actionResultId: string;
    actionError: string;
    context: any;
    references: string[];
    sentiment: string;
    sentimentScore: string;
    responseTime: number;
    modelVersion: string;
    tokensUsed: number;
    isHelpful: boolean;
    feedbackType: string;
    feedbackComment: string;
    metadata: any;
    isEdited: boolean;
    isDeleted: boolean;
    createdAt: Date;
}
