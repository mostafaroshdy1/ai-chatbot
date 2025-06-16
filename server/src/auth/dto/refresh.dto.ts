import { Expose } from 'class-transformer';

export class RefreshDto {
  @Expose()
  accessToken: string;
  @Expose()
  refreshToken: string;
}
