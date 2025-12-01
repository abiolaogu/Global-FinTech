"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentEngineModule = void 0;
const common_1 = require("@nestjs/common");
const iso8583_parser_service_1 = require("./iso8583/iso8583-parser.service");
const transaction_switch_service_1 = require("./switch/transaction-switch.service");
const hsm_service_1 = require("./security/hsm.service");
const card_management_service_1 = require("./card-management/card-management.service");
const atm_pos_handler_service_1 = require("./terminals/atm-pos-handler.service");
const payment_gateway_service_1 = require("./gateway/payment-gateway.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let PaymentEngineModule = class PaymentEngineModule {
};
exports.PaymentEngineModule = PaymentEngineModule;
exports.PaymentEngineModule = PaymentEngineModule = __decorate([
    (0, common_1.Module)({
        imports: [event_emitter_1.EventEmitterModule.forRoot()],
        providers: [
            iso8583_parser_service_1.ISO8583Parser,
            transaction_switch_service_1.TransactionSwitch,
            hsm_service_1.HSMService,
            card_management_service_1.CardManagementService,
            atm_pos_handler_service_1.ATMPOSHandler,
            payment_gateway_service_1.PaymentGatewayService,
        ],
        exports: [
            iso8583_parser_service_1.ISO8583Parser,
            transaction_switch_service_1.TransactionSwitch,
            hsm_service_1.HSMService,
            card_management_service_1.CardManagementService,
            atm_pos_handler_service_1.ATMPOSHandler,
            payment_gateway_service_1.PaymentGatewayService,
        ],
    })
], PaymentEngineModule);
//# sourceMappingURL=payment-engine.module.js.map