"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const split_payments_service_1 = require("./split-payments.service");
const split_payment_entity_1 = require("./entities/split-payment.entity");
const split_configuration_entity_1 = require("./entities/split-configuration.entity");
const wallets_service_1 = require("../wallets/wallets.service");
describe('SplitPaymentsService', () => {
    let service;
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
        const module = await testing_1.Test.createTestingModule({
            providers: [
                split_payments_service_1.SplitPaymentsService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(split_payment_entity_1.SplitPaymentEntity),
                    useValue: mockSplitPaymentRepository,
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(split_configuration_entity_1.SplitConfigurationEntity),
                    useValue: mockConfigurationRepository,
                },
                {
                    provide: wallets_service_1.WalletsService,
                    useValue: mockWalletsService,
                },
                {
                    provide: typeorm_2.DataSource,
                    useValue: mockDataSource,
                },
                {
                    provide: event_emitter_1.EventEmitter2,
                    useValue: mockEventEmitter,
                },
            ],
        }).compile();
        service = module.get(split_payments_service_1.SplitPaymentsService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('createConfiguration', () => {
        it('should create a split configuration', async () => {
            const dto = {
                userId: 'user-123',
                name: 'Test Split',
                splitType: 'percentage',
                splitRules: [
                    {
                        recipientId: 'recipient-1',
                        recipientType: 'user',
                        splitType: 'percentage',
                        value: '70',
                    },
                    {
                        recipientId: 'recipient-2',
                        recipientType: 'user',
                        splitType: 'percentage',
                        value: '30',
                    },
                ],
            };
            mockConfigurationRepository.create.mockReturnValue(Object.assign({ configurationId: 'config-123' }, dto));
            mockConfigurationRepository.save.mockResolvedValue(Object.assign({ configurationId: 'config-123' }, dto));
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
//# sourceMappingURL=split-payments.service.spec.js.map