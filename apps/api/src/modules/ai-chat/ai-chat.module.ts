import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatSessionEntity } from './entities/chat-session.entity';
import { ChatMessageEntity } from './entities/chat-message.entity';
import { AIIntentService } from './services/ai-intent.service';
import { ActionExecutorService } from './services/action-executor.service';
import { AIChatService } from './services/ai-chat.service';
import { AIChatController, AIChatGateway } from './controllers/ai-chat.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ChatSessionEntity, ChatMessageEntity])],
  controllers: [AIChatController],
  providers: [
    AIIntentService,
    ActionExecutorService,
    AIChatService,
    AIChatGateway,
  ],
  exports: [AIChatService, AIIntentService, ActionExecutorService],
})
export class AIChatModule {}
