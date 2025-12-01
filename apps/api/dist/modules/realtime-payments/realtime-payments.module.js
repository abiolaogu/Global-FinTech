"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimePaymentsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const realtime_payments_service_1 = require("./realtime-payments.service");
const realtime_payments_controller_1 = require("./realtime-payments.controller");
const realtime_payment_entity_1 = require("./entities/realtime-payment.entity");
const payment_rail_connection_entity_1 = require("./entities/payment-rail-connection.entity");
const event_emitter_1 = require("@nestjs/event-emitter");
let RealtimePaymentsModule = class RealtimePaymentsModule {
};
exports.RealtimePaymentsModule = RealtimePaymentsModule;
exports.RealtimePaymentsModule = RealtimePaymentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([realtime_payment_entity_1.RealtimePaymentEntity, payment_rail_connection_entity_1.PaymentRailConnectionEntity]),
            event_emitter_1.EventEmitterModule,
        ],
        controllers: [realtime_payments_controller_1.RealtimePaymentsController],
        providers: [realtime_payments_service_1.RealtimePaymentsService],
        exports: [realtime_payments_service_1.RealtimePaymentsService],
    })
], RealtimePaymentsModule);
//# sourceMappingURL=realtime-payments.module.js.map