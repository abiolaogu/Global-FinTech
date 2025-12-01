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
exports.RoscaController = void 0;
const common_1 = require("@nestjs/common");
const rosca_service_1 = require("./rosca.service");
let RoscaController = class RoscaController {
    constructor(roscaService) {
        this.roscaService = roscaService;
    }
    async createCircle(dto) {
        return this.roscaService.createCircle(dto);
    }
    async joinCircle(circleId, dto) {
        return this.roscaService.joinCircle(Object.assign(Object.assign({}, dto), { circleId }));
    }
    async makeContribution(dto) {
        return this.roscaService.makeContribution(dto);
    }
    async getUserCircles(userId) {
        return this.roscaService.getUserCircles(userId);
    }
    async getCircleDetails(circleId) {
        return this.roscaService.getCircleDetails(circleId);
    }
    async getUserContributions(circleId, userId) {
        return this.roscaService.getUserContributions(userId, circleId);
    }
    async searchCircles(currency, maxContribution, frequency) {
        return this.roscaService.searchCircles({
            currency,
            maxContribution,
            frequency,
        });
    }
};
exports.RoscaController = RoscaController;
__decorate([
    (0, common_1.Post)('circles'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoscaController.prototype, "createCircle", null);
__decorate([
    (0, common_1.Post)('circles/:circleId/join'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('circleId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RoscaController.prototype, "joinCircle", null);
__decorate([
    (0, common_1.Post)('contributions'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoscaController.prototype, "makeContribution", null);
__decorate([
    (0, common_1.Get)('users/:userId/circles'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoscaController.prototype, "getUserCircles", null);
__decorate([
    (0, common_1.Get)('circles/:circleId'),
    __param(0, (0, common_1.Param)('circleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoscaController.prototype, "getCircleDetails", null);
__decorate([
    (0, common_1.Get)('circles/:circleId/users/:userId/contributions'),
    __param(0, (0, common_1.Param)('circleId')),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RoscaController.prototype, "getUserContributions", null);
__decorate([
    (0, common_1.Get)('circles/search'),
    __param(0, (0, common_1.Query)('currency')),
    __param(1, (0, common_1.Query)('maxContribution')),
    __param(2, (0, common_1.Query)('frequency')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], RoscaController.prototype, "searchCircles", null);
exports.RoscaController = RoscaController = __decorate([
    (0, common_1.Controller)('rosca'),
    __metadata("design:paramtypes", [rosca_service_1.RoscaService])
], RoscaController);
//# sourceMappingURL=rosca.controller.js.map