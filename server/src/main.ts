import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CustomSerializerInterceptor } from './common/interceptors/custom-serializer.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  await app.listen(process.env.PORT ?? 4444);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
