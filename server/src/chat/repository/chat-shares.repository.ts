import { Inject, Injectable } from '@nestjs/common';
import { and, eq, lte } from 'drizzle-orm';
import { DRIZZLE } from 'src/db/drizzle.module';
import { Repository } from 'src/db/drizzle.types';
import { chats } from 'src/db/schema/chat';
import { chatMessages } from 'src/db/schema/chat-messages';
import { chatShares } from 'src/db/schema/chat-shares';

@Injectable()
export class ChatSharesRepository {
  constructor(@Inject(DRIZZLE) private readonly repository: Repository) {}

  async createSharedChat(chatId: string): Promise<string> {
    const [{ id }] = await this.repository
      .insert(chatShares)
      .values({
        chatId,
      })
      .returning({
        id: chatShares.id,
      });

    return id;
  }

  async getSharedChatById(sharedChatId: string) {
    const chat = await this.repository
      .select({
        chatId: chatShares.id,
        createdAt: chats.createdAt,
        messageContent: chatMessages.content,
        messageRole: chatMessages.role,
      })
      .from(chatShares)
      .innerJoin(chats, eq(chatShares.chatId, chats.id))
      .innerJoin(
        chatMessages,
        and(
          eq(chatMessages.chatId, chats.id),
          lte(chatMessages.createdAt, chatShares.updatedAt),
        ),
      )
      .where(eq(chatShares.id, sharedChatId));

    return chat;
  }

  async getSharedChatByChatId(chatId: string) {
    const [sharedChat] = await this.repository
      .select({
        id: chatShares.id,
      })
      .from(chatShares)
      .where(eq(chatShares.chatId, chatId));

    return sharedChat ? sharedChat.id : null;
  }

  updateSharedChat(sharedChatId: string) {
    return this.repository
      .update(chatShares)
      .set({
        updatedAt: new Date(),
      })
      .where(eq(chatShares.id, sharedChatId))
      .execute();
  }
}
