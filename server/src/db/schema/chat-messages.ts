import { pgTable } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';
import { chats } from './chat';
import { aiModels } from './ai-models';
import { users } from './users';
import { AiRoleEnum } from './enums/ai-role.enum';

export const chatMessages = pgTable('chat_messages', {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: t
    .integer()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  chatId: t
    .uuid()
    .notNull()
    .references(() => chats.id, { onDelete: 'cascade' }),
  AiModelId: t
    .integer()
    .notNull()
    .references(() => aiModels.id),
  role: AiRoleEnum().notNull(),
  content: t.text().notNull(),
  createdAt: t.timestamp().notNull().defaultNow(),
  promptTokens: t.integer().notNull(),
  completionTokens: t.integer().notNull(),
});
