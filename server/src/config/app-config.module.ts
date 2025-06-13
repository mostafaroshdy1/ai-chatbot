import { Global, Module } from '@nestjs/common';
import { AppConfigService } from './app-config.Service';
import configuration from './configuration';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    ConfigModule.forFeature(configuration),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
