import { Expose } from 'class-transformer';

export class LoginDto {
  @Expose()
  accessToken: string;
  @Expose()
  refreshToken: string;
  @Expose()
  currentUser: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}
