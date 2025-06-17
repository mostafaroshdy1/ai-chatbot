import { Inject, Injectable } from '@nestjs/common';
import { and, asc, desc, eq } from 'drizzle-orm';
import { DRIZZLE } from 'src/db/drizzle.module';
import { Repository } from 'src/db/drizzle.types';
import { chats } from 'src/db/schema/chat';
import { chatMessages } from 'src/db/schema/chat-messages';
import { MessageRole } from '../models/message-role.model';

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
        label: chats.label,
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

  deleteChat(chatId: string) {
    return this.repository.delete(chats).where(eq(chats.id, chatId));
  }

  async addMessageToChat(data: {
    chatId: string;
    userId: number;
    aiModelId: number;
    role: MessageRole;
    content: string;
    completionTokens?: number;
    promptTokens?: number;
  }) {
    return this.repository.insert(chatMessages).values(data).execute();
  }

  async getChatMessages(chatId: string, userId: number) {
    const messages = await this.repository
      .select({
        content: chatMessages.content,
        role: chatMessages.role,
        createdAt: chatMessages.createdAt,
      })
      .from(chatMessages)
      .where(
        and(eq(chatMessages.chatId, chatId), eq(chatMessages.userId, userId)),
      )

      .orderBy(asc(chatMessages.createdAt));

    return messages;
  }

  async updateChatLabel(chatId: string, label: string) {
    return this.repository
      .update(chats)
      .set({ label })
      .where(eq(chats.id, chatId));
  }

  async getAllChats(userId: number, data: { offset: number; limit: number }) {
    const chatsData = await this.repository
      .select({
        chatId: chats.id,
        createdAt: chats.createdAt,
        label: chats.label,
      })
      .from(chats)
      .orderBy(desc(chats.createdAt))
      .where(eq(chats.userId, userId))
      .limit(data.limit)
      .offset(data.offset);

    return chatsData;
  }
}
