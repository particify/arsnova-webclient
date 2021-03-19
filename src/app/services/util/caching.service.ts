import { Injectable } from "@angular/core";
import { interval } from "rxjs";
import * as LRU from "lru-cache";

const LRU_OPTIONS: LRU.Options<string, any> = {
  max: 30,
  maxAge: 15 * 60 * 1000,
  noDisposeOnSet: true,
  updateAgeOnGet: true
};
const PRUNE_INTERVAL_MS = 60 * 1000;

export interface CacheKey {
  type: string;
  id: string;
}

@Injectable()
export class CachingService {
  private cache: LRU<string, any>;
  private disposeHandlers: { type: string, handler: (id: string, value: object) => void }[] = [];

  constructor() {
    LRU_OPTIONS.dispose = (key, value) => this.dispatchDispose(key, value);
    this.cache = new LRU(LRU_OPTIONS);
    /* Explicitly prune the cache so the disponse handlers are called early. */
    interval(PRUNE_INTERVAL_MS).subscribe(() => this.cache.prune());
  }

  get(key: CacheKey): any {
    return this.cache.get(this.keyToString(key));
  }

  put(key: CacheKey, value: any) {
    this.cache.set(this.keyToString(key), value);
  }

  remove(key: CacheKey) {
    this.cache.del(this.keyToString(key));
  }

  clear() {
    this.cache.reset();
  }

  registerDisposeHandler(type: string, handler: (id: string, value: object) => void) {
    this.disposeHandlers.push({ type: type, handler: handler });
  }

  private dispatchDispose(key: string, value: object) {
    const [type, id] = key.split('__', 2);
    this.disposeHandlers
      .filter(handlerConfig => handlerConfig.type === type)
      .forEach((handlerConfig) => handlerConfig.handler(id, value));
  }

  private keyToString(key: CacheKey): string {
    return `${key.type}__${key.id}`;
  }
}
