import { Injectable, InjectionToken, Inject, Provider } from '@angular/core';

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
  key: symbol,
  name: string,
  prefix?: string,
  category: StorageItemCategory,
  backend: StorageBackend
}

export const STORAGECONFIG_PROVIDER_TOKEN : InjectionToken<StorageItem> = new InjectionToken('STORAGECONFIG_PROVIDER_TOKEN');

/**
 * Provides {@link Symbol}s for referencing {@link StorageItem} configurations.
 *
 * Because Symbols are unique, they cannot be recreated, so their use ensures
 * that only predefined item configurations can be used.
 */
export const STORAGE_KEYS: { [key: string]: symbol } = {
  ROOM_ACCESS: Symbol(),
  USER: Symbol(),
  COOKIE_CONSENT: Symbol(),
  LOGGED_IN: Symbol(),
  ROOM_ID: Symbol(),
  SHORT_ID: Symbol(),
  DEVICE_TYPE: Symbol(),
  IS_SAFARI: Symbol(),
  MODERATION_ENABLED: Symbol(),
  CONTENT_GROUPS: Symbol(),
  LAST_GROUP: Symbol(),
  THEME: Symbol(),
  LANGUAGE: Symbol()
};

/**
 * Define configurations for globally accessible variables.
 */
export const STORAGE_CONFIG: StorageItem[] = [
  {
    key: STORAGE_KEYS.ROOM_ACCESS,
    name: 'ROOM_ACCESS',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.LOCALSTORAGE
  },
  {
    key: STORAGE_KEYS.USER,
    name: 'USER',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.LOCALSTORAGE
  },
  {
    key: STORAGE_KEYS.COOKIE_CONSENT,
    name: 'COOKIE_CONSENT',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.LOCALSTORAGE
  },
  {
    key: STORAGE_KEYS.LOGGED_IN,
    name: 'LOGGED_IN',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.LOCALSTORAGE
  },
  {
    key: STORAGE_KEYS.ROOM_ID,
    name: 'ROOM_ID',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.MEMORY
  },
  {
    key: STORAGE_KEYS.SHORT_ID,
    name: 'SHORT_ID',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.MEMORY
  },
  {
    key: STORAGE_KEYS.DEVICE_TYPE,
    name: 'DEVICE_TYPE',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.MEMORY
  },
  {
    key: STORAGE_KEYS.IS_SAFARI,
    name: 'IS_SAFARI',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.MEMORY
  },
  {
    key: STORAGE_KEYS.MODERATION_ENABLED,
    name: 'MODERATION_ENABLED',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.MEMORY
  },
  {
    key: STORAGE_KEYS.CONTENT_GROUPS,
    name: 'CONTENT_GROUPS',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.MEMORY
  },
  {
    key: STORAGE_KEYS.LAST_GROUP,
    name: 'LAST_GROUP',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.MEMORY
  },
  {
    key: STORAGE_KEYS.THEME,
    name: 'THEME',
    category: StorageItemCategory.FUNCTIONAL,
    backend: StorageBackend.LOCALSTORAGE
  },
  {
    key: STORAGE_KEYS.LANGUAGE,
    name: 'LANGUAGE',
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
  memory: Map<symbol, any> = new Map();
  shortId: string;
  readonly storageConfig: Map<symbol, StorageItem> = new Map();

  constructor(
    @Inject(STORAGECONFIG_PROVIDER_TOKEN) storageConfigItems: StorageItem[]
  ) {
    storageConfigItems.forEach((item) => {
      this.storageConfig.set(item.key, item);
    });
    // Memory setup
    const userAgent = navigator.userAgent;
    let isSafari = false;
    let deviceType = 'desktop';
    // Check if mobile device
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      // Check if IOS device
      if (/iPhone|iPad|iPod/.test(userAgent)) {
        isSafari = true;
      }
      deviceType = 'mobile';
    } else {
      // Check if Mac
      if (/Macintosh|MacIntel|MacPPC|Mac68k/.test(userAgent)) {
        // Check if Safari browser
        if (userAgent.indexOf('Safari') !== -1 && userAgent.indexOf('Chrome') === -1) {
          isSafari = true;
        }
      }
    }
    this.setItem(STORAGE_KEYS.IS_SAFARI, isSafari);
    this.setItem(STORAGE_KEYS.DEVICE_TYPE, deviceType);
  }

  getItem(key: symbol): any {
    let config = this.storageConfig.get(key);
    if (!config) {
      throw new Error(`No specification found for storage key.`);
    }
    let prefix = config.prefix ?? APP_PREFIX;
    let name = `${prefix}_${config.name}`;
    switch (config.backend) {
      case StorageBackend.MEMORY:
        return this.memory.get(key);
      case StorageBackend.SESSIONSTORAGE:
        return JSON.parse(sessionStorage.getItem(name));
      case StorageBackend.LOCALSTORAGE:
        return JSON.parse(localStorage.getItem(name));
      case StorageBackend.COOKIE:
        throw Error('Not implemented.');
    }
  }

  setItem(key: symbol, value: any) {
    let config = this.storageConfig.get(key);
    if (!config) {
      throw new Error(`No specification found for storage key.`);
    }
    let prefix = config.prefix ?? APP_PREFIX;
    let name = `${prefix}_${config.name}`;
    switch (config.backend) {
      case StorageBackend.MEMORY:
        this.memory.set(key, value);
        break;
      case StorageBackend.SESSIONSTORAGE:
        sessionStorage.setItem(name, JSON.stringify(value));
        break;
      case StorageBackend.LOCALSTORAGE:
        localStorage.setItem(name, JSON.stringify(value));
        break;
      case StorageBackend.COOKIE:
        throw Error('Not implemented.');
    }
  }

  removeItem(key: symbol) {
    let config = this.storageConfig.get(key);
    if (!config) {
      throw new Error(`No specification found for storage key.`);
    }
    let prefix = config.prefix ?? APP_PREFIX;
    let name = `${prefix}_${config.name}`;
    switch (config.backend) {
      case StorageBackend.MEMORY:
        this.memory.delete(key);
        break;
      case StorageBackend.SESSIONSTORAGE:
        sessionStorage.removeItem(name);
        break;
      case StorageBackend.LOCALSTORAGE:
        localStorage.removeItem(name);
        break;
      case StorageBackend.COOKIE:
        throw Error('Not implemented.');
    }
  }
}
