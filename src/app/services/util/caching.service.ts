import { Injectable } from "@angular/core";
import { RxStompState } from '@stomp/rx-stomp';
import { interval } from "rxjs";
import * as LRU from "lru-cache";
import { WsConnectorService } from "../websockets/ws-connector.service";

const LRU_OPTIONS: LRU.Options<string, any> = {
  max: 30,
  maxAge: 15 * 60 * 1000,
  noDisposeOnSet: true,
  updateAgeOnGet: true
};
const PRUNE_INTERVAL_MS = 60 * 1000;
const WS_DISCONNECT_GRACE_PERIOD_MS = 10 * 1000;

export enum DefaultCache {
  SHARED,
  CURRENT_ROOM
}

export interface CacheKey {
  type: string;
  id: string;
}

@Injectable()
export class CachingService {
  private caches: Map<string | number, Cache> = new Map();
  private wsDisconnectionTimestamp: Date = new Date();

  constructor(ws: WsConnectorService) {
    ws.getConnectionState().subscribe(state => this.handleWsStateChange(state));
  }

  getCache(cacheId: string | number) {
    let cache = this.caches.get(cacheId);
    if (!cache) {
      cache = new Cache();
      this.caches.set(cacheId, cache);
    }
    return cache;
  }

  private handleWsStateChange(state: RxStompState) {
    switch (state) {
      case RxStompState.CLOSED:
        if (!this.wsDisconnectionTimestamp) {
          this.wsDisconnectionTimestamp = new Date();
        }
        break;
      case RxStompState.OPEN:
        const currentTimestamp = new Date();
        if (this.wsDisconnectionTimestamp
            && currentTimestamp.getTime() - this.wsDisconnectionTimestamp.getTime() > WS_DISCONNECT_GRACE_PERIOD_MS) {
          console.log('WebSocket disconnection grace period exceeded. Clearing cache.');
          this.caches.forEach(c => c.clear());
          this.wsDisconnectionTimestamp = currentTimestamp;
        }
    }
  }
}

export class Cache {
  private cache: LRU<string, any>;
  private disposeHandlers: { type: string, handler: (id: string, value: object) => void }[] = [];

  constructor() {
    const lruOptions = { dispose: (key, value) => this.dispatchDispose(key, value) };
    Object.assign(lruOptions, LRU_OPTIONS);
    this.cache = new LRU(lruOptions);
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
