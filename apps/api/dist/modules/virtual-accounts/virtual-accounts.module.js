"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualAccountsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const virtual_accounts_service_1 = require("./virtual-accounts.service");
const virtual_accounts_controller_1 = require("./virtual-accounts.controller");
const virtual_account_entity_1 = require("./entities/virtual-account.entity");
const virtual_account_transaction_entity_1 = require("./entities/virtual-account-transaction.entity");
const wallets_module_1 = require("../wallets/wallets.module");
const event_emitter_1 = require("@nestjs/event-emitter");
let VirtualAccountsModule = class VirtualAccountsModule {
};
exports.VirtualAccountsModule = VirtualAccountsModule;
exports.VirtualAccountsModule = VirtualAccountsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                virtual_account_entity_1.VirtualAccountEntity,
                virtual_account_transaction_entity_1.VirtualAccountTransactionEntity,
            ]),
            wallets_module_1.WalletsModule,
            event_emitter_1.EventEmitterModule.forRoot(),
        ],
        controllers: [virtual_accounts_controller_1.VirtualAccountsController],
        providers: [virtual_accounts_service_1.VirtualAccountsService],
        exports: [virtual_accounts_service_1.VirtualAccountsService],
    })
], VirtualAccountsModule);
//# sourceMappingURL=virtual-accounts.module.js.map