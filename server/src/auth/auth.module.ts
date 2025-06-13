import { Module } from '@nestjs/common';
import { JwtSignService } from './jwt-sign.service';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AccessStrategy } from './strategies/access-strategy';
import { RefreshStrategy } from './strategies/refresh-strategy';
import { LocalStrategy } from './strategies/local-strategy';
import { JwtService } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [AuthController],
  imports: [PassportModule, UserModule],
  providers: [
    JwtSignService,
    AuthService,
    AccessStrategy,
    RefreshStrategy,
    LocalStrategy,
    JwtService,
  ],
})
export class AuthModule {}
