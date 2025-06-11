import { pgTable } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';
import { users } from './users';

export const chats = pgTable('chats', {
  id: t.uuid().primaryKey().defaultRandom(),
  userId: t.integer().references(() => users.id),
});
