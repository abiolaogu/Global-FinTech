import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SplitPaymentsService } from './split-payments.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Split Payments')
@Controller('split-payments')
export class SplitPaymentsController {
  constructor(private readonly splitPaymentsService: SplitPaymentsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process a split payment' })
  @ApiResponse({ status: 200, description: 'Split payment processed successfully' })
  async processSplitPayment(
    @Body()
    dto: {
      paymentId: string;
      userId: string;
      totalAmount: string;
      currency: string;
      splitRules: Array<any>;
      platformFee?: string;
      description?: string;
      metadata?: Record<string, any>;
    },
  ) {
    return this.splitPaymentsService.processSplitPayment(dto);
  }

  @Post('configurations')
  @ApiOperation({ summary: 'Create a split configuration' })
  @ApiResponse({ status: 201, description: 'Configuration created successfully' })
  async createConfiguration(
    @Body()
    dto: {
      userId: string;
      name: string;
      description?: string;
      splitType: 'percentage' | 'fixed' | 'hybrid';
      splitRules: Array<any>;
      isDefault?: boolean;
      conditions?: any;
    },
  ) {
    return this.splitPaymentsService.createConfiguration(dto);
  }

  @Post('configurations/:configurationId/apply')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Apply a split configuration to a payment' })
  @ApiResponse({ status: 200, description: 'Configuration applied successfully' })
  async applySplitConfiguration(
    @Param('configurationId') configurationId: string,
    @Body()
    dto: {
      paymentId: string;
      userId: string;
      totalAmount: string;
      currency: string;
    },
  ) {
    return this.splitPaymentsService.applySplitConfiguration(
      configurationId,
      dto.paymentId,
      dto.userId,
      dto.totalAmount,
      dto.currency,
    );
  }

  @Get(':splitPaymentId')
  @ApiOperation({ summary: 'Get split payment details' })
  @ApiResponse({ status: 200, description: 'Split payment found' })
  async getSplitPayment(@Param('splitPaymentId') splitPaymentId: string) {
    return this.splitPaymentsService.getSplitPayment(splitPaymentId);
  }

  @Get('payment/:paymentId')
  @ApiOperation({ summary: 'Get splits for a payment' })
  @ApiResponse({ status: 200, description: 'Payment splits retrieved' })
  async getPaymentSplits(@Param('paymentId') paymentId: string) {
    return this.splitPaymentsService.getPaymentSplits(paymentId);
  }

  @Get('user/:userId/configurations')
  @ApiOperation({ summary: 'Get user split configurations' })
  @ApiResponse({ status: 200, description: 'Configurations retrieved' })
  async getUserConfigurations(@Param('userId') userId: string) {
    return this.splitPaymentsService.getUserConfigurations(userId);
  }
}
