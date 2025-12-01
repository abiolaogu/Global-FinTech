"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletsController = void 0;
const common_1 = require("@nestjs/common");
const wallets_service_1 = require("./wallets.service");
const swagger_1 = require("@nestjs/swagger");
let WalletsController = class WalletsController {
    constructor(walletsService) {
        this.walletsService = walletsService;
    }
    async createWallet(dto) {
        return this.walletsService.createWallet(dto);
    }
    async transfer(dto) {
        return this.walletsService.transfer(dto);
    }
    async creditWallet(walletId, dto) {
        return this.walletsService.creditWallet(Object.assign({ walletId }, dto));
    }
    async debitWallet(walletId, dto) {
        return this.walletsService.debitWallet(Object.assign({ walletId }, dto));
    }
    async createHold(walletId, dto) {
        return this.walletsService.createHold(walletId, dto.amount, dto.reason, dto.description, dto.expiresAt, dto.metadata);
    }
    async releaseHold(holdId) {
        return this.walletsService.releaseHold(holdId);
    }
    async captureHold(holdId, dto) {
        return this.walletsService.captureHold(holdId, dto.description);
    }
    async getWallet(walletId) {
        return this.walletsService.getWallet(walletId);
    }
    async getBalance(walletId) {
        return this.walletsService.getBalance(walletId);
    }
    async getTransactions(walletId, limit = 50, offset = 0) {
        return this.walletsService.getWalletTransactions(walletId, limit, offset);
    }
    async getUserWallets(userId) {
        return this.walletsService.getUserWallets(userId);
    }
    async freezeWallet(walletId, dto) {
        return this.walletsService.freezeWallet(walletId, dto.reason);
    }
    async unfreezeWallet(walletId) {
        return this.walletsService.unfreezeWallet(walletId);
    }
};
exports.WalletsController = WalletsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new wallet' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Wallet created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "createWallet", null);
__decorate([
    (0, common_1.Post)('transfer'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Transfer funds between wallets' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transfer completed successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "transfer", null);
__decorate([
    (0, common_1.Post)(':walletId/credit'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Credit a wallet' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Wallet credited successfully' }),
    __param(0, (0, common_1.Param)('walletId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "creditWallet", null);
__decorate([
    (0, common_1.Post)(':walletId/debit'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Debit a wallet' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Wallet debited successfully' }),
    __param(0, (0, common_1.Param)('walletId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "debitWallet", null);
__decorate([
    (0, common_1.Post)(':walletId/hold'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Create a hold on wallet funds' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Hold created successfully' }),
    __param(0, (0, common_1.Param)('walletId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "createHold", null);
__decorate([
    (0, common_1.Post)('holds/:holdId/release'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Release a hold' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Hold released successfully' }),
    __param(0, (0, common_1.Param)('holdId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "releaseHold", null);
__decorate([
    (0, common_1.Post)('holds/:holdId/capture'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Capture a hold' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Hold captured successfully' }),
    __param(0, (0, common_1.Param)('holdId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "captureHold", null);
__decorate([
    (0, common_1.Get)(':walletId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get wallet details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Wallet found' }),
    __param(0, (0, common_1.Param)('walletId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "getWallet", null);
__decorate([
    (0, common_1.Get)(':walletId/balance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get wallet balance' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Balance retrieved' }),
    __param(0, (0, common_1.Param)('walletId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Get)(':walletId/transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get wallet transactions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transactions retrieved' }),
    __param(0, (0, common_1.Param)('walletId')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user wallets' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Wallets retrieved' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "getUserWallets", null);
__decorate([
    (0, common_1.Post)(':walletId/freeze'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Freeze a wallet' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Wallet frozen successfully' }),
    __param(0, (0, common_1.Param)('walletId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "freezeWallet", null);
__decorate([
    (0, common_1.Post)(':walletId/unfreeze'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Unfreeze a wallet' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Wallet unfrozen successfully' }),
    __param(0, (0, common_1.Param)('walletId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "unfreezeWallet", null);
exports.WalletsController = WalletsController = __decorate([
    (0, swagger_1.ApiTags)('Wallets'),
    (0, common_1.Controller)('wallets'),
    __metadata("design:paramtypes", [wallets_service_1.WalletsService])
], WalletsController);
//# sourceMappingURL=wallets.controller.js.map