import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SplitPaymentsService } from './split-payments.service';
import { SplitPaymentEntity } from './entities/split-payment.entity';
import { SplitConfigurationEntity } from './entities/split-configuration.entity';
import { WalletsService } from '../wallets/wallets.service';

describe('SplitPaymentsService', () => {
  let service: SplitPaymentsService;

  const mockSplitPaymentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockConfigurationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
  };

  const mockWalletsService = {
    creditWallet: jest.fn(),
    createWallet: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(() => ({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
      },
    })),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SplitPaymentsService,
        {
          provide: getRepositoryToken(SplitPaymentEntity),
          useValue: mockSplitPaymentRepository,
        },
        {
          provide: getRepositoryToken(SplitConfigurationEntity),
          useValue: mockConfigurationRepository,
        },
        {
          provide: WalletsService,
          useValue: mockWalletsService,
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

    service = module.get<SplitPaymentsService>(SplitPaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createConfiguration', () => {
    it('should create a split configuration', async () => {
      const dto = {
        userId: 'user-123',
        name: 'Test Split',
        splitType: 'percentage' as const,
        splitRules: [
          {
            recipientId: 'recipient-1',
            recipientType: 'user' as const,
            splitType: 'percentage' as const,
            value: '70',
          },
          {
            recipientId: 'recipient-2',
            recipientType: 'user' as const,
            splitType: 'percentage' as const,
            value: '30',
          },
        ],
      };

      mockConfigurationRepository.create.mockReturnValue({
        configurationId: 'config-123',
        ...dto,
      });

      mockConfigurationRepository.save.mockResolvedValue({
        configurationId: 'config-123',
        ...dto,
      });

      const result = await service.createConfiguration(dto);

      expect(result.configurationId).toBeDefined();
      expect(result.name).toBe(dto.name);
    });
  });

  describe('getSplitPayment', () => {
    it('should get a split payment by ID', async () => {
      const splitPaymentId = 'split-123';
      const mockSplit = {
        splitPaymentId,
        totalAmount: '1000',
        status: 'completed',
      };

      mockSplitPaymentRepository.findOne.mockResolvedValue(mockSplit);

      const result = await service.getSplitPayment(splitPaymentId);

      expect(result).toEqual(mockSplit);
    });
  });
});
