"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const wallets_service_1 = require("./wallets.service");
const wallet_entity_1 = require("./entities/wallet.entity");
const wallet_transaction_entity_1 = require("./entities/wallet-transaction.entity");
const wallet_hold_entity_1 = require("./entities/wallet-hold.entity");
describe('WalletsService', () => {
    let service;
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
        const module = await testing_1.Test.createTestingModule({
            providers: [
                wallets_service_1.WalletsService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(wallet_entity_1.WalletEntity),
                    useValue: mockWalletRepository,
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(wallet_transaction_entity_1.WalletTransactionEntity),
                    useValue: mockTransactionRepository,
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(wallet_hold_entity_1.WalletHoldEntity),
                    useValue: mockHoldRepository,
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
        service = module.get(wallets_service_1.WalletsService);
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
            mockWalletRepository.create.mockReturnValue(Object.assign(Object.assign({}, dto), { walletId: 'wallet-123' }));
            mockWalletRepository.save.mockResolvedValue(Object.assign(Object.assign({}, dto), { walletId: 'wallet-123' }));
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
        });
    });
});
//# sourceMappingURL=wallets.service.spec.js.map