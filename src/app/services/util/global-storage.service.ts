import { Injectable } from '@angular/core';

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
  LAST_GROUP = 'LAST_GROUP',
  LAST_CONTENT = 'LAST_CONTENT'
}

const APP_PREFIX = 'ARS_';

@Injectable()
export class GlobalStorageService {
  memory: Map<MemoryStorageKey, any> = new Map();
  shortId: string;

  constructor(
  ) {
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

  getMemoryItem(key: MemoryStorageKey) {
    return this.memory.get(key);
  }

  getLocalStorageItem(key: LocalStorageKey) {
    if (localStorage.getItem(`${APP_PREFIX}${key}`)) {
      return JSON.parse(localStorage.getItem(`${APP_PREFIX}${key}`));
    }
    return undefined;
  }

  setMemoryItem(key: MemoryStorageKey, value: any) {
    this.memory.set(key, value);
  }

  setLocalStorageItem(key: LocalStorageKey, value: any) {
    localStorage.setItem(`${APP_PREFIX}${key}`, JSON.stringify(value));
  }

  deleteLocalStorageItem(key: LocalStorageKey) {
    localStorage.removeItem(key);
  }

  deleteMemoryStorageItem(key: MemoryStorageKey) {
    this.memory.delete(key);
  }
}
