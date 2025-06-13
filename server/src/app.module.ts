import { Module } from '@nestjs/common';
import { AppConfigModule } from './common/config/app-config.module';
import { HashModule } from './common/hash/hash.module';
import { UserModule } from './user/user.module';
import { LocalStorageModule } from './common/local-storage/localstorage.module';
import { AuthModule } from './auth/auth.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CurrentUserInterceptor } from './common/interceptors/current-user.interceptor';
import { DrizzleModule } from './db/drizzle.module';

@Module({
  imports: [
    AppConfigModule,
    DrizzleModule,
    HashModule,
    LocalStorageModule,
    UserModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CurrentUserInterceptor,
    },
  ],
})
export class AppModule {}
