import { TestBed } from '@angular/core/testing';

import { LanguageService } from '@app/core/services/util/language.service';
import { TranslocoService } from '@ngneat/transloco';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';

describe('LanguageService', () => {
  let langService: LanguageService;

  const translateService = jasmine.createSpyObj('TranslocoService', [
    'setDefaultLang',
    'getBrowserLang',
    'use',
  ]);

  const globalStorageService = jasmine.createSpyObj('GlobalStorageService', [
    'getItem',
    'setItem',
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LanguageService,
        {
          provide: TranslocoService,
          useValue: translateService,
        },
        {
          provide: GlobalStorageService,
          useValue: globalStorageService,
        },
      ],
    });
    langService = TestBed.inject(LanguageService);
  });

  it('should be created', () => {
    expect(langService).toBeTruthy();
  });

  it('should use english as fallback if language stored in global storage is not supported and browser lang too', () => {
    const setLangSpy = spyOn(langService, 'setLang');
    globalStorageService.getItem
      .withArgs(STORAGE_KEYS.LANGUAGE)
      .and.returnValue('unsupported');
    translateService.getBrowserLang.and.returnValue('unsupported');
    langService.init();
    expect(setLangSpy).toHaveBeenCalledWith('en');
  });

  it('should use english as fallback if no language stored in global storage and browser lang is not supported', () => {
    const setLangSpy = spyOn(langService, 'setLang');
    globalStorageService.getItem
      .withArgs(STORAGE_KEYS.LANGUAGE)
      .and.returnValue(null);
    translateService.getBrowserLang.and.returnValue('unsupported');
    langService.init();
    expect(setLangSpy).toHaveBeenCalledWith('en');
  });

  it('should use english as fallback if no language stored in global storage and browser lang is supported but not officially', () => {
    const setLangSpy = spyOn(langService, 'setLang');
    globalStorageService.getItem
      .withArgs(STORAGE_KEYS.LANGUAGE)
      .and.returnValue(null);
    translateService.getBrowserLang.and.returnValue('es');
    langService.init();
    expect(setLangSpy).toHaveBeenCalledWith('en');
  });

  it('should use language stored in global storage if supported', () => {
    const setLangSpy = spyOn(langService, 'setLang');
    globalStorageService.getItem
      .withArgs(STORAGE_KEYS.LANGUAGE)
      .and.returnValue('de');
    langService.init();
    expect(setLangSpy).toHaveBeenCalledWith('de');
  });

  it('should use language stored in global storage if supported even if not officially', () => {
    const setLangSpy = spyOn(langService, 'setLang');
    globalStorageService.getItem
      .withArgs(STORAGE_KEYS.LANGUAGE)
      .and.returnValue('es');
    langService.init();
    expect(setLangSpy).toHaveBeenCalledWith('es');
  });

  it('should use browser lang if no language stored in global storage and browser lang is supported', () => {
    const setLangSpy = spyOn(langService, 'setLang');
    globalStorageService.getItem
      .withArgs(STORAGE_KEYS.LANGUAGE)
      .and.returnValue(null);
    translateService.getBrowserLang.and.returnValue('de');
    langService.init();
    expect(setLangSpy).toHaveBeenCalledWith('de');
  });

  it('should use browser lang if language stored in global storage is not supported but browser lang', () => {
    const setLangSpy = spyOn(langService, 'setLang');
    globalStorageService.getItem
      .withArgs(STORAGE_KEYS.LANGUAGE)
      .and.returnValue('unsupported');
    translateService.getBrowserLang.and.returnValue('de');
    langService.init();
    expect(setLangSpy).toHaveBeenCalledWith('de');
  });
});
