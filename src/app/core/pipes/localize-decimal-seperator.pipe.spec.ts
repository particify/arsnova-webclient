import { LocalizeDecimalSeperatorPipe } from '@app/core/pipes/localize-decimal-seperator.pipe';

import { TestBed } from '@angular/core/testing';

import { TranslocoService } from '@jsverse/transloco';

describe('LocalizeDecimalSeperatorPipe', () => {
  const translateService = jasmine.createSpyObj('TranslocoService', [
    'getActiveLang',
  ]);
  translateService.getActiveLang.and.returnValue('de');
  let pipe: LocalizeDecimalSeperatorPipe;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: TranslocoService,
          useValue: translateService,
        },
      ],
    });
    TestBed.runInInjectionContext(() => {
      pipe = new LocalizeDecimalSeperatorPipe();
    });
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  it('transforms "42" to "42"', () => {
    expect(pipe.transform(42)).toBe('42');
  });

  it('transforms "42.00" to "42" with german localization', () => {
    translateService.getActiveLang.and.returnValue('de');
    expect(pipe.transform(42.0)).toBe('42');
  });

  it('transforms "42.42" to "42,42" with german localization', () => {
    translateService.getActiveLang.and.returnValue('de');
    expect(pipe.transform(42.42)).toBe('42,42');
  });

  it('transforms "42.4" to "42,4" with german localization', () => {
    translateService.getActiveLang.and.returnValue('de');
    expect(pipe.transform(42.4)).toBe('42,4');
  });

  it('transforms "42.42424242" to "42,42" with german localization', () => {
    translateService.getActiveLang.and.returnValue('de');
    expect(pipe.transform(42.42424242)).toBe('42,42');
  });

  it('transforms "42.00" to "42" with english localization', () => {
    translateService.getActiveLang.and.returnValue('en');
    expect(pipe.transform(42.0)).toBe('42');
  });

  it('transforms "42.42" to "42.42" with english localization', () => {
    translateService.getActiveLang.and.returnValue('en');
    expect(pipe.transform(42.42)).toBe('42.42');
  });

  it('transforms "42.4" to "42.4" with english localization', () => {
    translateService.getActiveLang.and.returnValue('en');
    expect(pipe.transform(42.4)).toBe('42.4');
  });

  it('transforms "42.42424242" to "42.42" with english localization', () => {
    translateService.getActiveLang.and.returnValue('en');
    expect(pipe.transform(42.42424242)).toBe('42.42');
  });
});
