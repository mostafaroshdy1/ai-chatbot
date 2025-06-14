import { Injectable } from '@nestjs/common';
import { AiChatModelsMapper } from './chat-models.mapper';
import { IAiChat } from './IAichat';

@Injectable()
export class AiStrategyFactory {
  cachedStrategies: Partial<Record<keyof typeof AiChatModelsMapper, IAiChat>> =
    {};

  getStrategy(strategyName: keyof typeof AiChatModelsMapper) {
    if (this.cachedStrategies[strategyName]) {
      return this.cachedStrategies[strategyName];
    }
    const strategy = AiChatModelsMapper[strategyName];
    if (!strategy) {
      throw new Error(`Strategy ${strategyName} not found`);
    }
    const instance = new strategy();
    this.cachedStrategies[strategyName] = instance;

    return instance;
  }
}
