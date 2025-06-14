import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { UserModule } from 'src/user/user.module';
import { ChatRepository } from './repository/chat.repository';
import { AiModelRepository } from './repository/ai-model.repository';
import { AiStrategyFactory } from './strategies/ai-strategy.factory';

@Module({
  controllers: [ChatController],
  imports: [UserModule],
  providers: [
    ChatService,
    ChatRepository,
    AiModelRepository,
    AiStrategyFactory,
  ],
  exports: [ChatService],
})
export class AIChatModule {}
