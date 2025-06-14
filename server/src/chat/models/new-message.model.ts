export interface NewAiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
