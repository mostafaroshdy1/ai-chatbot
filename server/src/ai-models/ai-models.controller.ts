import { Controller, Get } from '@nestjs/common';
import { AiModelsService } from './ai-models.service';
import { AiModelsDto } from './dto/ai-models.dto';
import { plainToInstance } from 'class-transformer';

@Controller('ai-models')
export class AiModelsController {
  constructor(private readonly aiModelsService: AiModelsService) {}
  @Get()
  async getAllModels(): Promise<AiModelsDto[]> {
    const models = await this.aiModelsService.getAllModels();
    return plainToInstance(AiModelsDto, models);
  }
}
