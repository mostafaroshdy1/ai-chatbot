import { Module } from '@nestjs/common';
import { AiModelRepository } from './repository/ai-model.repository';
import { AiModelsService } from './ai-models.service';
import { AiModelsController } from './ai-models.controller';

@Module({
  controllers: [AiModelsController],
  imports: [],
  providers: [AiModelsService, AiModelRepository],
  exports: [AiModelsService],
})
export class AiModelsModule {}
