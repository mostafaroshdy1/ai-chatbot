import { Expose } from 'class-transformer';

export class CreateChatDto {
  @Expose()
  chatId: number;
  @Expose()
  createdAt: Date;
}
