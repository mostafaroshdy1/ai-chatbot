import { AiModel } from './models/ai-models';
import { GeminiStrategy } from './gemini.strategy';
import { IAIChat } from './IAIchat';
import { OpenAIStrategy } from './openai.strategy';

type IAiChatConstructor = new () => IAIChat;
export const AiChatModelsMapper: Record<AiModel, IAiChatConstructor> = {
  // Gemini models
  'gemini-1.5-flash': GeminiStrategy,
  'gemini-1.5-pro': GeminiStrategy,
  'gemini-1.5-flash-8b': GeminiStrategy,
  'gemini-2.0-flash-lite': GeminiStrategy,
  'gemini-2.0-flash': GeminiStrategy,

  // OpenAI models
  'gpt-3.5-turbo': OpenAIStrategy,
  'gpt-3.5-turbo-0125': OpenAIStrategy,
  'gpt-4': OpenAIStrategy,
  'gpt-4-0613': OpenAIStrategy,
  'gpt-4-1106-preview': OpenAIStrategy,
  'gpt-4-0125-preview': OpenAIStrategy,
  'gpt-4-turbo': OpenAIStrategy,
  'gpt-4o': OpenAIStrategy,
};
