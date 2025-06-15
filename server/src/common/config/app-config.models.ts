import { Transform, Type } from 'class-transformer';
import { IsNumber, IsString, ValidateNested } from 'class-validator';

class Auth {
  @IsString()
  jwtAccessSecret: string;

  @IsString()
  jwtRefreshSecret: string;

  @IsString()
  jwtAccessLifespan: string;

  @IsString()
  jwtRefreshLifespan: string;
}

class Database {
  @IsString()
  DATABASE_URL: string;
}

class Host {
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  port: number;
}

class Cache {
  @IsString()
  redisUrl: string;
}

export class Config {
  @IsString()
  NODE_ENV: string;

  @ValidateNested()
  @Type(() => Auth)
  Auth: Auth;

  @ValidateNested()
  @Type(() => Database)
  Database: Database;

  @ValidateNested()
  @Type(() => Host)
  Host: Host;

  @ValidateNested()
  @Type(() => Cache)
  Cache: Cache;
}
