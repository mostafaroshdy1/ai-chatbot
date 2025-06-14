import { Observable } from 'rxjs';
import { NewAiMessage } from '../models/new-message.model';
import { AIResponseStreamModel } from './models/stream.model';
import { AiModelData } from '../models/ai-model-data.model';

export interface IAiChat {
  sendMessage(
    messages: NewAiMessage[],
    modelData: AiModelData,
  ): Observable<AIResponseStreamModel>;
}
