import { Expose } from 'class-transformer';

export class UserResDto {
  @Expose()
  id: number;
  @Expose()
  firstName: string;
  @Expose()
  lastName: string;
  @Expose()
  email: string;
}
