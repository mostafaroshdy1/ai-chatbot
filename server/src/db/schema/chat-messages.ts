import { pgTable } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';
import { chats } from './chat';

export const chatMessages = pgTable('chat_messages', {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  chatId: t.uuid().references(() => chats.id),
});
