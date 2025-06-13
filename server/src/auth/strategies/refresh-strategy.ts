import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfigService } from 'src/config/app-config.Service';

@Injectable()
export class RefreshStrategy extends PassportStrategy(
  Strategy,
  'RefreshStrategy',
) {
  constructor(appConfigService: AppConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appConfigService.config.Auth.jwtRefreshSecret,
    });
  }

  validate(payload: any) {
    return payload;
  }
}
