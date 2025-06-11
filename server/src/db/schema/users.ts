import { pgTable } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  firstName: t.varchar({ length: 256 }),
  lastName: t.varchar({ length: 256 }),
  email: t.varchar().notNull().unique(),
  password: t.varchar().notNull(),
  createdAt: t.timestamp().notNull().defaultNow(),
});
