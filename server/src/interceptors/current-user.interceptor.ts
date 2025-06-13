import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { LocalStorageService } from 'src/local-storage/localstorage.service';
import { UserModels } from 'src/models/user.models';

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(private readonly localStorageService: LocalStorageService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context
      .switchToHttp()
      .getRequest<UserModels.UserLoginRequest>();

    this.localStorageService.setCurrentUser({
      id: request.user.id,
    });

    return next.handle();
  }
}
