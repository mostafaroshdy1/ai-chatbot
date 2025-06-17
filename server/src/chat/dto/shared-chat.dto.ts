import { Expose } from 'class-transformer';

export class SharedChatDto {
  @Expose()
  sharedChatId: string;
}
