import { Expose } from 'class-transformer';
import { MessageRole } from '../models/message-role.model';

export class ChatMessageDto {
  @Expose()
  content: string;

  @Expose()
  role: MessageRole;

  @Expose()
  createdAt: Date;
}
