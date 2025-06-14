import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class ChatDto {
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  offset: number;

  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  limit: number;
}
