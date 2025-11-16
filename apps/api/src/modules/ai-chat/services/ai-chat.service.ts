import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSessionEntity, SessionStatus } from '../entities/chat-session.entity';
import { ChatMessageEntity, MessageRole, MessageStatus } from '../entities/chat-message.entity';
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

@Injectable()
export class AIChatService {
  private readonly logger = new Logger(AIChatService.name);

  constructor(
    @InjectRepository(ChatSessionEntity)
    private readonly sessionRepository: Repository<ChatSessionEntity>,
    @InjectRepository(ChatMessageEntity)
    private readonly messageRepository: Repository<ChatMessageEntity>,
    private readonly intentService: AIIntentService,
    private readonly actionExecutor: ActionExecutorService,
  ) {}

  /**
   * Send a message to the AI chat
   */
  async sendMessage(userId: string, dto: SendMessageDto): Promise<ChatResponse> {
    // Get or create session
    let session: ChatSessionEntity;
    if (dto.sessionId) {
      session = await this.sessionRepository.findOne({
        where: { sessionId: dto.sessionId, userId },
      });
      if (!session) {
        throw new NotFoundException('Session not found');
      }
    } else {
      session = await this.createSession(userId, dto.metadata);
    }

    // Save user message
    const userMessage = await this.saveMessage({
      sessionId: session.sessionId,
      userId,
      role: MessageRole.USER,
      content: dto.message,
      status: MessageStatus.COMPLETED,
    });

    // Get conversation context
    const context = await this.getConversationContext(session.sessionId);

    // Detect intent
    const intent = await this.intentService.detectIntent(dto.message, context);

    this.logger.debug(`Detected intent: ${intent.name} (confidence: ${intent.confidence})`);

    // Update user message with intent
    await this.messageRepository.update(userMessage.messageId, {
      detectedIntent: intent.name,
      intentConfidence: intent.confidence.toString(),
      entities: intent.entities,
      alternatives: intent.alternatives,
    });

    // Generate initial response
    let response = this.intentService.generateResponse(intent, context);
    let actionResult = null;

    // Execute action if confidence is high enough
    if (intent.confidence >= 0.6 && intent.name !== 'unknown' && intent.name !== 'get_help') {
      try {
        actionResult = await this.actionExecutor.executeAction(intent, userId, context);

        if (actionResult.success) {
          response = actionResult.message;
        } else {
          response = actionResult.error || actionResult.message;
        }
      } catch (error) {
        this.logger.error(`Action execution failed: ${error.message}`, error.stack);
        response = 'I encountered an error processing your request. Please try again.';
      }
    } else if (intent.confidence < 0.6 && intent.alternatives?.length > 0) {
      // Low confidence - ask for clarification
      const alternativeNames = intent.alternatives.map((a) => a.name).join(', ');
      response = `I'm not quite sure what you meant. Did you want to: ${alternativeNames}?`;
    }

    // Save assistant message
    const assistantMessage = await this.saveMessage({
      sessionId: session.sessionId,
      userId,
      role: MessageRole.ASSISTANT,
      content: response,
      status: MessageStatus.COMPLETED,
      detectedIntent: intent.name,
      intentConfidence: intent.confidence.toString(),
      actionType: actionResult?.success ? intent.name : null,
      actionStatus: actionResult?.success ? 'completed' : actionResult ? 'failed' : null,
      actionResultId: actionResult?.data?.id || null,
      actionError: actionResult?.error || null,
    });

    // Update session
    await this.updateSession(session.sessionId, {
      messageCount: session.messageCount + 2,
      lastActivityAt: new Date(),
      lastIntent: intent.name,
      actionsExecuted: actionResult ? session.actionsExecuted + 1 : session.actionsExecuted,
      successfulActions: actionResult?.success
        ? session.successfulActions + 1
        : session.successfulActions,
      failedActions:
        actionResult && !actionResult.success
          ? session.failedActions + 1
          : session.failedActions,
    });

    return {
      sessionId: session.sessionId,
      messageId: assistantMessage.messageId,
      response,
      intent: {
        name: intent.name,
        confidence: intent.confidence,
        entities: intent.entities,
      },
      actionResult: actionResult?.data,
      requiresConfirmation: actionResult?.requiresConfirmation,
      confirmationData: actionResult?.confirmationData,
    };
  }

  /**
   * Confirm an action (for transactions, investments, etc.)
   */
  async confirmAction(
    userId: string,
    sessionId: string,
    confirmationData: any,
  ): Promise<ChatResponse> {
    const session = await this.sessionRepository.findOne({
      where: { sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Execute the confirmed action
    // This would integrate with actual services
    const response = `Action confirmed! Processing your ${confirmationData.action} request.`;

    const assistantMessage = await this.saveMessage({
      sessionId,
      userId,
      role: MessageRole.ASSISTANT,
      content: response,
      status: MessageStatus.COMPLETED,
      actionType: confirmationData.action,
      actionStatus: 'confirmed',
    });

    return {
      sessionId,
      messageId: assistantMessage.messageId,
      response,
    };
  }

  /**
   * Get chat session history
   */
  async getSession(userId: string, sessionId: string): Promise<ChatSessionEntity> {
    const session = await this.sessionRepository.findOne({
      where: { sessionId, userId },
      relations: ['messages'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId: string, limit = 20): Promise<ChatSessionEntity[]> {
    return this.sessionRepository.find({
      where: { userId },
      order: { lastActivityAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get messages for a session
   */
  async getMessages(
    userId: string,
    sessionId: string,
    limit = 50,
  ): Promise<ChatMessageEntity[]> {
    const session = await this.sessionRepository.findOne({
      where: { sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return this.messageRepository.find({
      where: { sessionId },
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }

  /**
   * Close a session
   */
  async closeSession(userId: string, sessionId: string): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await this.sessionRepository.update(sessionId, {
      status: SessionStatus.CLOSED,
      closedAt: new Date(),
    });
  }

  /**
   * Rate a message (thumbs up/down)
   */
  async rateMessage(
    userId: string,
    messageId: string,
    isHelpful: boolean,
    feedback?: string,
  ): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { messageId, userId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    await this.messageRepository.update(messageId, {
      isHelpful,
      feedbackType: isHelpful ? 'thumbs_up' : 'thumbs_down',
      feedbackComment: feedback,
    });
  }

  /**
   * Create a new chat session
   */
  private async createSession(
    userId: string,
    metadata?: any,
  ): Promise<ChatSessionEntity> {
    const session = this.sessionRepository.create({
      userId,
      status: SessionStatus.ACTIVE,
      lastActivityAt: new Date(),
      deviceType: metadata?.deviceType,
      platform: metadata?.platform,
      userAgent: metadata?.userAgent,
      ipAddress: metadata?.ipAddress,
    });

    return this.sessionRepository.save(session);
  }

  /**
   * Save a chat message
   */
  private async saveMessage(data: Partial<ChatMessageEntity>): Promise<ChatMessageEntity> {
    const message = this.messageRepository.create(data);
    return this.messageRepository.save(message);
  }

  /**
   * Update session data
   */
  private async updateSession(sessionId: string, data: Partial<ChatSessionEntity>): Promise<void> {
    await this.sessionRepository.update(sessionId, data);
  }

  /**
   * Get conversation context from recent messages
   */
  private async getConversationContext(sessionId: string): Promise<any> {
    const recentMessages = await this.messageRepository.find({
      where: { sessionId },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const lastIntent = recentMessages.find((m) => m.detectedIntent)?.detectedIntent;
    const topics = new Set(
      recentMessages
        .filter((m) => m.detectedIntent)
        .map((m) => this.getTopicFromIntent(m.detectedIntent)),
    );

    return {
      lastIntent,
      activeTopics: Array.from(topics),
      recentMessages: recentMessages.map((m) => ({
        role: m.role,
        content: m.content,
        intent: m.detectedIntent,
      })),
    };
  }

  /**
   * Extract topic from intent name
   */
  private getTopicFromIntent(intent: string): string {
    if (intent.includes('money') || intent.includes('payment')) return 'payments';
    if (intent.includes('invest')) return 'investments';
    if (intent.includes('rosca')) return 'rosca';
    if (intent.includes('loan')) return 'loans';
    if (intent.includes('balance') || intent.includes('transaction')) return 'accounts';
    return 'general';
  }
}
