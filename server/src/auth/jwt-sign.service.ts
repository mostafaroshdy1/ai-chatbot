import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from 'src/config/app-config.Service';
import { UserModels } from 'src/models/user.models';

@Injectable()
export class JwtSignService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly appConfigService: AppConfigService,
  ) {}

  accessTokenSign(payload: UserModels.AccessToken): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.appConfigService.config.Auth.jwtAccessSecret,
      expiresIn: this.appConfigService.config.Auth.jwtAccessLifespan,
    });
  }

  refreshTokenSign(payload: UserModels.RefreshToken): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.appConfigService.config.Auth.jwtRefreshSecret,
      expiresIn: this.appConfigService.config.Auth.jwtRefreshLifespan,
    });
  }

  verifyRefreshToken(token: string): Promise<any> {
    return this.jwtService.verifyAsync(token);
  }
}
