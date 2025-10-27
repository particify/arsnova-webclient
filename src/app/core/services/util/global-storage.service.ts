import { Injectable, InjectionToken, Provider, inject } from '@angular/core';
import {
  StorageBackend,
  StorageItem,
  StorageItemCategory,
} from '@app/core/models/storage';
import { EventService } from './event.service';
import { ConsentChangedEventPayload } from '@app/core/models/events/consent-changed';

export const STORAGECONFIG_PROVIDER_TOKEN: InjectionToken<StorageItem[]> =
  new InjectionToken('STORAGECONFIG_PROVIDER_TOKEN');

/**
 * Provides {@link Symbol}s for referencing {@link StorageItem} configurations.
 *
 * Because Symbols are unique, they cannot be recreated, so their use ensures
 * that only predefined item configurations can be used.
 */
export const STORAGE_KEYS: { [key: string]: symbol } = {
  ACCESS_TOKEN: Symbol(),
  USER: Symbol(),
  COOKIE_CONSENT: Symbol(),
  GUEST_TOKEN: Symbol(),
  ROOM_ID: Symbol(),
  SHORT_ID: Symbol(),
  DEVICE_TYPE: Symbol(),
  CONTENT_GROUPS: Symbol(),
  LAST_GROUP: Symbol(),
  LAST_INDEX: Symbol(),
  THEME: Symbol(),
  LANGUAGE: Symbol(),
  COMMENT_SORT: Symbol(),
  UPDATED: Symbol(),
  LATEST_ANNOUNCED_VERSION: Symbol(),
  IMPORT_TOKEN: Symbol(),
  COMMENT_TIME_FILTER: Symbol(),
  BROWSER_SESSION_INITIALIZED: Symbol(),
  REDIRECT_URL: Symbol(),
  HOTKEY_COUNT: Symbol(),
  UI_ERROR_COUNT: Symbol(),
  HTTP_ERROR_COUNT: Symbol(),
  SHOW_SHARE_OVERLAY: Symbol(),
};

/**
 * Define configurations for globally accessible variables.
 */
export const STORAGE_CONFIG: StorageItem[] = [
  {
    key: STORAGE_KEYS.ACCESS_TOKEN,
    name: 'ACCESS_TOKEN',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.LOCALSTORAGE,
  },
  {
    key: STORAGE_KEYS.USER,
    name: 'USER',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.LOCALSTORAGE,
  },
  {
    key: STORAGE_KEYS.COOKIE_CONSENT,
    name: 'COOKIE_CONSENT',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.LOCALSTORAGE,
  },
  {
    key: STORAGE_KEYS.GUEST_TOKEN,
    name: 'GUEST_TOKEN',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.LOCALSTORAGE,
  },
  {
    key: STORAGE_KEYS.ROOM_ID,
    name: 'ROOM_ID',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.MEMORY,
  },
  {
    key: STORAGE_KEYS.DEVICE_TYPE,
    name: 'DEVICE_TYPE',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.MEMORY,
  },
  {
    key: STORAGE_KEYS.CONTENT_GROUPS,
    name: 'CONTENT_GROUPS',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.MEMORY,
  },
  {
    key: STORAGE_KEYS.LAST_GROUP,
    name: 'LAST_GROUP',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.MEMORY,
  },
  {
    key: STORAGE_KEYS.LAST_INDEX,
    name: 'LAST_INDEX',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.MEMORY,
  },
  {
    key: STORAGE_KEYS.THEME,
    name: 'THEME',
    category: StorageItemCategory.FUNCTIONAL,
    backend: StorageBackend.LOCALSTORAGE,
  },
  {
    key: STORAGE_KEYS.LANGUAGE,
    name: 'LANGUAGE',
    category: StorageItemCategory.FUNCTIONAL,
    backend: StorageBackend.LOCALSTORAGE,
  },
  {
    key: STORAGE_KEYS.COMMENT_SORT,
    name: 'COMMENT_SORT',
    category: StorageItemCategory.FUNCTIONAL,
    backend: StorageBackend.SESSIONSTORAGE,
  },
  {
    key: STORAGE_KEYS.UPDATED,
    name: 'UPDATED',
    category: StorageItemCategory.FUNCTIONAL,
    backend: StorageBackend.LOCALSTORAGE,
  },
  {
    key: STORAGE_KEYS.LATEST_ANNOUNCED_VERSION,
    name: 'LATEST_ANNOUNCED_VERSION',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.SESSIONSTORAGE,
  },
  {
    key: STORAGE_KEYS.BROWSER_SESSION_INITIALIZED,
    name: 'BROWSER_SESSION_INITIALIZED',
    category: StorageItemCategory.STATISTICS,
    backend: StorageBackend.SESSIONSTORAGE,
  },
  // Used by extensions
  {
    key: STORAGE_KEYS.IMPORT_TOKEN,
    name: 'IMPORT_TOKEN',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.SESSIONSTORAGE,
  },
  {
    key: STORAGE_KEYS.COMMENT_TIME_FILTER,
    name: 'COMMENT_TIME_FILTER',
    category: StorageItemCategory.FUNCTIONAL,
    backend: StorageBackend.SESSIONSTORAGE,
  },
  {
    key: STORAGE_KEYS.REDIRECT_URL,
    name: 'REDIRECT_URL',
    category: StorageItemCategory.FUNCTIONAL,
    backend: StorageBackend.SESSIONSTORAGE,
  },
  {
    key: STORAGE_KEYS.HOTKEY_COUNT,
    name: 'HOTKEY_COUNT',
    category: StorageItemCategory.STATISTICS,
    backend: StorageBackend.SESSIONSTORAGE,
  },
  {
    key: STORAGE_KEYS.UI_ERROR_COUNT,
    name: 'UI_ERROR_COUNT',
    category: StorageItemCategory.STATISTICS,
    backend: StorageBackend.SESSIONSTORAGE,
  },
  {
    key: STORAGE_KEYS.HTTP_ERROR_COUNT,
    name: 'HTTP_ERROR_COUNT',
    category: StorageItemCategory.STATISTICS,
    backend: StorageBackend.SESSIONSTORAGE,
  },
  {
    key: STORAGE_KEYS.SHOW_SHARE_OVERLAY,
    name: 'SHOW_SHARE_OVERLAY',
    category: StorageItemCategory.REQUIRED,
    backend: StorageBackend.SESSIONSTORAGE,
  },
];

/**
 * Contains dependency injection {@link Provider}s for {@link StorageItem} in
 * {@link STORAGE_CONFIG}.
 */
export const STORAGE_CONFIG_PROVIDERS: Provider[] = STORAGE_CONFIG.map(
  (config) => {
    return {
      provide: STORAGECONFIG_PROVIDER_TOKEN,
      useValue: config,
      multi: true,
    };
  }
);

const APP_PREFIX = 'ARS';

/**
 * Provides a unified API for handling persistant and non-persistant application state.
 */
@Injectable({
  providedIn: 'root',
})
export class GlobalStorageService {
  private eventService = inject(EventService);

  memory: Map<symbol, any> = new Map();
  shortId?: string;
  readonly storageConfig: Map<symbol, StorageItem> = new Map();
  readonly backendOverrides: Map<StorageItemCategory, StorageBackend> =
    new Map();

  constructor() {
    const storageConfigItems = inject(STORAGECONFIG_PROVIDER_TOKEN);

    storageConfigItems.forEach((item) => {
      this.storageConfig.set(item.key, item);
    });
    this.eventService
      .on<ConsentChangedEventPayload>('ConsentChangedEvent')
      .subscribe((e) => this.handleConsentChange(e));

    // Memory setup
    const userAgent = navigator.userAgent;
    let deviceType = 'desktop';
    // Check if mobile device
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      )
    ) {
      deviceType = 'mobile';
    }
    this.setItem(STORAGE_KEYS.DEVICE_TYPE, deviceType);
  }

  /**
   * Override the storage backend setting for a category so that session storage
   * is used.
   *
   * @param category Category for which the storage backend is overriden
   */
  forceSessionStorageFor(category: StorageItemCategory) {
    if (this.backendOverrides.has(category)) {
      return;
    }

    /* Backup and remove items from old backend */
    const map: Map<symbol, any> = new Map();
    STORAGE_CONFIG.filter((i) => i.category === category).forEach((config) => {
      const value = this.getItem(config.key);
      if (value !== null) {
        map.set(config.key, value);
      }
      this.removeItem(config.key);
    });

    /* Create backend override */
    this.backendOverrides.set(category, StorageBackend.SESSIONSTORAGE);

    /* Restore items to new backend */
    map.forEach((v, k) => {
      this.setItem(k, v);
    });
  }

  /**
   * Reset the storage backend setting for a category to the default.
   *
   * @param category Category for which the storage backend is reset
   */
  resetBackendFor(category: StorageItemCategory) {
    if (!this.backendOverrides.has(category)) {
      return;
    }

    /* Backup and remove items from old backend */
    const map: Map<symbol, any> = new Map();
    STORAGE_CONFIG.filter((i) => i.category === category).forEach((config) => {
      const value = this.getItem(config.key);
      if (value !== null) {
        map.set(config.key, value);
      }
      this.removeItem(config.key);
    });

    /* Remove backend override */
    this.backendOverrides.delete(category);

    /* Restore items to new backend */
    map.forEach((v, k) => {
      this.setItem(k, v);
    });
  }

  getBackendFor(storage: StorageItem) {
    if (storage.backend === StorageBackend.MEMORY) {
      return storage.backend;
    }

    return this.backendOverrides.get(storage.category) ?? storage.backend;
  }

  getItem(key: symbol): any {
    const config = this.storageConfig.get(key);
    if (!config) {
      throw new Error(`No specification found for storage key.`);
    }
    const prefix = config.prefix ?? APP_PREFIX;
    const name = `${prefix}_${config.name}`;
    switch (this.getBackendFor(config)) {
      case StorageBackend.MEMORY:
        return this.memory.get(key);
      case StorageBackend.SESSIONSTORAGE: {
        const sessionStorageItem = sessionStorage.getItem(name);
        if (!sessionStorageItem) {
          return null;
        }
        return this.parseItemFromJSON(sessionStorageItem);
      }
      case StorageBackend.LOCALSTORAGE: {
        const localStorageItem = localStorage.getItem(name);
        if (!localStorageItem) {
          return null;
        }
        return this.parseItemFromJSON(localStorageItem);
      }
      case StorageBackend.COOKIE:
        throw Error('Not implemented.');
    }
  }

  parseItemFromJSON(item: string): any {
    try {
      return JSON.parse(item);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  setItem(key: symbol, value: any) {
    const config = this.storageConfig.get(key);
    if (!config) {
      throw new Error(`No specification found for storage key.`);
    }
    const prefix = config.prefix ?? APP_PREFIX;
    const name = `${prefix}_${config.name}`;
    switch (this.getBackendFor(config)) {
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
    const config = this.storageConfig.get(key);
    if (!config) {
      throw new Error(`No specification found for storage key.`);
    }
    const prefix = config.prefix ?? APP_PREFIX;
    const name = `${prefix}_${config.name}`;
    switch (this.getBackendFor(config)) {
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

  /**
   * Override storage backend config based on changes to user consent settings.
   */
  handleConsentChange(event: ConsentChangedEventPayload) {
    if (event.consentSettings) {
      this.setItem(STORAGE_KEYS.COOKIE_CONSENT, event.consentSettings);
    }
    event.categoriesSettings.forEach((c) => {
      if (c.consent) {
        this.resetBackendFor(c.key);
      } else {
        this.forceSessionStorageFor(c.key);
      }
    });
  }
}
