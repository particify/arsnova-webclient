import { TestBed } from '@angular/core/testing';

import {
  BROWSER_LANG,
  LanguageService,
} from '@app/core/services/util/language.service';
import { TranslocoService } from '@jsverse/transloco';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';

describe('LanguageService', () => {
  let testBed: TestBed;
  let langService: LanguageService;

  const translateService = jasmine.createSpyObj('TranslocoService', [
    'setDefaultLang',
    'getBrowserLang',
    'setActiveLang',
  ]);

  const globalStorageService = jasmine.createSpyObj('GlobalStorageService', [
    'getItem',
    'setItem',
  ]);

  beforeEach(() => {
    testBed = configureTestModule(
      [getTranslocoModule()],
      [
        LanguageService,
        {
          provide: TranslocoService,
          useValue: translateService,
        },
        {
          provide: GlobalStorageService,
          useValue: globalStorageService,
        },
        { provide: BROWSER_LANG, useValue: 'unsupported' },
      ]
    );
  });

  it('should be created', () => {
    langService = testBed.inject(LanguageService);
    expect(langService).toBeTruthy();
  });

  it('should use english as fallback if language stored in global storage is not supported and browser lang too', () => {
    langService = testBed.inject(LanguageService);
    const setLangSpy = spyOn(langService, 'setLang');
    globalStorageService.getItem
      .withArgs(STORAGE_KEYS.LANGUAGE)
      .and.returnValue('unsupported');
    langService.init();
    expect(setLangSpy).toHaveBeenCalledWith('en');
  });

  it('should use english as fallback if no language stored in global storage and browser lang is not supported', () => {
    langService = testBed.inject(LanguageService);
    const setLangSpy = spyOn(langService, 'setLang');
    globalStorageService.getItem
      .withArgs(STORAGE_KEYS.LANGUAGE)
      .and.returnValue(null);
    langService.init();
    expect(setLangSpy).toHaveBeenCalledWith('en');
  });

  it('should use english as fallback if no language stored in global storage and browser lang is supported but not officially', () => {
    langService = overrideBrowserLang('es');
    const setLangSpy = spyOn(langService, 'setLang');
    globalStorageService.getItem
      .withArgs(STORAGE_KEYS.LANGUAGE)
      .and.returnValue(null);
    langService.init();
    expect(setLangSpy).toHaveBeenCalledWith('en');
  });

  it('should use language stored in global storage if supported', () => {
    langService = testBed.inject(LanguageService);
    const setLangSpy = spyOn(langService, 'setLang');
    globalStorageService.getItem
      .withArgs(STORAGE_KEYS.LANGUAGE)
      .and.returnValue('de');
    langService.init();
    expect(setLangSpy).toHaveBeenCalledWith('de');
  });

  it('should use language stored in global storage if supported even if not officially', () => {
    langService = testBed.inject(LanguageService);
    const setLangSpy = spyOn(langService, 'setLang');
    globalStorageService.getItem
      .withArgs(STORAGE_KEYS.LANGUAGE)
      .and.returnValue('es');
    langService.init();
    expect(setLangSpy).toHaveBeenCalledWith('es');
  });

  it('should use browser lang if no language stored in global storage and browser lang is supported', () => {
    langService = overrideBrowserLang('de');
    const setLangSpy = spyOn(langService, 'setLang');
    globalStorageService.getItem
      .withArgs(STORAGE_KEYS.LANGUAGE)
      .and.returnValue(null);
    langService.init();
    expect(setLangSpy).toHaveBeenCalledWith('de');
  });

  it('should use browser lang if language stored in global storage is not supported but browser lang', () => {
    langService = overrideBrowserLang('de');
    const setLangSpy = spyOn(langService, 'setLang');
    globalStorageService.getItem
      .withArgs(STORAGE_KEYS.LANGUAGE)
      .and.returnValue('unsupported');
    langService.init();
    expect(setLangSpy).toHaveBeenCalledWith('de');
  });

  function overrideBrowserLang(lang: string) {
    testBed.overrideProvider(BROWSER_LANG, { useValue: lang });
    return testBed.inject(LanguageService);
  }
});
