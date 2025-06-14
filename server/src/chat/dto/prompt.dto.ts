import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PromptDto {
  @IsNotEmpty()
  @IsString()
  prompt: string;

  @IsNotEmpty()
  @IsNumber()
  aiModelId: number;
}
