import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Wallets')
@Controller('wallets')
// @UseGuards(JwtAuthGuard) // Uncomment when auth is set up
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new wallet' })
  @ApiResponse({ status: 201, description: 'Wallet created successfully' })
  async createWallet(
    @Body()
    dto: {
      userId: string;
      currency: string;
      isPrimary?: boolean;
      metadata?: Record<string, any>;
      limits?: any;
    },
  ) {
    return this.walletsService.createWallet(dto);
  }

  @Post('transfer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Transfer funds between wallets' })
  @ApiResponse({ status: 200, description: 'Transfer completed successfully' })
  async transfer(
    @Body()
    dto: {
      fromWalletId: string;
      toWalletId: string;
      amount: string;
      description?: string;
      metadata?: Record<string, any>;
    },
  ) {
    return this.walletsService.transfer(dto);
  }

  @Post(':walletId/credit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Credit a wallet' })
  @ApiResponse({ status: 200, description: 'Wallet credited successfully' })
  async creditWallet(
    @Param('walletId') walletId: string,
    @Body()
    dto: {
      amount: string;
      category: string;
      description?: string;
      metadata?: Record<string, any>;
    },
  ) {
    return this.walletsService.creditWallet({
      walletId,
      ...dto,
    });
  }

  @Post(':walletId/debit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Debit a wallet' })
  @ApiResponse({ status: 200, description: 'Wallet debited successfully' })
  async debitWallet(
    @Param('walletId') walletId: string,
    @Body()
    dto: {
      amount: string;
      category: string;
      description?: string;
      metadata?: Record<string, any>;
    },
  ) {
    return this.walletsService.debitWallet({
      walletId,
      ...dto,
    });
  }

  @Post(':walletId/hold')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a hold on wallet funds' })
  @ApiResponse({ status: 200, description: 'Hold created successfully' })
  async createHold(
    @Param('walletId') walletId: string,
    @Body()
    dto: {
      amount: string;
      reason: string;
      description?: string;
      expiresAt?: Date;
      metadata?: Record<string, any>;
    },
  ) {
    return this.walletsService.createHold(
      walletId,
      dto.amount,
      dto.reason,
      dto.description,
      dto.expiresAt,
      dto.metadata,
    );
  }

  @Post('holds/:holdId/release')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Release a hold' })
  @ApiResponse({ status: 200, description: 'Hold released successfully' })
  async releaseHold(@Param('holdId') holdId: string) {
    return this.walletsService.releaseHold(holdId);
  }

  @Post('holds/:holdId/capture')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Capture a hold' })
  @ApiResponse({ status: 200, description: 'Hold captured successfully' })
  async captureHold(
    @Param('holdId') holdId: string,
    @Body() dto: { description?: string },
  ) {
    return this.walletsService.captureHold(holdId, dto.description);
  }

  @Get(':walletId')
  @ApiOperation({ summary: 'Get wallet details' })
  @ApiResponse({ status: 200, description: 'Wallet found' })
  async getWallet(@Param('walletId') walletId: string) {
    return this.walletsService.getWallet(walletId);
  }

  @Get(':walletId/balance')
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({ status: 200, description: 'Balance retrieved' })
  async getBalance(@Param('walletId') walletId: string) {
    return this.walletsService.getBalance(walletId);
  }

  @Get(':walletId/transactions')
  @ApiOperation({ summary: 'Get wallet transactions' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved' })
  async getTransactions(
    @Param('walletId') walletId: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
  ) {
    return this.walletsService.getWalletTransactions(walletId, limit, offset);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user wallets' })
  @ApiResponse({ status: 200, description: 'Wallets retrieved' })
  async getUserWallets(@Param('userId') userId: string) {
    return this.walletsService.getUserWallets(userId);
  }

  @Post(':walletId/freeze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Freeze a wallet' })
  @ApiResponse({ status: 200, description: 'Wallet frozen successfully' })
  async freezeWallet(
    @Param('walletId') walletId: string,
    @Body() dto: { reason: string },
  ) {
    return this.walletsService.freezeWallet(walletId, dto.reason);
  }

  @Post(':walletId/unfreeze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unfreeze a wallet' })
  @ApiResponse({ status: 200, description: 'Wallet unfrozen successfully' })
  async unfreezeWallet(@Param('walletId') walletId: string) {
    return this.walletsService.unfreezeWallet(walletId);
  }
}
