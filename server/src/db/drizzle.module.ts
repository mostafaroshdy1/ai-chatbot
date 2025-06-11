import { Global, Module } from '@nestjs/common';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { ConfigService } from '@nestjs/config';

export const DRIZZLE = Symbol('drizzle-connection');
@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const pool = new Pool({
          connectionString: databaseUrl,
        });
        return drizzle({ client: pool });
      },
    },
  ],

  exports: [DRIZZLE],
})
export class DrizzleModule {}
