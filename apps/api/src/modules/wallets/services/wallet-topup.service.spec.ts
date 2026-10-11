import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource, Repository } from 'typeorm';
import { WalletTopupEntity } from '../entities/wallet-topup.entity';
import { WalletTransactionEntity } from '../entities/wallet-transaction.entity';
import { WalletEntity } from '../entities/wallet.entity';
import { WalletTopupService } from './wallet-topup.service';

describe('WalletTopupService', () => {
  const topup = Object.assign(new WalletTopupEntity(), {
    topupId: '18efed8a-9f05-46ec-8347-2d0384be19c6',
    walletId: '1775aa29-80a2-4660-b050-6fe934a8fed6',
    userId: 'd914fbe2-e825-4214-962c-f7dc39f5544c',
    amount: '25.00000000',
    sourceType: 'card',
    channel: 'internet',
    status: 'pending',
    reference: 'TOP-EXAMPLE',
    description: 'Wallet top-up',
    balanceBefore: '100.00000000',
    metadata: {},
  });

  const wallet = Object.assign(new WalletEntity(), {
    walletId: topup.walletId,
    userId: topup.userId,
    currency: 'USD',
    status: 'active',
    balance: '100.00000000',
    availableBalance: '100.00000000',
    lifetimeReceived: '0.00000000',
    transactionCount: 0,
  });

  it('persists the top-up reference and wallet currency on the ledger transaction', async () => {
    const manager = {
      findOne: jest.fn().mockResolvedValueOnce(topup).mockResolvedValueOnce(wallet),
      save: jest.fn(async (entity: unknown) => entity),
    };
    const queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager,
    };
    const dataSource = {
      createQueryRunner: jest.fn(() => queryRunner),
    } as unknown as DataSource;
    const service = new WalletTopupService(
      {} as Repository<WalletTopupEntity>,
      {} as Repository<WalletEntity>,
      {} as Repository<WalletTransactionEntity>,
      dataSource,
      { emit: jest.fn() } as unknown as EventEmitter2,
    );

    await service.completeTopup({ topupId: topup.topupId });

    const transaction = manager.save.mock.calls
      .map(([entity]) => entity)
      .find((entity) => entity instanceof WalletTransactionEntity) as WalletTransactionEntity;
    expect(transaction.referenceId).toBe(topup.reference);
    expect(transaction.currency).toBe(wallet.currency);
    expect(queryRunner.commitTransaction).toHaveBeenCalledTimes(1);
  });
});
