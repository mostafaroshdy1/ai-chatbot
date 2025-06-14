import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClassTransformOptions, instanceToPlain } from 'class-transformer';
import { map } from 'rxjs';

@Injectable()
export class CustomSerializerInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly options: ClassTransformOptions = {},
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const isSse = this.reflector.get<string>('sse', context.getHandler());
    if (isSse) return next.handle();

    return next.handle().pipe(
      map((value) =>
        instanceToPlain(value, {
          ...this.options,
        }),
      ),
    );
  }
}
