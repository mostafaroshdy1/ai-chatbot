import { pgTable } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';
import { aiModelProviders } from './ai-model-provider';

export const aiModels = pgTable('ai_models', {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  ProviderId: t
    .integer()
    .notNull()
    .references(() => aiModelProviders.id),
  name: t.varchar().notNull().unique(),
  maxInputToken: t.integer().notNull(),
  createdAt: t.timestamp().notNull().defaultNow(),
  isDefault: t.boolean().notNull().default(false),
});
