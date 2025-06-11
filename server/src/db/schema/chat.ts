import { pgTable } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';
import { users } from './users';

export const chats = pgTable('chats', {
  id: t.uuid().primaryKey().defaultRandom(),
  userId: t
    .integer()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: t.timestamp().notNull().defaultNow(),
});
