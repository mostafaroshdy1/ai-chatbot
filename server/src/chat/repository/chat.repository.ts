import { Inject, Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { DRIZZLE } from 'src/db/drizzle.module';
import { Repository } from 'src/db/drizzle.types';
import { chats } from 'src/db/schema/chat';
import { chatMessages } from 'src/db/schema/chat-messages';

@Injectable()
export class ChatRepository {
  constructor(@Inject(DRIZZLE) private readonly repository: Repository) {}

  async createNewChat(userId: number) {
    const [chat] = await this.repository
      .insert(chats)
      .values({
        userId,
      })
      .returning({
        chatId: chats.id,
        createdAt: chats.createdAt,
      });

    return chat;
  }

  async getChatById(chatId: string) {
    const [chat] = await this.repository
      .select({ userId: chats.userId })
      .from(chats)
      .where(eq(chats.id, chatId));

    return chat;
  }

  async addMessageToChat(data: {
    chatId: string;
    userId: number;
    aiModelId: number;
    role: 'user' | 'assistant' | 'system';
    content: string;
    completionTokens?: number;
    promptTokens?: number;
  }) {
    return this.repository.insert(chatMessages).values(data).execute();
  }

  async getChatMessages(chatId: string) {
    const messages = await this.repository
      .select({
        content: chatMessages.content,
        role: chatMessages.role,
      })
      .from(chatMessages)
      .where(eq(chatMessages.chatId, chatId))
      .orderBy(asc(chatMessages.createdAt));

    return messages;
  }
}
