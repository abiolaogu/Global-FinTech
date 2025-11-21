import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RecurringPaymentsService } from './recurring-payments.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Recurring Payments')
@Controller('recurring-payments')
export class RecurringPaymentsController {
  constructor(private readonly recurringPaymentsService: RecurringPaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a recurring payment' })
  @ApiResponse({ status: 201, description: 'Recurring payment created successfully' })
  async createRecurringPayment(
    @Body()
    dto: {
      userId: string;
      merchantId: string;
      name: string;
      description?: string;
      amount: string;
      currency: string;
      frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
      startDate: Date;
      endDate?: Date;
      maxPayments?: number;
      paymentMethod: string;
      paymentMethodToken: string;
      gatewayId: string;
      provider: string;
      authorizationCode?: string;
      metadata?: Record<string, any>;
    },
  ) {
    return this.recurringPaymentsService.createRecurringPayment(dto);
  }

  @Get(':recurringPaymentId')
  @ApiOperation({ summary: 'Get recurring payment' })
  @ApiResponse({ status: 200, description: 'Recurring payment found' })
  async getRecurringPayment(@Param('recurringPaymentId') recurringPaymentId: string) {
    return this.recurringPaymentsService.getRecurringPayment(recurringPaymentId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user recurring payments' })
  @ApiResponse({ status: 200, description: 'Recurring payments retrieved' })
  async getUserRecurringPayments(@Param('userId') userId: string) {
    return this.recurringPaymentsService.getUserRecurringPayments(userId);
  }

  @Get('merchant/:merchantId')
  @ApiOperation({ summary: 'Get merchant recurring payments' })
  @ApiResponse({ status: 200, description: 'Recurring payments retrieved' })
  async getMerchantRecurringPayments(@Param('merchantId') merchantId: string) {
    return this.recurringPaymentsService.getMerchantRecurringPayments(merchantId);
  }

  @Post(':recurringPaymentId/pause')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pause recurring payment' })
  @ApiResponse({ status: 200, description: 'Recurring payment paused' })
  async pauseRecurringPayment(@Param('recurringPaymentId') recurringPaymentId: string) {
    return this.recurringPaymentsService.pauseRecurringPayment(recurringPaymentId);
  }

  @Post(':recurringPaymentId/resume')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resume recurring payment' })
  @ApiResponse({ status: 200, description: 'Recurring payment resumed' })
  async resumeRecurringPayment(@Param('recurringPaymentId') recurringPaymentId: string) {
    return this.recurringPaymentsService.resumeRecurringPayment(recurringPaymentId);
  }

  @Post(':recurringPaymentId/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel recurring payment' })
  @ApiResponse({ status: 200, description: 'Recurring payment cancelled' })
  async cancelRecurringPayment(
    @Param('recurringPaymentId') recurringPaymentId: string,
    @Body() dto: { reason?: string },
  ) {
    return this.recurringPaymentsService.cancelRecurringPayment(recurringPaymentId, dto.reason);
  }
}
