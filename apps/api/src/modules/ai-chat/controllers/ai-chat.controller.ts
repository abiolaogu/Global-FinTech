import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AIChatService, SendMessageDto } from '../services/ai-chat.service';
import { Logger } from '@nestjs/common';

class RateMessageDto {
  isHelpful: boolean;
  feedback?: string;
}

class ConfirmActionDto {
  confirmationData: any;
}

/**
 * REST API Controller for AI Chat
 */
@Controller('ai-chat')
// @UseGuards(AuthGuard)
export class AIChatController {
  constructor(private readonly aiChatService: AIChatService) {}

  /**
   * Send message to AI (REST endpoint)
   */
  @Post('messages')
  @HttpCode(HttpStatus.OK)
  async sendMessage(@Request() req, @Body() dto: SendMessageDto) {
    const userId = req.user?.userId || 'usr_demo';
    return this.aiChatService.sendMessage(userId, dto);
  }

  /**
   * Confirm an action
   */
  @Post('sessions/:sessionId/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmAction(
    @Request() req,
    @Param('sessionId') sessionId: string,
    @Body() dto: ConfirmActionDto,
  ) {
    const userId = req.user?.userId || 'usr_demo';
    return this.aiChatService.confirmAction(userId, sessionId, dto.confirmationData);
  }

  /**
   * Get user's chat sessions
   */
  @Get('sessions')
  async getSessions(@Request() req, @Query('limit') limit?: number) {
    const userId = req.user?.userId || 'usr_demo';
    return this.aiChatService.getUserSessions(userId, limit);
  }

  /**
   * Get session details with messages
   */
  @Get('sessions/:sessionId')
  async getSession(@Request() req, @Param('sessionId') sessionId: string) {
    const userId = req.user?.userId || 'usr_demo';
    return this.aiChatService.getSession(userId, sessionId);
  }

  /**
   * Get messages for a session
   */
  @Get('sessions/:sessionId/messages')
  async getMessages(
    @Request() req,
    @Param('sessionId') sessionId: string,
    @Query('limit') limit?: number,
  ) {
    const userId = req.user?.userId || 'usr_demo';
    return this.aiChatService.getMessages(userId, sessionId, limit);
  }

  /**
   * Close a session
   */
  @Post('sessions/:sessionId/close')
  @HttpCode(HttpStatus.OK)
  async closeSession(@Request() req, @Param('sessionId') sessionId: string) {
    const userId = req.user?.userId || 'usr_demo';
    await this.aiChatService.closeSession(userId, sessionId);
    return { message: 'Session closed successfully' };
  }

  /**
   * Rate a message (thumbs up/down)
   */
  @Post('messages/:messageId/rate')
  @HttpCode(HttpStatus.OK)
  async rateMessage(
    @Request() req,
    @Param('messageId') messageId: string,
    @Body() dto: RateMessageDto,
  ) {
    const userId = req.user?.userId || 'usr_demo';
    await this.aiChatService.rateMessage(userId, messageId, dto.isHelpful, dto.feedback);
    return { message: 'Feedback recorded successfully' };
  }
}

/**
 * WebSocket Gateway for Real-time AI Chat
 * Similar to Bank of America's Erica interface
 */
@WebSocketGateway({
  cors: {
    origin: '*', // Configure based on your frontend URL
  },
  namespace: '/ai-chat',
})
export class AIChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AIChatGateway.name);
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(private readonly aiChatService: AIChatService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.auth?.userId || client.handshake.query?.userId;

    if (userId) {
      this.userSockets.set(userId as string, client.id);
      this.logger.log(`User ${userId} connected with socket ${client.id}`);

      client.emit('connected', {
        message: 'Connected to AtlasX AI Assistant',
        features: [
          'Send & receive money',
          'Check balances',
          'Invest in opportunities',
          'Join ROSCA circles',
          'Apply for loans',
          'Manage your account',
        ],
      });
    } else {
      this.logger.warn(`Connection attempt without userId from ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = Array.from(this.userSockets.entries())
      .find(([_, socketId]) => socketId === client.id)?.[0];

    if (userId) {
      this.userSockets.delete(userId);
      this.logger.log(`User ${userId} disconnected`);
    }
  }

  /**
   * Handle incoming chat messages via WebSocket
   */
  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { message: string; sessionId?: string; metadata?: any },
  ) {
    const userId = client.handshake.auth?.userId || client.handshake.query?.userId;

    if (!userId) {
      return { error: 'Unauthorized' };
    }

    try {
      // Show typing indicator
      client.emit('assistant_typing', { typing: true });

      // Process message
      const response = await this.aiChatService.sendMessage(userId as string, {
        sessionId: data.sessionId,
        message: data.message,
        metadata: data.metadata,
      });

      // Stop typing indicator
      client.emit('assistant_typing', { typing: false });

      // Send response
      client.emit('message_response', response);

      return response;
    } catch (error) {
      this.logger.error(`Error processing message: ${error.message}`, error.stack);
      client.emit('assistant_typing', { typing: false });
      client.emit('error', { message: 'Failed to process message' });
      return { error: 'Failed to process message' };
    }
  }

  /**
   * Confirm an action via WebSocket
   */
  @SubscribeMessage('confirm_action')
  async handleConfirmAction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; confirmationData: any },
  ) {
    const userId = client.handshake.auth?.userId || client.handshake.query?.userId;

    if (!userId) {
      return { error: 'Unauthorized' };
    }

    try {
      const response = await this.aiChatService.confirmAction(
        userId as string,
        data.sessionId,
        data.confirmationData,
      );

      client.emit('action_confirmed', response);
      return response;
    } catch (error) {
      this.logger.error(`Error confirming action: ${error.message}`, error.stack);
      client.emit('error', { message: 'Failed to confirm action' });
      return { error: 'Failed to confirm action' };
    }
  }

  /**
   * Start a new session
   */
  @SubscribeMessage('start_session')
  async handleStartSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { metadata?: any },
  ) {
    const userId = client.handshake.auth?.userId || client.handshake.query?.userId;

    if (!userId) {
      return { error: 'Unauthorized' };
    }

    // Session will be created automatically on first message
    return {
      message: 'Ready to assist you! How can I help today?',
      suggestions: [
        'Check my balance',
        'Send money to someone',
        'Show my investment portfolio',
        'Find ROSCA circles',
        'Apply for a loan',
      ],
    };
  }

  /**
   * Get quick action suggestions
   */
  @SubscribeMessage('get_suggestions')
  async handleGetSuggestions(@ConnectedSocket() client: Socket) {
    return {
      suggestions: [
        { text: 'Check balance', action: 'check_balance' },
        { text: 'Send money', action: 'send_money' },
        { text: 'View investments', action: 'view_investments' },
        { text: 'Join ROSCA', action: 'join_rosca' },
        { text: 'Apply for loan', action: 'apply_loan' },
        { text: 'Transaction history', action: 'view_transactions' },
      ],
    };
  }

  /**
   * Handle quick action taps
   */
  @SubscribeMessage('quick_action')
  async handleQuickAction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { action: string; sessionId?: string },
  ) {
    const userId = client.handshake.auth?.userId || client.handshake.query?.userId;

    if (!userId) {
      return { error: 'Unauthorized' };
    }

    // Map action to natural language message
    const actionMessages = {
      check_balance: 'Check my balance',
      send_money: 'I want to send money',
      view_investments: 'Show my investment portfolio',
      join_rosca: 'Show me ROSCA circles',
      apply_loan: 'I want to apply for a loan',
      view_transactions: 'Show my recent transactions',
    };

    const message = actionMessages[data.action] || data.action;

    // Process as regular message
    return this.handleMessage(client, {
      message,
      sessionId: data.sessionId,
    });
  }

  /**
   * Broadcast a notification to a specific user
   */
  async notifyUser(userId: string, notification: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', notification);
    }
  }
}
