import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ClassTransformOptions, instanceToPlain } from 'class-transformer';
import { map } from 'rxjs';

@Injectable()
export class CustomSerializerInterceptor implements NestInterceptor {
  constructor(private readonly options: ClassTransformOptions = {}) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((value) =>
        instanceToPlain(value, {
          ...this.options,
        }),
      ),
    );
  }
}
