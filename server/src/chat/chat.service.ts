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
import { AiStrategyFactory } from './strategies/ai-strategy.factory';
import { NewAiMessage } from './models/new-message.model';
import {
  catchError,
  finalize,
  map,
  Observable,
  of,
  ReplaySubject,
  tap,
  throwError,
  timeout,
  TimeoutError,
} from 'rxjs';
import { AiModelsService } from 'src/ai-models/ai-models.service';
import { AiModel } from './strategies/models/ai-models';
import { RedisService } from 'src/cache/redis.service';
import { ChatSharesRepository } from './repository/chat-shares.repository';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly localStorageService: LocalStorageService,
    private readonly aiStrategyFactory: AiStrategyFactory,
    private readonly aiModelsService: AiModelsService,
    private readonly redisService: RedisService,
    private readonly chatSharesRepository: ChatSharesRepository,
  ) {}

  private logger = new Logger(ChatService.name);

  streamingObservableToChat = new Map<string, Observable<MessageEvent>>();

  getStreamingObservable(chatId: string): Observable<MessageEvent> {
    let obs = this.streamingObservableToChat.get(chatId);
    if (!obs) {
      this.logger.log(`Subscribing to ${chatId} for streaming messages`);
      const replaySubject = new ReplaySubject<MessageEvent>(Infinity);

      this.redisService.subscribeToId(chatId, (message) => {
        const messageEvent: MessageEvent = {
          data: message,
          type: 'message',
        };
        replaySubject.next(messageEvent);
      });

      obs = replaySubject.asObservable().pipe(
        timeout(30_000),
        catchError((err) => {
          if (err instanceof TimeoutError) {
            this.logger.warn(
              `Auto-unsubscribing from ${chatId} due to inactivity`,
            );
            return new Observable<MessageEvent>((subscriber) =>
              subscriber.complete(),
            );
          }
          return throwError(() => err);
        }),
        finalize(() => {
          this.redisService.unsubscribeFromId(chatId);
          this.streamingObservableToChat.delete(chatId);
          this.logger.log(`Unsubscribed from ${chatId}`);
        }),
      );

      // Store the observable in the map
      this.streamingObservableToChat.set(chatId, obs);
    }
    return obs;
  }

  createNewChat() {
    const { id: userId } = this.localStorageService.getCurrentUser();
    return this.chatRepository.createNewChat(userId);
  }

  async AskMessageToChat(chatId: string, message: string, aiModelId: number) {
    const canSend = await this.canSendMessageToChat(chatId);
    if (!canSend.result) {
      throw canSend.error;
    }

    const { id: userId } = this.localStorageService.getCurrentUser();

    const fullChat: NewAiMessage[] = await this.chatRepository.getChatMessages(
      chatId,
      userId,
    );

    let newChatLabel;
    if (fullChat.length === 0) {
      newChatLabel = message.split(' ').slice(0, 7).join(' ').trim();
      this.chatRepository.updateChatLabel(chatId, newChatLabel).catch((err) => {
        this.logger.error(
          `${ChatError.ErrorUpdatingChatLabel} ${chatId}: ${err}`,
        );
      });
    }

    const newMessage: NewAiMessage = {
      role: 'user',
      content: message,
    };
    fullChat.push(newMessage);

    const aiModelData = await this.aiModelsService.getAiModelData(aiModelId);

    if (!aiModelData) {
      throw new BadRequestException(ChatError.AiModelNotAvailable);
    }
    const { apiKey, name: aiModelName } = aiModelData;

    const aiStrategy = this.aiStrategyFactory.getStrategy(
      aiModelName as AiModel,
    );

    if (!aiModelData) {
      throw new InternalServerErrorException();
    }
    await this.chatRepository.addMessageToChat({
      ...newMessage,
      chatId,
      userId,
      aiModelId,
    });

    const obs = aiStrategy.sendMessage(fullChat, {
      apiKey,
      model: aiModelName,
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

        this.redisService
          .publishToId(
            chatId,
            JSON.stringify({
              text: res.text,
              isFinal: res.isFinal,
              id: res.id,
            }),
          )
          .catch((err) => {
            this.logger.error(
              `${ChatError.ErrorPublishingMessage} ${chatId}: ${err}`,
            );
          });
      }),

      map((res) => {
        const messageEvent: MessageEvent = {
          data: {
            text: res.text,
            isFinal: res.isFinal,
            id: res.id,
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
        return of({ error: ChatError.ErrorStreamingResponse });
      }),
    );

    // this.streamingObservableToChat.set(chatId, messageEventObservable);
    messageEventObservable.subscribe();

    return { success: true, chatLabel: newChatLabel };
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

  getChatMessages(chatId: string) {
    const { id: userId } = this.localStorageService.getCurrentUser();
    return this.chatRepository.getChatMessages(chatId, userId);
  }

  getAllChats(data: { offset: number; limit: number }) {
    const { id: userId } = this.localStorageService.getCurrentUser();
    return this.chatRepository.getAllChats(userId, data);
  }

  async createShareableChat(chatId: string) {
    const chat = await this.chatRepository.getChatById(chatId);
    const { id: currentUserId } = this.localStorageService.getCurrentUser();

    if (currentUserId !== chat.userId) {
      throw new ForbiddenException(ChatError.ChatNotBelongToUser);
    }

    const sharedChatId =
      await this.chatSharesRepository.getSharedChatByChatId(chatId);

    if (sharedChatId) {
      await this.chatSharesRepository.updateSharedChat(sharedChatId);
      return sharedChatId;
    }

    return this.chatSharesRepository.createSharedChat(chatId);
  }

  async getSharedChatById(sharedChatId: string) {
    const chat =
      await this.chatSharesRepository.getSharedChatById(sharedChatId);
    if (!chat) {
      throw new BadRequestException(ChatError.SharedChatNotFound);
    }
    return chat;
  }
}
