import { AiModel } from './models/ai-models';
import { GeminiStrategy } from './gemini.strategy';
import { IAiChat } from './IAichat';

type IAiChatConstructor = new () => IAiChat;
export const AiChatModelsMapper: Record<AiModel, IAiChatConstructor> = {
  'gemini-1.5-flash': GeminiStrategy,
  'gemini-1.5-pro': GeminiStrategy,
  'gemini-1.5-flash-8b': GeminiStrategy,
  'gemini-2.0-flash-lite': GeminiStrategy,
  'gemini-2.0-flash': GeminiStrategy,
};
