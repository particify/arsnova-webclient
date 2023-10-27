import { TestBed } from '@angular/core/testing';

import {
  BROWSER_LANG,
  LanguageService,
} from '@app/core/services/util/language.service';
import { TranslocoService } from '@ngneat/transloco';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventService } from '@app/core/services/util/event.service';
import {
  MockEventService,
  MockNotificationService,
} from '@testing/test-helpers';
import { NotificationService } from '@app/core/services/util/notification.service';
import { getTranslocoModule } from '@testing/transloco-testing.module';

describe('LanguageService', () => {
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
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, getTranslocoModule()],
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
        {
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        { provide: BROWSER_LANG, useValue: 'unsupported' },
      ],
    });
  });

  it('should be created', () => {
    langService = TestBed.inject(LanguageService);
    expect(langService).toBeTruthy();
  });

  it('should use english as fallback if language stored in global storage is not supported and browser lang too', () => {
    langService = TestBed.inject(LanguageService);
    const setLangSpy = spyOn(langService, 'setLang');
    globalStorageService.getItem
      .withArgs(STORAGE_KEYS.LANGUAGE)
      .and.returnValue('unsupported');
    langService.init();
    expect(setLangSpy).toHaveBeenCalledWith('en');
  });

  it('should use english as fallback if no language stored in global storage and browser lang is not supported', () => {
    langService = TestBed.inject(LanguageService);
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
    langService = TestBed.inject(LanguageService);
    const setLangSpy = spyOn(langService, 'setLang');
    globalStorageService.getItem
      .withArgs(STORAGE_KEYS.LANGUAGE)
      .and.returnValue('de');
    langService.init();
    expect(setLangSpy).toHaveBeenCalledWith('de');
  });

  it('should use language stored in global storage if supported even if not officially', () => {
    langService = TestBed.inject(LanguageService);
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
});

function overrideBrowserLang(lang: string) {
  TestBed.overrideProvider(BROWSER_LANG, { useValue: lang });
  return TestBed.inject(LanguageService);
}
