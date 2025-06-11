import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { users } from './schema/users';
import { aiModels } from './schema/ai-models';
import { aiModelProviders } from './schema/ai-model-provider';
import { chatMessages } from './schema/chat-messages';
import { chats } from './schema/chat';
export const schema = {
  users,
  aiModels,
  aiModelProviders,
  chatMessages,
  chats,
};
export type Repository = NodePgDatabase<typeof schema>;
