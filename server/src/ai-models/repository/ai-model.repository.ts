import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from 'src/db/drizzle.module';
import { Repository } from 'src/db/drizzle.types';
import { aiModelProviders } from 'src/db/schema/ai-model-provider';
import { aiModels } from 'src/db/schema/ai-models';

@Injectable()
export class AiModelRepository {
  constructor(@Inject(DRIZZLE) private readonly repository: Repository) {}

  async getAiModelData(aiModelId: number) {
    const [aiModel] = await this.repository
      .select({
        apiKey: aiModelProviders.apiKey,
        name: aiModels.name,
      })
      .from(aiModelProviders)
      .where(eq(aiModels.id, aiModelId))
      .innerJoin(aiModels, eq(aiModelProviders.id, aiModels.ProviderId))
      .execute();

    return aiModel ? aiModel : null;
  }

  async getAllModels() {
    const models = await this.repository
      .select({
        id: aiModels.id,
        name: aiModels.name,
        maxInputToken: aiModels.maxInputToken,
        providerName: aiModelProviders.name,
        providerId: aiModelProviders.id,
        isDefault: aiModels.isDefault,
      })
      .from(aiModels)
      .innerJoin(
        aiModelProviders,
        eq(aiModels.ProviderId, aiModelProviders.id),
      );

    return models;
  }
}
