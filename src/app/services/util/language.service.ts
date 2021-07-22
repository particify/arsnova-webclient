import { DOCUMENT } from '@angular/common';
import { EventEmitter, Inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GlobalStorageService, STORAGE_KEYS } from './global-storage.service';

@Injectable()
export class LanguageService {
  public readonly langEmitter = new EventEmitter<string>();
  private lang: string;

  constructor(
    private translateService: TranslateService,
    private globalStorageService: GlobalStorageService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  init() {
    this.translateService.setDefaultLang('en');
    if (!this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)) {
      const lang = this.translateService.getBrowserLang();
      this.setLang(lang);
    } else {
      this.setLang(this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE));
    }
  }

  setLang(lang: string) {
    if (['de', 'en'].indexOf(lang) === -1) {
      lang = 'en';
    }
    this.useLanguage(lang);
  }

  private useLanguage(language: string) {
    this.translateService.use(language);
    this.lang = language;
    this.globalStorageService.setItem(STORAGE_KEYS.LANGUAGE, language);
    this.document.documentElement.lang = language;
    this.langEmitter.emit(language);
  }
}
