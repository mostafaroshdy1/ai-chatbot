import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { users } from './schema/users';
import { aiModels } from './schema/ai-models';
import { aiModelProviders } from './schema/ai-model-provider';
export const schema = { users, aiModels, aiModelProviders };
export type Repository = NodePgDatabase<typeof schema>;
