import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { UserModule } from 'src/user/user.module';
import { ChatRepository } from './repository/chat.repository';
import { AiStrategyFactory } from './strategies/ai-strategy.factory';
import { AiModelsModule } from 'src/ai-models/ai-models.module';
import { CacheModule } from 'src/cache/cache.module';

@Module({
  controllers: [ChatController],
  imports: [UserModule, AiModelsModule, CacheModule],
  providers: [ChatService, ChatRepository, AiStrategyFactory],
  exports: [ChatService],
})
export class AIChatModule {}
