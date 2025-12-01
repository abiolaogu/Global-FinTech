"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const payment_gateways_service_1 = require("./payment-gateways.service");
const payment_gateway_entity_1 = require("./entities/payment-gateway.entity");
const payment_transaction_entity_1 = require("./entities/payment-transaction.entity");
const wallets_service_1 = require("../wallets/wallets.service");
const split_payments_service_1 = require("../split-payments/split-payments.service");
describe('PaymentGatewaysService', () => {
    let service;
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
        const module = await testing_1.Test.createTestingModule({
            providers: [
                payment_gateways_service_1.PaymentGatewaysService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(payment_gateway_entity_1.PaymentGatewayEntity),
                    useValue: mockGatewayRepository,
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(payment_transaction_entity_1.PaymentTransactionEntity),
                    useValue: mockTransactionRepository,
                },
                {
                    provide: wallets_service_1.WalletsService,
                    useValue: mockWalletsService,
                },
                {
                    provide: split_payments_service_1.SplitPaymentsService,
                    useValue: mockSplitPaymentsService,
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
        service = module.get(payment_gateways_service_1.PaymentGatewaysService);
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
            mockTransactionRepository.create.mockReturnValue(Object.assign(Object.assign({ transactionId: 'txn-123' }, dto), { status: 'pending' }));
            mockTransactionRepository.save.mockResolvedValue(Object.assign(Object.assign({ transactionId: 'txn-123' }, dto), { status: 'pending', reference: 'PAY-123-ABC' }));
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
//# sourceMappingURL=payment-gateways.service.spec.js.map