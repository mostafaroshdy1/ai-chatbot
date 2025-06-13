import { Module } from '@nestjs/common';
import { JwtSignService } from './jwt.service';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [PassportModule],
  providers: [JwtSignService],
  exports: [JwtSignService],
})
export class AuthModule {}
