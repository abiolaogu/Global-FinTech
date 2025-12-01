import { Repository } from 'typeorm';
import { ChatSessionEntity } from '../entities/chat-session.entity';
import { ChatMessageEntity } from '../entities/chat-message.entity';
import { AIIntentService } from './ai-intent.service';
import { ActionExecutorService } from './action-executor.service';
export interface SendMessageDto {
    sessionId?: string;
    message: string;
    metadata?: any;
}
export interface ChatResponse {
    sessionId: string;
    messageId: string;
    response: string;
    intent?: any;
    actionResult?: any;
    requiresConfirmation?: boolean;
    confirmationData?: any;
}
export declare class AIChatService {
    private readonly sessionRepository;
    private readonly messageRepository;
    private readonly intentService;
    private readonly actionExecutor;
    private readonly logger;
    constructor(sessionRepository: Repository<ChatSessionEntity>, messageRepository: Repository<ChatMessageEntity>, intentService: AIIntentService, actionExecutor: ActionExecutorService);
    sendMessage(userId: string, dto: SendMessageDto): Promise<ChatResponse>;
    confirmAction(userId: string, sessionId: string, confirmationData: any): Promise<ChatResponse>;
    getSession(userId: string, sessionId: string): Promise<ChatSessionEntity>;
    getUserSessions(userId: string, limit?: number): Promise<ChatSessionEntity[]>;
    getMessages(userId: string, sessionId: string, limit?: number): Promise<ChatMessageEntity[]>;
    closeSession(userId: string, sessionId: string): Promise<void>;
    rateMessage(userId: string, messageId: string, isHelpful: boolean, feedback?: string): Promise<void>;
    private createSession;
    private saveMessage;
    private updateSession;
    private getConversationContext;
    private getTopicFromIntent;
}
