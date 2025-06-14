import { IsNotEmpty, IsString } from 'class-validator';
import { AiModel } from '../strategies/models/ai-models';

export class PromptDto {
  @IsNotEmpty()
  @IsString()
  prompt: string;

  @IsNotEmpty()
  @IsString()
  model: AiModel;
}
