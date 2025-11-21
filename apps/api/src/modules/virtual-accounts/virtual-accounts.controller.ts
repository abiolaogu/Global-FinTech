import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Headers,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { VirtualAccountsService } from './virtual-accounts.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Virtual Accounts')
@Controller('virtual-accounts')
export class VirtualAccountsController {
  constructor(private readonly virtualAccountsService: VirtualAccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a virtual account' })
  @ApiResponse({ status: 201, description: 'Virtual account created successfully' })
  async createVirtualAccount(
    @Body()
    dto: {
      userId: string;
      walletId?: string;
      currency: string;
      country: string;
      provider: 'paystack' | 'flutterwave' | 'woven' | 'budpay' | 'monnify' | 'korapay';
      accountType?: 'dedicated' | 'dynamic' | 'pooled';
      accountName?: string;
      autoCredit?: boolean;
      metadata?: Record<string, any>;
    },
  ) {
    return this.virtualAccountsService.createVirtualAccount(dto);
  }

  @Post(':virtualAccountId/payment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process a payment to virtual account' })
  @ApiResponse({ status: 200, description: 'Payment processed successfully' })
  async processPayment(
    @Param('virtualAccountId') virtualAccountId: string,
    @Body()
    dto: {
      amount: string;
      currency: string;
      senderAccountNumber?: string;
      senderAccountName?: string;
      senderBankName?: string;
      senderBankCode?: string;
      reference?: string;
      sessionId?: string;
      narration?: string;
      providerTransactionId?: string;
      providerData?: Record<string, any>;
      fee?: string;
    },
  ) {
    return this.virtualAccountsService.processPayment({
      virtualAccountId,
      ...dto,
    });
  }

  @Post('webhook/:provider')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle provider webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleWebhook(
    @Param('provider') provider: string,
    @Headers('x-paystack-signature') paystackSignature: string,
    @Headers('verif-hash') flutterwaveSignature: string,
    @Body() payload: any,
  ) {
    const signature = paystackSignature || flutterwaveSignature || '';
    return this.virtualAccountsService.handleWebhook(provider, payload, signature);
  }

  @Get(':virtualAccountId')
  @ApiOperation({ summary: 'Get virtual account details' })
  @ApiResponse({ status: 200, description: 'Virtual account found' })
  async getVirtualAccount(@Param('virtualAccountId') virtualAccountId: string) {
    return this.virtualAccountsService.getVirtualAccount(virtualAccountId);
  }

  @Get(':virtualAccountId/transactions')
  @ApiOperation({ summary: 'Get virtual account transactions' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved' })
  async getTransactions(
    @Param('virtualAccountId') virtualAccountId: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
  ) {
    return this.virtualAccountsService.getVirtualAccountTransactions(
      virtualAccountId,
      limit,
      offset,
    );
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user virtual accounts' })
  @ApiResponse({ status: 200, description: 'Virtual accounts retrieved' })
  async getUserVirtualAccounts(@Param('userId') userId: string) {
    return this.virtualAccountsService.getUserVirtualAccounts(userId);
  }

  @Post(':virtualAccountId/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspend a virtual account' })
  @ApiResponse({ status: 200, description: 'Account suspended successfully' })
  async suspendVirtualAccount(
    @Param('virtualAccountId') virtualAccountId: string,
    @Body() dto: { reason: string },
  ) {
    return this.virtualAccountsService.suspendVirtualAccount(virtualAccountId, dto.reason);
  }

  @Post(':virtualAccountId/reactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reactivate a virtual account' })
  @ApiResponse({ status: 200, description: 'Account reactivated successfully' })
  async reactivateVirtualAccount(@Param('virtualAccountId') virtualAccountId: string) {
    return this.virtualAccountsService.reactivateVirtualAccount(virtualAccountId);
  }
}
