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
import { PaymentGatewaysService } from './payment-gateways.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Payment Gateways')
@Controller('payment-gateways')
export class PaymentGatewaysController {
  constructor(private readonly paymentGatewaysService: PaymentGatewaysService) {}

  @Post('payments/initiate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate a payment' })
  @ApiResponse({ status: 200, description: 'Payment initiated successfully' })
  async initiatePayment(
    @Body()
    dto: {
      userId?: string;
      merchantId?: string;
      amount: string;
      currency: string;
      provider: string;
      paymentMethod?: string;
      description?: string;
      customer?: {
        email: string;
        name?: string;
        phone?: string;
      };
      callbackUrl?: string;
      redirectUrl?: string;
      splitConfigurationId?: string;
      metadata?: Record<string, any>;
    },
  ) {
    const { provider, ...paymentDto } = dto;
    return this.paymentGatewaysService.initiatePayment(paymentDto, provider);
  }

  @Post('payments/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify a payment' })
  @ApiResponse({ status: 200, description: 'Payment verified successfully' })
  async verifyPayment(
    @Body()
    dto: {
      reference: string;
      provider: string;
    },
  ) {
    return this.paymentGatewaysService.verifyPayment(dto);
  }

  @Get('payments/:transactionId')
  @ApiOperation({ summary: 'Get payment transaction' })
  @ApiResponse({ status: 200, description: 'Transaction found' })
  async getTransaction(@Param('transactionId') transactionId: string) {
    return this.paymentGatewaysService.getTransaction(transactionId);
  }

  @Get('payments/user/:userId')
  @ApiOperation({ summary: 'Get user payment transactions' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved' })
  async getUserTransactions(
    @Param('userId') userId: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
  ) {
    return this.paymentGatewaysService.getUserTransactions(userId, limit, offset);
  }
}
