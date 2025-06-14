import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from 'src/db/drizzle.module';
import { Repository } from 'src/db/drizzle.types';
import { aiModelProviders } from 'src/db/schema/ai-model-provider';
import { aiModels } from 'src/db/schema/ai-models';

@Injectable()
export class AiModelRepository {
  constructor(@Inject(DRIZZLE) private readonly repository: Repository) {}

  async getAiModel(modelName: string) {
    const [aiModel] = await this.repository
      .select({
        apiKey: aiModelProviders.apiKey,
        id: aiModels.id,
      })
      .from(aiModelProviders)
      .where(eq(aiModels.name, modelName))
      .innerJoin(aiModels, eq(aiModelProviders.id, aiModels.ProviderId))
      .execute();

    return aiModel ? aiModel : null;
  }
}
