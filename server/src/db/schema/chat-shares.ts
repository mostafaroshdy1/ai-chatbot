import { pgTable } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';
import { chats } from './chat';

export const chatShares = pgTable('chat_shares', {
  id: t.uuid().primaryKey().defaultRandom(),
  chatId: t.uuid().references(() => chats.id, { onDelete: 'cascade' }),
  createdAt: t.timestamp().notNull().defaultNow(),
  updatedAt: t.timestamp().notNull().defaultNow(),
});
