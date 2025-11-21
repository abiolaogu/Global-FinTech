import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WalletsService } from './wallets.service';
import { WalletEntity } from './entities/wallet.entity';
import { WalletTransactionEntity } from './entities/wallet-transaction.entity';
import { WalletHoldEntity } from './entities/wallet-hold.entity';

describe('WalletsService', () => {
  let service: WalletsService;

  const mockWalletRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockTransactionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockHoldRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(() => ({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      },
    })),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletsService,
        {
          provide: getRepositoryToken(WalletEntity),
          useValue: mockWalletRepository,
        },
        {
          provide: getRepositoryToken(WalletTransactionEntity),
          useValue: mockTransactionRepository,
        },
        {
          provide: getRepositoryToken(WalletHoldEntity),
          useValue: mockHoldRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<WalletsService>(WalletsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createWallet', () => {
    it('should create a wallet successfully', async () => {
      const dto = {
        userId: 'user-123',
        currency: 'USD',
      };

      mockWalletRepository.findOne.mockResolvedValue(null);
      mockWalletRepository.create.mockReturnValue({ ...dto, walletId: 'wallet-123' });
      mockWalletRepository.save.mockResolvedValue({ ...dto, walletId: 'wallet-123' });

      const result = await service.createWallet(dto);

      expect(result.walletId).toBeDefined();
      expect(result.currency).toBe('USD');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('wallet.created', expect.any(Object));
    });

    it('should throw error if wallet already exists', async () => {
      const dto = {
        userId: 'user-123',
        currency: 'USD',
      };

      mockWalletRepository.findOne.mockResolvedValue({ walletId: 'existing-wallet' });

      await expect(service.createWallet(dto)).rejects.toThrow();
    });
  });

  describe('transfer', () => {
    it('should transfer funds between wallets', async () => {
      const dto = {
        fromWalletId: 'wallet-1',
        toWalletId: 'wallet-2',
        amount: '100',
      };

      const queryRunner = mockDataSource.createQueryRunner();
      queryRunner.manager.findOne
        .mockResolvedValueOnce({
          walletId: 'wallet-1',
          currency: 'USD',
          balance: '500',
          availableBalance: '500',
          userId: 'user-1',
        })
        .mockResolvedValueOnce({
          walletId: 'wallet-2',
          currency: 'USD',
          balance: '200',
          userId: 'user-2',
        });

      // Mock successful transfer
      // In a real test, you would mock the entire transaction flow
    });
  });
});
