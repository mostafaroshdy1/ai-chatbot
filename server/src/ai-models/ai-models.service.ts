import { Injectable } from '@nestjs/common';
import { AiModelRepository } from 'src/ai-models/repository/ai-model.repository';

@Injectable()
export class AiModelsService {
  constructor(private readonly aiModelsRepository: AiModelRepository) {}

  getAiModelData(aiModelId: number) {
    return this.aiModelsRepository.getAiModelData(aiModelId);
  }

  getAllModels() {
    return this.aiModelsRepository.getAllModels();
  }
}
