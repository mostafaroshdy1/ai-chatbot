import { pgEnum } from 'drizzle-orm/pg-core';

export const AiRoleEnum = pgEnum('AiRoleEnum', ['user', 'assistant', 'system']);
