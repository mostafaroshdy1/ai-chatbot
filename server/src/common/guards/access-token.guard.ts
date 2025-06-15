import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';

@Injectable()
export class AccessTokenGuard extends AuthGuard('AccessStrategy') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const accessToken = (request.query as Record<string, any>)[
      'accessToken'
    ] as string | undefined; // for ws and sse
    if (accessToken && !request.headers.authorization) {
      request.headers.authorization = `Bearer ${accessToken}`;
      delete (request.query as Record<string, any>).accessToken;
    }

    return super.canActivate(context);
  }
}
