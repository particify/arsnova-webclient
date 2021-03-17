import { Injectable } from "@angular/core";
import * as LRU from "lru-cache";

const LRU_OPTIONS: LRU.Options<string, any> = {
  max: 30,
  maxAge: 15 * 60 * 1000,
  noDisposeOnSet: true,
  updateAgeOnGet: true
};

export interface CacheKey {
  type: string;
  id: string;
}

@Injectable()
export class CachingService {
  private cache: LRU<string, any>;

  constructor() {
    this.cache = new LRU(LRU_OPTIONS);
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

  private keyToString(key: CacheKey): string {
    return `${key.type}__${key.id}`;
  }
}
