"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentLinksModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const payment_links_service_1 = require("./payment-links.service");
const payment_links_controller_1 = require("./payment-links.controller");
const payment_link_entity_1 = require("./entities/payment-link.entity");
const event_emitter_1 = require("@nestjs/event-emitter");
let PaymentLinksModule = class PaymentLinksModule {
};
exports.PaymentLinksModule = PaymentLinksModule;
exports.PaymentLinksModule = PaymentLinksModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([payment_link_entity_1.PaymentLinkEntity]),
            event_emitter_1.EventEmitterModule.forRoot(),
        ],
        controllers: [payment_links_controller_1.PaymentLinksController],
        providers: [payment_links_service_1.PaymentLinksService],
        exports: [payment_links_service_1.PaymentLinksService],
    })
], PaymentLinksModule);
//# sourceMappingURL=payment-links.module.js.map