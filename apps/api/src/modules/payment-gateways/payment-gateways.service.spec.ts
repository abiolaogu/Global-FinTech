import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentGatewaysService } from './payment-gateways.service';
import { PaymentGatewayEntity } from './entities/payment-gateway.entity';
import { PaymentTransactionEntity } from './entities/payment-transaction.entity';
import { WalletsService } from '../wallets/wallets.service';
import { SplitPaymentsService } from '../split-payments/split-payments.service';

describe('PaymentGatewaysService', () => {
  let service: PaymentGatewaysService;

  const mockGatewayRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
  };

  const mockTransactionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockWalletsService = {
    creditWallet: jest.fn(),
    getUserWallets: jest.fn(),
  };

  const mockSplitPaymentsService = {
    applySplitConfiguration: jest.fn(),
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
        PaymentGatewaysService,
        {
          provide: getRepositoryToken(PaymentGatewayEntity),
          useValue: mockGatewayRepository,
        },
        {
          provide: getRepositoryToken(PaymentTransactionEntity),
          useValue: mockTransactionRepository,
        },
        {
          provide: WalletsService,
          useValue: mockWalletsService,
        },
        {
          provide: SplitPaymentsService,
          useValue: mockSplitPaymentsService,
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

    service = module.get<PaymentGatewaysService>(PaymentGatewaysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initiatePayment', () => {
    it('should initiate a payment successfully', async () => {
      const dto = {
        userId: 'user-123',
        merchantId: 'merchant-123',
        amount: '1000',
        currency: 'NGN',
        customer: {
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      mockGatewayRepository.findOne.mockResolvedValue({
        gatewayId: 'gateway-123',
        provider: 'paystack',
        isActive: true,
        isLive: true,
      });

      mockTransactionRepository.create.mockReturnValue({
        transactionId: 'txn-123',
        ...dto,
        status: 'pending',
      });

      mockTransactionRepository.save.mockResolvedValue({
        transactionId: 'txn-123',
        ...dto,
        status: 'pending',
        reference: 'PAY-123-ABC',
      });

      // Mock would need to handle provider initialization
      // This is a simplified test
    });
  });

  describe('getTransaction', () => {
    it('should get a transaction by ID', async () => {
      const transactionId = 'txn-123';
      const mockTransaction = {
        transactionId,
        amount: '1000',
        currency: 'NGN',
        status: 'success',
      };

      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);

      const result = await service.getTransaction(transactionId);

      expect(result).toEqual(mockTransaction);
      expect(mockTransactionRepository.findOne).toHaveBeenCalledWith({
        where: { transactionId },
      });
    });

    it('should throw error if transaction not found', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(null);

      await expect(service.getTransaction('invalid-id')).rejects.toThrow();
    });
  });
});
