import { DOCUMENT } from '@angular/common';
import {
  EventEmitter,
  Inject,
  Injectable,
  InjectionToken,
} from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { GlobalStorageService, STORAGE_KEYS } from './global-storage.service';
import { Language } from '@app/core/models/language';
import { LanguageCategory } from '@app/core/models/language-category.enum';

export const BROWSER_LANG = new InjectionToken<string>('BROWSER_LANG');

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  public readonly langEmitter = new EventEmitter<string>();
  private langs: Language[] = [
    {
      key: 'de',
      name: 'Deutsch',
      category: LanguageCategory.OFFICIAL,
    },
    {
      key: 'en',
      name: 'English',
      category: LanguageCategory.OFFICIAL,
    },
    {
      key: 'es',
      name: 'Español',
      category: LanguageCategory.COMMUNITY,
    },
  ];

  constructor(
    private translateService: TranslocoService,
    private globalStorageService: GlobalStorageService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(BROWSER_LANG) private browserLang: string
  ) {}

  private getLangWithKey(key: string) {
    return this.langs.find((lang) => lang.key === key);
  }

  init() {
    this.translateService.setDefaultLang('en');
    let key = this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE);
    // If no language is stored in storage yet or it's not supported, get browser lang
    if (!key || !this.getLangWithKey(key)) {
      key = this.browserLang;
      const lang = this.getLangWithKey(key);
      // If browser lang is not officially supported, use english as fallback
      if (!lang || lang.category !== LanguageCategory.OFFICIAL) {
        key = 'en';
      }
    }
    this.setLang(key);
  }

  setLang(key: string) {
    this.translateService.setActiveLang(key);
    this.globalStorageService.setItem(STORAGE_KEYS.LANGUAGE, key);
    this.document.documentElement.lang = key;
    this.langEmitter.emit(key);
  }

  getLangs() {
    return this.langs;
  }
}
