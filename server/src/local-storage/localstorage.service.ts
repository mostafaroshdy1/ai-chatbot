import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { UserModels } from 'src/models/user.models';
import { LocalStorageModels } from './localstorage.models';
import { LocalStorageError } from './localstorage.error';

@Injectable()
export class LocalStorageService {
  constructor(
    private readonly asyncLocalStorage: AsyncLocalStorage<LocalStorageModels>,
  ) {}

  getCurrentUser(): UserModels.AccessToken {
    const currentUser = this.asyncLocalStorage.getStore()?.currentUser;
    if (!currentUser)
      throw new InternalServerErrorException(LocalStorageError.StoreNotFound);

    return currentUser;
  }

  setCurrentUser(user: UserModels.AccessToken) {
    return this.asyncLocalStorage.enterWith({ currentUser: user });
  }
}
