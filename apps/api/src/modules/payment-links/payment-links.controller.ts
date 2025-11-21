import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentLinksService } from './payment-links.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Payment Links')
@Controller('payment-links')
export class PaymentLinksController {
  constructor(private readonly paymentLinksService: PaymentLinksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a payment link' })
  @ApiResponse({ status: 201, description: 'Payment link created successfully' })
  async createPaymentLink(
    @Body()
    dto: {
      userId: string;
      title: string;
      description?: string;
      amountType: 'fixed' | 'flexible' | 'minimum';
      amount?: string;
      currency: string;
      allowedPaymentMethods?: string[];
      redirectUrl?: string;
      collectCustomerInfo?: boolean;
      customFields?: Array<any>;
      logoUrl?: string;
      brandColor?: string;
      maxPayments?: number;
      expiresAt?: Date;
      splitConfigurationId?: string;
      metadata?: Record<string, any>;
    },
  ) {
    return this.paymentLinksService.createPaymentLink(dto);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get payment link by code' })
  @ApiResponse({ status: 200, description: 'Payment link found' })
  async getPaymentLinkByCode(@Param('code') code: string) {
    return this.paymentLinksService.getPaymentLinkByCode(code);
  }

  @Get(':linkId')
  @ApiOperation({ summary: 'Get payment link by ID' })
  @ApiResponse({ status: 200, description: 'Payment link found' })
  async getPaymentLink(@Param('linkId') linkId: string) {
    return this.paymentLinksService.getPaymentLink(linkId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user payment links' })
  @ApiResponse({ status: 200, description: 'Payment links retrieved' })
  async getUserPaymentLinks(@Param('userId') userId: string) {
    return this.paymentLinksService.getUserPaymentLinks(userId);
  }

  @Put(':linkId')
  @ApiOperation({ summary: 'Update payment link' })
  @ApiResponse({ status: 200, description: 'Payment link updated successfully' })
  async updatePaymentLink(
    @Param('linkId') linkId: string,
    @Body() updates: any,
  ) {
    return this.paymentLinksService.updatePaymentLink(linkId, updates);
  }

  @Post(':linkId/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate payment link' })
  @ApiResponse({ status: 200, description: 'Payment link deactivated' })
  async deactivatePaymentLink(@Param('linkId') linkId: string) {
    return this.paymentLinksService.deactivatePaymentLink(linkId);
  }

  @Post(':linkId/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate payment link' })
  @ApiResponse({ status: 200, description: 'Payment link activated' })
  async activatePaymentLink(@Param('linkId') linkId: string) {
    return this.paymentLinksService.activatePaymentLink(linkId);
  }

  @Post(':linkId/payment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record a payment for link' })
  @ApiResponse({ status: 200, description: 'Payment recorded' })
  async recordPayment(
    @Param('linkId') linkId: string,
    @Body() dto: { amount: string },
  ) {
    return this.paymentLinksService.recordPayment(linkId, dto.amount);
  }
}
