"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGatewaysModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const payment_gateways_service_1 = require("./payment-gateways.service");
const payment_gateways_controller_1 = require("./payment-gateways.controller");
const payment_gateway_entity_1 = require("./entities/payment-gateway.entity");
const payment_transaction_entity_1 = require("./entities/payment-transaction.entity");
const wallets_module_1 = require("../wallets/wallets.module");
const split_payments_module_1 = require("../split-payments/split-payments.module");
const event_emitter_1 = require("@nestjs/event-emitter");
let PaymentGatewaysModule = class PaymentGatewaysModule {
};
exports.PaymentGatewaysModule = PaymentGatewaysModule;
exports.PaymentGatewaysModule = PaymentGatewaysModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                payment_gateway_entity_1.PaymentGatewayEntity,
                payment_transaction_entity_1.PaymentTransactionEntity,
            ]),
            wallets_module_1.WalletsModule,
            split_payments_module_1.SplitPaymentsModule,
            event_emitter_1.EventEmitterModule.forRoot(),
        ],
        controllers: [payment_gateways_controller_1.PaymentGatewaysController],
        providers: [payment_gateways_service_1.PaymentGatewaysService],
        exports: [payment_gateways_service_1.PaymentGatewaysService],
    })
], PaymentGatewaysModule);
//# sourceMappingURL=payment-gateways.module.js.map