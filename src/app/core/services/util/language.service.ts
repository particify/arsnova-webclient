import {
  EventEmitter,
  Injectable,
  InjectionToken,
  inject,
  DOCUMENT,
} from '@angular/core';
import { GlobalStorageService, STORAGE_KEYS } from './global-storage.service';
import { Language } from '@app/core/models/language';
import { LanguageCategory } from '@app/core/models/language-category.enum';
import { Observable } from 'rxjs';
import { IsoLanguage } from '@app/core/models/iso-language';
import { AbstractHttpService } from '@app/core/services/http/abstract-http.service';
import dayjs from 'dayjs';

export const BROWSER_LANG = new InjectionToken<string>('BROWSER_LANG');

@Injectable({
  providedIn: 'root',
})
export class LanguageService extends AbstractHttpService<void> {
  private globalStorageService = inject(GlobalStorageService);
  private document = inject<Document>(DOCUMENT);
  private browserLang = inject(BROWSER_LANG);

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
    {
      key: 'fr',
      name: 'Français',
      category: LanguageCategory.COMMUNITY,
    },
    {
      key: 'it',
      name: 'Italiano',
      category: LanguageCategory.COMMUNITY,
    },
  ];

  private localeImports: Record<string, () => Promise<any>> = {
    de: () => import('dayjs/locale/de'),
    en: () => import('dayjs/locale/en'),
    es: () => import('dayjs/locale/es'),
    fr: () => import('dayjs/locale/fr'),
    it: () => import('dayjs/locale/it'),
  };

  constructor() {
    super('/language');
  }

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
    this.loadDayJsLocales(key);
  }

  private loadDayJsLocales(key: string) {
    this.langs.forEach((lang) => {
      const localeImport = this.localeImports[lang.key];
      if (localeImport) {
        localeImport();
      } else {
        console.error(`No import path defined for locale "${lang.key}"`);
      }
    });
    dayjs.locale(key);
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

  getIsoLanguages(): Observable<IsoLanguage[]> {
    return this.http.get<IsoLanguage[]>(this.buildUri('/'));
  }

  ensureValidLang(lang?: string): string {
    return lang &&
      this.translateService.getAvailableLangs().some((l) => l === lang)
      ? lang
      : this.translateService.getActiveLang();
  }
}
