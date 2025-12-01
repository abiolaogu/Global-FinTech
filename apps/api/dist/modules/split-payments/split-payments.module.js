"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SplitPaymentsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const split_payments_service_1 = require("./split-payments.service");
const split_payments_controller_1 = require("./split-payments.controller");
const split_payment_entity_1 = require("./entities/split-payment.entity");
const split_configuration_entity_1 = require("./entities/split-configuration.entity");
const wallets_module_1 = require("../wallets/wallets.module");
const event_emitter_1 = require("@nestjs/event-emitter");
let SplitPaymentsModule = class SplitPaymentsModule {
};
exports.SplitPaymentsModule = SplitPaymentsModule;
exports.SplitPaymentsModule = SplitPaymentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                split_payment_entity_1.SplitPaymentEntity,
                split_configuration_entity_1.SplitConfigurationEntity,
            ]),
            wallets_module_1.WalletsModule,
            event_emitter_1.EventEmitterModule.forRoot(),
        ],
        controllers: [split_payments_controller_1.SplitPaymentsController],
        providers: [split_payments_service_1.SplitPaymentsService],
        exports: [split_payments_service_1.SplitPaymentsService],
    })
], SplitPaymentsModule);
//# sourceMappingURL=split-payments.module.js.map