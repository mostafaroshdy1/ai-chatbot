import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { AppConfigService } from 'src/common/config/app-config.Service';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly appConfigService: AppConfigService) {}
  private publisher: Redis;
  private subscriber: Redis;
  private listenerRefs = new Map<
    string,
    Set<(channel: string, message: string) => void>
  >();

  private channelListeners = new Map<string, Set<(message: string) => void>>();

  onModuleDestroy() {
    this.publisher?.quit();
    this.subscriber?.quit();
  }

  onModuleInit() {
    this.initializeRedis();
    this.initializePubSub();
  }

  private initializeRedis() {
    const { redisUrl } = this.appConfigService.config.Cache;
    this.publisher = new Redis(redisUrl);
  }

  private initializePubSub() {
    const { redisUrl } = this.appConfigService.config.Cache;
    this.subscriber = new Redis(redisUrl);
  }

  async publishToId(id: string, message: string) {
    return this.publisher.publish(id, message);
  }

  async subscribeToId(id: string, callback: (message: string) => void) {
    const listener = (channel: string, message: string) => {
      if (channel === id) {
        callback(message);
      }
    };

    if (!this.listenerRefs.has(id)) {
      this.listenerRefs.set(id, new Set());
    }
    this.listenerRefs.get(id)?.add(listener);

    if (!this.channelListeners.has(id)) {
      this.channelListeners.set(id, new Set());
    }

    this.channelListeners.get(id)?.add(callback);

    await this.subscriber.subscribe(id);
    this.subscriber.on('message', listener);
  }

  async unsubscribeFromId(id: string) {
    const listeners = this.listenerRefs.get(id);
    if (listeners) {
      for (const listener of listeners) {
        this.subscriber.off('message', listener);
      }
      this.listenerRefs.delete(id);
    }

    this.channelListeners.delete(id); // Optional: clear callbacks
    await this.subscriber.unsubscribe(id);
  }

  setWithExpiry(
    key: string,
    value: string,
    expiryInSeconds: number,
  ): Promise<'OK'> {
    return this.publisher.set(key, value, 'EX', expiryInSeconds);
  }
}
