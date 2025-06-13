import { Injectable } from '@nestjs/common';
import { UserModels } from 'src/models/user.models';
import { JwtSignService } from './jwt-sign.service';
import { HashService } from 'src/hash/hash.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtSignService: JwtSignService,
    private readonly hashService: HashService,
    private readonly userService: UserService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<UserModels.AccessToken | null> {
    const user = await this.userService.getByEmail(email);
    const isValidPassword = await this.hashService.compare(pass, user.password);
    if (!isValidPassword) return null;

    return { id: user.id };
  }

  async login(payload: UserModels.AccessToken) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtSignService.accessTokenSign(payload),
      this.jwtSignService.refreshTokenSign(payload),
    ]);

    return { accessToken, refreshToken };
  }

  async refresh(userBase: UserModels.RefreshToken) {
    const { id: userId } = userBase;
    const accessTokenPayload =
      await this.userService.getCurrentUserPayload(userId);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtSignService.accessTokenSign(accessTokenPayload),
      this.jwtSignService.refreshTokenSign({ id: accessTokenPayload.id }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
