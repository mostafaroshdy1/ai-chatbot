import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CustomSerializerInterceptor } from './common/interceptors/custom-serializer.interceptor';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { cors: { origin: '*', methods: '*' } },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: false,
      always: true,
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      stopAtFirstError: true,
    }),
  );

  app.useGlobalInterceptors(
    new CustomSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: true,
    }),
  );

  await app.listen({
    host: process.env.HOST,
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  });
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
