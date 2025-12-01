"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecurringPaymentsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const recurring_payments_service_1 = require("./recurring-payments.service");
const recurring_payments_controller_1 = require("./recurring-payments.controller");
const recurring_payment_entity_1 = require("./entities/recurring-payment.entity");
const payment_gateways_module_1 = require("../payment-gateways/payment-gateways.module");
const event_emitter_1 = require("@nestjs/event-emitter");
let RecurringPaymentsModule = class RecurringPaymentsModule {
};
exports.RecurringPaymentsModule = RecurringPaymentsModule;
exports.RecurringPaymentsModule = RecurringPaymentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([recurring_payment_entity_1.RecurringPaymentEntity]),
            payment_gateways_module_1.PaymentGatewaysModule,
            event_emitter_1.EventEmitterModule.forRoot(),
        ],
        controllers: [recurring_payments_controller_1.RecurringPaymentsController],
        providers: [recurring_payments_service_1.RecurringPaymentsService],
        exports: [recurring_payments_service_1.RecurringPaymentsService],
    })
], RecurringPaymentsModule);
//# sourceMappingURL=recurring-payments.module.js.map