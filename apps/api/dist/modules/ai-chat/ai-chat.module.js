"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIChatModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const chat_session_entity_1 = require("./entities/chat-session.entity");
const chat_message_entity_1 = require("./entities/chat-message.entity");
const ai_intent_service_1 = require("./services/ai-intent.service");
const action_executor_service_1 = require("./services/action-executor.service");
const ai_chat_service_1 = require("./services/ai-chat.service");
const ai_chat_controller_1 = require("./controllers/ai-chat.controller");
let AIChatModule = class AIChatModule {
};
exports.AIChatModule = AIChatModule;
exports.AIChatModule = AIChatModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([chat_session_entity_1.ChatSessionEntity, chat_message_entity_1.ChatMessageEntity])],
        controllers: [ai_chat_controller_1.AIChatController],
        providers: [
            ai_intent_service_1.AIIntentService,
            action_executor_service_1.ActionExecutorService,
            ai_chat_service_1.AIChatService,
            ai_chat_controller_1.AIChatGateway,
        ],
        exports: [ai_chat_service_1.AIChatService, ai_intent_service_1.AIIntentService, action_executor_service_1.ActionExecutorService],
    })
], AIChatModule);
//# sourceMappingURL=ai-chat.module.js.map