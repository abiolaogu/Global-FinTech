import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AIChatService, SendMessageDto } from '../services/ai-chat.service';
declare class RateMessageDto {
    isHelpful: boolean;
    feedback?: string;
}
declare class ConfirmActionDto {
    confirmationData: any;
}
export declare class AIChatController {
    private readonly aiChatService;
    constructor(aiChatService: AIChatService);
    sendMessage(req: any, dto: SendMessageDto): Promise<import("../services/ai-chat.service").ChatResponse>;
    confirmAction(req: any, sessionId: string, dto: ConfirmActionDto): Promise<import("../services/ai-chat.service").ChatResponse>;
    getSessions(req: any, limit?: number): Promise<import("../entities/chat-session.entity").ChatSessionEntity[]>;
    getSession(req: any, sessionId: string): Promise<import("../entities/chat-session.entity").ChatSessionEntity>;
    getMessages(req: any, sessionId: string, limit?: number): Promise<import("../entities/chat-message.entity").ChatMessageEntity[]>;
    closeSession(req: any, sessionId: string): Promise<{
        message: string;
    }>;
    rateMessage(req: any, messageId: string, dto: RateMessageDto): Promise<{
        message: string;
    }>;
}
export declare class AIChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly aiChatService;
    server: Server;
    private readonly logger;
    private userSockets;
    constructor(aiChatService: AIChatService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleMessage(client: Socket, data: {
        message: string;
        sessionId?: string;
        metadata?: any;
    }): Promise<import("../services/ai-chat.service").ChatResponse | {
        error: string;
    }>;
    handleConfirmAction(client: Socket, data: {
        sessionId: string;
        confirmationData: any;
    }): Promise<import("../services/ai-chat.service").ChatResponse | {
        error: string;
    }>;
    handleStartSession(client: Socket, data: {
        metadata?: any;
    }): Promise<{
        error: string;
        message?: undefined;
        suggestions?: undefined;
    } | {
        message: string;
        suggestions: string[];
        error?: undefined;
    }>;
    handleGetSuggestions(client: Socket): Promise<{
        suggestions: {
            text: string;
            action: string;
        }[];
    }>;
    handleQuickAction(client: Socket, data: {
        action: string;
        sessionId?: string;
    }): Promise<import("../services/ai-chat.service").ChatResponse | {
        error: string;
    }>;
    notifyUser(userId: string, notification: any): Promise<void>;
}
export {};
