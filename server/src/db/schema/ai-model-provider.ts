import { pgTable } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';

export const aiModelProviders = pgTable('ai_model_providers', {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  name: t.varchar().notNull().unique(),
  apiKey: t.varchar().notNull(),
  createdAt: t.timestamp().notNull().defaultNow(),
});
