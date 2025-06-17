import { Expose } from 'class-transformer';

export class AiModelsDto {
  @Expose()
  id: number;
  @Expose()
  name: string;
  @Expose()
  maxInputToken: number;
  @Expose()
  providerName: string;
  @Expose()
  providerId: number;
  @Expose()
  isDefault: boolean;
}
