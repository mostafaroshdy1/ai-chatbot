import { Global, Module } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { LocalStorageService } from './localstorage.service';

@Global()
@Module({
  providers: [
    {
      provide: AsyncLocalStorage,
      useValue: new AsyncLocalStorage(),
    },
    LocalStorageService,
  ],

  exports: [LocalStorageService],
})
export class LocalStorageModule {}
