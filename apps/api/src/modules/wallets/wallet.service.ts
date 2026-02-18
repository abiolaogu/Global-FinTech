import { Injectable, NotFoundException } from '@nestjs/common';
import { WalletsService } from './wallets.service';

interface WalletMovementInput {
  user_id: string;
  amount: number | string;
  currency: string;
  description?: string;
  reference?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class WalletService {
  constructor(private readonly walletsService: WalletsService) {}

  async debit(input: WalletMovementInput): Promise<{ transaction_id: string }> {
    const walletId = await this.resolveWalletId(input.user_id, input.currency);
    const transaction = await this.walletsService.debitWallet({
      walletId,
      amount: String(input.amount),
      category: 'marketplace_purchase',
      description: input.description,
      metadata: {
        ...input.metadata,
        reference: input.reference,
      },
      externalTransactionId: input.reference,
      paymentMethod: 'wallet',
      paymentGateway: 'internal',
    });

    return { transaction_id: transaction.transactionId };
  }

  async credit(
    input: WalletMovementInput,
  ): Promise<{ transaction_id: string }> {
    const walletId = await this.resolveWalletId(input.user_id, input.currency);
    const transaction = await this.walletsService.creditWallet({
      walletId,
      amount: String(input.amount),
      category: 'marketplace_refund',
      description: input.description,
      metadata: {
        ...input.metadata,
        reference: input.reference,
      },
      externalTransactionId: input.reference,
      paymentMethod: 'wallet',
      paymentGateway: 'internal',
    });

    return { transaction_id: transaction.transactionId };
  }

  private async resolveWalletId(
    userId: string,
    currency: string,
  ): Promise<string> {
    const wallets = await this.walletsService.getUserWallets(userId);
    const normalized = currency.toUpperCase();
    const selected =
      wallets.find((wallet) => wallet.currency.toUpperCase() === normalized) ||
      wallets.find((wallet) => wallet.isPrimary) ||
      wallets[0];

    if (!selected) {
      throw new NotFoundException(
        `No wallet found for user ${userId} (${currency})`,
      );
    }

    return selected.walletId;
  }
}
