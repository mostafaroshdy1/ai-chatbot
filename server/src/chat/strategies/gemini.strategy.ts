import { Observable, ReplaySubject } from 'rxjs';
import { IAiChat } from './IAichat';
import { GenerateContentResponse, GoogleGenAI } from '@google/genai';
import { AIResponseStreamModel } from './models/stream.model';
import { NewAiMessage } from '../models/new-message.model';
import { AiModelData } from '../models/ai-model-data.model';
import { ulid } from 'ulid';
const genAICache = new Map<string, GoogleGenAI>();
export class GeminiStrategy implements IAiChat {
  sendMessage(
    messages: NewAiMessage[],
    modelData: AiModelData,
  ): Observable<AIResponseStreamModel> {
    const replaySubject = new ReplaySubject<AIResponseStreamModel>(Infinity); // Replay all emissions to any new subscriber

    (async () => {
      const { model, apiKey } = modelData;
      try {
        const genAI = this.getGoogleGenAIInstance(apiKey);

        const formattedMessages = messages.map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        }));

        const stream = await genAI.models.generateContentStream({
          model,
          contents: formattedMessages,
        });

        let lastResponse: GenerateContentResponse | null = null;

        for await (const response of stream) {
          lastResponse = response;
          const text = response.text;
          if (text) {
            replaySubject.next({ text, isFinal: false, id: ulid() });
          }
        }

        if (lastResponse?.usageMetadata) {
          const promptTokenCount = lastResponse.usageMetadata.promptTokenCount;
          const totalTokenCount = lastResponse.usageMetadata.totalTokenCount;
          const completionTokenCount =
            (totalTokenCount ?? 0) - (promptTokenCount ?? 0);
          replaySubject.next({
            promptTokenCount,
            completionTokenCount,
            isFinal: true,
            id: ulid(),
          });
        }

        replaySubject.complete();
      } catch (error) {
        replaySubject.error(error);
      }
    })();

    return replaySubject.asObservable(); // Return the observable stream from the ReplaySubject
  }

  getGoogleGenAIInstance(apiKey: string): GoogleGenAI {
    if (!genAICache.has(apiKey)) {
      genAICache.set(apiKey, new GoogleGenAI({ apiKey }));
    }

    return genAICache.get(apiKey)!;
  }
}
