import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RealtimePaymentsService, InitiatePaymentDto, RegisterRailConnectionDto } from './realtime-payments.service';

@Controller('realtime-payments')
export class RealtimePaymentsController {
  constructor(private readonly realtimePaymentsService: RealtimePaymentsService) {}

  /**
   * Register a new payment rail connection
   * POST /realtime-payments/connections
   */
  @Post('connections')
  @HttpCode(HttpStatus.CREATED)
  async registerConnection(@Body() dto: RegisterRailConnectionDto) {
    return this.realtimePaymentsService.registerRailConnection(dto);
  }

  /**
   * Test a payment rail connection
   * POST /realtime-payments/connections/:connectionId/test
   */
  @Post('connections/:connectionId/test')
  async testConnection(@Param('connectionId') connectionId: string) {
    const isHealthy = await this.realtimePaymentsService.testConnection(connectionId);

    return {
      connectionId,
      healthy: isHealthy,
      message: isHealthy ? 'Connection is healthy' : 'Connection test failed',
    };
  }

  /**
   * Initiate a real-time payment
   * POST /realtime-payments/pay
   */
  @Post('pay')
  @HttpCode(HttpStatus.CREATED)
  async initiatePayment(@Body() dto: InitiatePaymentDto) {
    return this.realtimePaymentsService.initiatePayment(dto);
  }

  /**
   * Get payment details
   * GET /realtime-payments/:paymentId
   */
  @Get(':paymentId')
  async getPayment(@Param('paymentId') paymentId: string) {
    return this.realtimePaymentsService.getPayment(paymentId);
  }

  /**
   * Get user's payment history
   * GET /realtime-payments/user/:userId
   */
  @Get('user/:userId')
  async getUserPayments(
    @Param('userId') userId: string,
    @Query('type') type?: 'sent' | 'received' | 'all',
    @Query('limit') limit?: string,
  ) {
    return this.realtimePaymentsService.getUserPayments(
      userId,
      type || 'all',
      limit ? parseInt(limit, 10) : 50,
    );
  }

  /**
   * Get payment statistics
   * GET /realtime-payments/stats
   */
  @Get('stats/summary')
  async getStats(
    @Query('railType') railType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.realtimePaymentsService.getPaymentStats(
      railType,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}
