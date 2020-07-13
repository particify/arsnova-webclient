import { Injectable, InjectionToken, Inject, Provider } from '@angular/core';

/* TODO: Remove enums for storage keys */
export enum LocalStorageKey {
  ROOM_ACCESS = 'ROOM_ACCESS',
  USER = 'USER',
  THEME = 'THEME',
  LANGUAGE = 'LANGUAGE',
  COOKIE_CONSENT = 'COOKIE_CONSENT',
  DATA_PROTECTION = 'DATA_PROTECTION',
  LOGGED_IN = 'LOGGED_IN'
}

export enum MemoryStorageKey {
  ROOM_ID = 'ROOM_ID',
  SHORT_ID = 'SHORT_ID',
  DEVICE_TYPE = 'DEVICE_TYPE',
  IS_SAFARI = 'IS_SAFARI',
  MODERATION_ENABLED = 'MODERATION_ENABLED',
  CONTENT_GROUPS = 'CONTENT_GROUPS',
  LAST_GROUP = 'LAST_GROUP'
}

export enum StorageKey {
  ROOM_ACCESS = 'ROOM_ACCESS',
  USER = 'USER',
  THEME = 'THEME',
  LANGUAGE = 'LANGUAGE',
  COOKIE_CONSENT = 'COOKIE_CONSENT',
  DATA_PROTECTION = 'DATA_PROTECTION',
  LOGGED_IN = 'LOGGED_IN',
  ROOM_ID = 'ROOM_ID',
  SHORT_ID = 'SHORT_ID',
  DEVICE_TYPE = 'DEVICE_TYPE',
  IS_SAFARI = 'IS_SAFARI',
  MODERATION_ENABLED = 'MODERATION_ENABLED',
  CONTENT_GROUPS = 'CONTENT_GROUPS',
  LAST_GROUP = 'LAST_GROUP'
}

export enum StorageItemCategory {
  UNSPECIFIED,
  REQUIRED,
  FUNCTIONAL,
  STATISTICS,
  MARKETING
}

export enum StorageBackend {
  MEMORY,
  SESSIONSTORAGE,
  LOCALSTORAGE,
  COOKIE
}

export interface StorageItem {
  key: string,
  prefix?: string,
  category: StorageItemCategory,
  backend: StorageBackend
}

export const STORAGECONFIG_PROVIDER_TOKEN : InjectionToken<StorageItem> = new InjectionToken('STORAGECONFIG_PROVIDER_TOKEN');

/**
 * Define configurations for globally accessible variables.
 */
export const STORAGE_CONFIG: StorageItem[] = [
  {
    key: 'ROOM_ACCESS',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.LOCALSTORAGE
  },
  {
    key: 'USER',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.LOCALSTORAGE
  },
  {
    key: 'COOKIE_CONSENT',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.LOCALSTORAGE
  },
  {
    key: 'LOGGED_IN',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.LOCALSTORAGE
  },
  {
    key: 'ROOM_ID',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.MEMORY
  },
  {
    key: 'SHORT_ID',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.MEMORY
  },
  {
    key: 'DEVICE_TYPE',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.MEMORY
  },
  {
    key: 'IS_SAFARI',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.MEMORY
  },
  {
    key: 'MODERATION_ENABLED',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.MEMORY
  },
  {
    key: 'CONTENT_GROUPS',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.MEMORY
  },
  {
    key: 'LAST_GROUP',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.MEMORY
  },
  {
    key: 'THEME',
    category: StorageItemCategory.FUNCTIONAL,
    backend: StorageBackend.LOCALSTORAGE
  },
  {
    key: 'LANGUAGE',
    category: StorageItemCategory.FUNCTIONAL,
    backend: StorageBackend.LOCALSTORAGE
  }
];

/**
 * Contains dependency injection {@link Provider}s for {@link StorageItem} in
 * {@link STORAGE_CONFIG}.
 */
export const STORAGE_CONFIG_PROVIDERS: Provider[] = STORAGE_CONFIG.map((config) => {
  return {
    provide: STORAGECONFIG_PROVIDER_TOKEN,
    useValue: config,
    multi: true
  }
});

const APP_PREFIX = 'ARS';

/**
 * Provides a unified API for handling persistant and non-persistant application state.
 */
@Injectable()
export class GlobalStorageService {
  memory: Map<string, any> = new Map();
  shortId: string;
  readonly storageConfig: Map<string, StorageItem> = new Map();

  constructor(
    @Inject(STORAGECONFIG_PROVIDER_TOKEN) storageConfigItems: StorageItem[]
  ) {
    storageConfigItems.forEach((item) => {
      this.storageConfig.set(item.key, item);
    });
    // Memory setup
    const userAgent = navigator.userAgent;
    let isSafari = 'false';
    let deviceType = 'desktop';
    // Check if mobile device
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      // Check if IOS device
      if (/iPhone|iPad|iPod/.test(userAgent)) {
        isSafari = 'true';
      }
      deviceType = 'mobile';
    } else {
      // Check if Mac
      if (/Macintosh|MacIntel|MacPPC|Mac68k/.test(userAgent)) {
        // Check if Safari browser
        if (userAgent.indexOf('Safari') !== -1 && userAgent.indexOf('Chrome') === -1) {
          isSafari = 'true';
        }
      }
    }
    this.memory.set(MemoryStorageKey.IS_SAFARI, isSafari);
    this.memory.set(MemoryStorageKey.DEVICE_TYPE, deviceType);
  }

  getItem(key: string): any {
    let config = this.storageConfig.get(key);
    if (!config) {
      throw new Error(`No specification found for storage key '${key}'.`);
    }
    let prefix = config.prefix ?? APP_PREFIX;
    key = `${prefix}_${key}`;
    switch (config.backend) {
      case StorageBackend.MEMORY:
        return this.memory.get(key);
      case StorageBackend.SESSIONSTORAGE:
        return JSON.parse(sessionStorage.getItem(key));
      case StorageBackend.LOCALSTORAGE:
        return JSON.parse(localStorage.getItem(key));
      case StorageBackend.COOKIE:
        throw Error('Not implemented.');
    }
  }

  setItem(key: string, value: any) {
    let config = this.storageConfig.get(key);
    if (!config) {
      throw new Error(`No specification found for storage key '${key}'.`);
    }
    let prefix = config.prefix ?? APP_PREFIX;
    key = `${prefix}_${key}`;
    switch (config.backend) {
      case StorageBackend.MEMORY:
        this.memory.set(key, value);
        break;
      case StorageBackend.SESSIONSTORAGE:
        sessionStorage.setItem(key, JSON.stringify(value));
        break;
      case StorageBackend.LOCALSTORAGE:
        localStorage.setItem(key, JSON.stringify(value));
        break;
      case StorageBackend.COOKIE:
        throw Error('Not implemented.');
    }
  }

  removeItem(key: string) {
    let config = this.storageConfig.get(key);
    if (!config) {
      throw new Error(`No specification found for storage key '${key}'.`);
    }
    let prefix = config.prefix ?? APP_PREFIX;
    key = `${prefix}_${key}`;
    switch (config.backend) {
      case StorageBackend.MEMORY:
        this.memory.delete(key);
        break;
      case StorageBackend.SESSIONSTORAGE:
        sessionStorage.removeItem(key);
        break;
      case StorageBackend.LOCALSTORAGE:
        localStorage.removeItem(key);
        break;
      case StorageBackend.COOKIE:
        throw Error('Not implemented.');
    }
  }

  /* TODO: Remove compatibility wrappers, migrate to new functions */
  getMemoryItem(key: MemoryStorageKey) {
    return this.getItem(key);
  }

  getLocalStorageItem(key: LocalStorageKey) {
    return this.getItem(key);
  }

  setMemoryItem(key: MemoryStorageKey, value: any) {
    this.setItem(key, value);
  }

  setLocalStorageItem(key: LocalStorageKey, value: any) {
    this.setItem(key, value);
  }

  deleteLocalStorageItem(key: LocalStorageKey) {
    this.removeItem(`${APP_PREFIX}${key}`);
  }

  deleteMemoryStorageItem(key: MemoryStorageKey) {
    this.removeItem(key);
  }
}
