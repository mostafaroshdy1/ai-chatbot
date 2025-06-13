import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfigService } from 'src/common/config/app-config.Service';

@Injectable()
export class AccessStrategy extends PassportStrategy(
  Strategy,
  'AccessStrategy',
) {
  constructor(appConfigService: AppConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appConfigService.config.Auth.jwtAccessSecret,
    });
  }

  validate(payload: any) {
    return payload;
  }
}
