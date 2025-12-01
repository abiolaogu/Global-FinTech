"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoscaModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const rosca_service_1 = require("./rosca.service");
const rosca_controller_1 = require("./rosca.controller");
const rosca_circle_entity_1 = require("./entities/rosca-circle.entity");
const rosca_membership_entity_1 = require("./entities/rosca-membership.entity");
const rosca_contribution_entity_1 = require("./entities/rosca-contribution.entity");
const rosca_payout_entity_1 = require("./entities/rosca-payout.entity");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
let RoscaModule = class RoscaModule {
};
exports.RoscaModule = RoscaModule;
exports.RoscaModule = RoscaModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                rosca_circle_entity_1.RoscaCircleEntity,
                rosca_membership_entity_1.RoscaMembershipEntity,
                rosca_contribution_entity_1.RoscaContributionEntity,
                rosca_payout_entity_1.RoscaPayoutEntity,
            ]),
            event_emitter_1.EventEmitterModule,
            schedule_1.ScheduleModule.forRoot(),
        ],
        controllers: [rosca_controller_1.RoscaController],
        providers: [rosca_service_1.RoscaService],
        exports: [rosca_service_1.RoscaService],
    })
], RoscaModule);
//# sourceMappingURL=rosca.module.js.map