import { Global, Module } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { DrizzleModule } from 'src/db/drizzle.module';
const repositories = [UserRepository];

@Global()
@Module({
  imports: [DrizzleModule],
  providers: [...repositories],
  exports: [...repositories],
})
export class RepositoryModule {}
