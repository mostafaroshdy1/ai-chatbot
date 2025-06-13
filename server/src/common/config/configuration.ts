import { registerAs } from '@nestjs/config';

export default registerAs('Config', () => ({
  NODE_ENV: process.env.NODE_ENV,
  Auth: {
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtAccessLifespan: process.env.JWT_ACCESS_LIFESPAN,
    jwtRefreshLifespan: process.env.JWT_REFRESH_LIFESPAN,
  },

  Database: {
    DATABASE_URL: process.env.DATABASE_URL,
  },

  Host: {
    port: process.env.PORT,
  },
}));
