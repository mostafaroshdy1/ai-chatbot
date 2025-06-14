import { MessageRole } from './message-role.model';

export interface NewAiMessage {
  role: MessageRole;
  content: string;
}
