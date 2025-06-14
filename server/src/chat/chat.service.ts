import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  MessageEvent,
} from '@nestjs/common';
import { ChatRepository } from './repository/chat.repository';
import { LocalStorageService } from 'src/common/local-storage/localstorage.service';
import { ChatError } from './chat.error';
import { AiChatModelsMapper } from './strategies/chat-models.mapper';
import { AiStrategyFactory } from './strategies/ai-strategy.factory';
import { AiModelRepository } from './repository/ai-model.repository';
import { NewAiMessage } from './models/new-message.model';
import { catchError, finalize, map, Observable, tap } from 'rxjs';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly localStorageService: LocalStorageService,
    private readonly aiStrategyFactory: AiStrategyFactory,
    private readonly aiModelRepository: AiModelRepository,
  ) {}

  private logger = new Logger(ChatService.name);

  streamingObservableToChat = new Map<string, Observable<MessageEvent>>();

  getStreamingObservable(chatId: string): Observable<MessageEvent> {
    const obs = this.streamingObservableToChat.get(chatId);
    if (!obs) throw new BadRequestException(ChatError.NoStreamingForThisChat);
    return obs;
  }

  createNewChat() {
    const { id: userId } = this.localStorageService.getCurrentUser();
    return this.chatRepository.createNewChat(userId);
  }

  async AskMessageToChat(
    chatId: string,
    message: string,
    aiModel: keyof typeof AiChatModelsMapper,
  ) {
    const canSend = await this.canSendMessageToChat(chatId);
    if (!canSend.result) {
      throw canSend.error;
    }

    const { id: userId } = this.localStorageService.getCurrentUser();

    const fullChat: NewAiMessage[] =
      await this.chatRepository.getChatMessages(chatId);

    const newMessage: NewAiMessage = {
      role: 'user',
      content: message,
    };
    fullChat.push(newMessage);

    const aiStrategy = this.aiStrategyFactory.getStrategy(aiModel);

    const aiModelData = await this.aiModelRepository.getAiModel(aiModel);

    if (!aiModelData) {
      throw new InternalServerErrorException();
    }
    const { apiKey, id: aiModelId } = aiModelData;
    await this.chatRepository.addMessageToChat({
      ...newMessage,
      chatId,
      userId,
      aiModelId,
    });

    const obs = aiStrategy.sendMessage(fullChat, {
      apiKey,
      model: aiModel,
    });
    let fullResponse = '';

    const messageEventObservable = obs.pipe(
      tap((res) => {
        if (res.text) {
          fullResponse += res.text;
        }
        if (res.isFinal) {
          this.chatRepository.addMessageToChat({
            chatId,
            userId,
            aiModelId,
            role: 'assistant',
            content: fullResponse,
            completionTokens: res.completionTokenCount,
            promptTokens: res.promptTokenCount,
          });
        }
      }),
      map((res) => {
        const messageEvent: MessageEvent = {
          data: {
            text: res.text,
            isFinal: res.isFinal,
          },
          type: 'message',
        };
        return messageEvent;
      }),
      finalize(() => this.streamingObservableToChat.delete(chatId)),

      catchError((err) => {
        this.streamingObservableToChat.delete(chatId);
        this.logger.error(
          `${ChatError.ErrorStreamingResponse} ${chatId}: ${err}`,
        );
        throw new InternalServerErrorException(
          ChatError.ErrorStreamingResponse,
        );
      }),
    );

    this.streamingObservableToChat.set(chatId, messageEventObservable);

    return { success: true };
  }

  private async canSendMessageToChat(chatId: string) {
    const chat = await this.chatRepository.getChatById(chatId);

    if (!chat) {
      return {
        result: false,
        error: new BadRequestException(ChatError.ChatNotFound),
      };
    }
    const { id: userId } = this.localStorageService.getCurrentUser();

    if (chat.userId !== userId) {
      return {
        result: false,
        error: new ForbiddenException(ChatError.ChatNotBelongToUser),
      };
    }

    return {
      result: true,
      error: null,
    };
  }
}
