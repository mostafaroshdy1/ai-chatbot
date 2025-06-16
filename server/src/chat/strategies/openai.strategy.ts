import { Observable, ReplaySubject } from 'rxjs';
import OpenAI from 'openai';
import { IAIChat } from './IAIchat';
import { AIResponseStreamModel } from './models/stream.model';
import { NewAiMessage } from '../models/new-message.model';
import { AiModelData } from '../models/ai-model-data.model';
import { ulid } from 'ulid';

const openAICache = new Map<string, OpenAI>();

export class OpenAIStrategy implements IAIChat {
  sendMessage(
    messages: NewAiMessage[],
    modelData: AiModelData,
  ): Observable<AIResponseStreamModel> {
    const replaySubject = new ReplaySubject<AIResponseStreamModel>(Infinity);

    (async () => {
      const { model, apiKey } = modelData;

      try {
        const openai = this.getOpenAIInstance(apiKey);
        console.log('openai');
        const formattedMessages = messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        const stream = await openai.chat.completions.create({
          model,
          messages: formattedMessages,
          stream: true,
        });

        let promptTokens = 0;
        let completionTokens = 0;

        for await (const chunk of stream) {
          const content = chunk.choices?.[0]?.delta?.content;
          if (content) {
            replaySubject.next({
              text: content,
              isFinal: false,
              id: ulid(),
            });
          }

          // Optional: if token info is returned in stream, collect it
          const usage = chunk.usage;
          if (usage) {
            promptTokens = usage.prompt_tokens ?? promptTokens;
            completionTokens = usage.completion_tokens ?? completionTokens;
          }
        }

        // Final message with token usage
        replaySubject.next({
          promptTokenCount: promptTokens,
          completionTokenCount: completionTokens,
          isFinal: true,
          id: ulid(),
        });

        replaySubject.complete();
      } catch (error) {
        replaySubject.error(error);
      }
    })();

    return replaySubject.asObservable();
  }

  private getOpenAIInstance(apiKey: string): OpenAI {
    if (!openAICache.has(apiKey)) {
      openAICache.set(apiKey, new OpenAI({ apiKey }));
    }
    return openAICache.get(apiKey)!;
  }
}
