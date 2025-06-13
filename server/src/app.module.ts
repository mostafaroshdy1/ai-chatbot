import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RepositoryModule } from './repository/repository.module';
import { AppConfigModule } from './config/app-config.module';
import { HashModule } from './hash/hash.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [AppConfigModule, RepositoryModule, HashModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
