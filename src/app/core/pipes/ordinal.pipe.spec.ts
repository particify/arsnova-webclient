import { TranslocoService } from '@jsverse/transloco';
import { OrdinalPipe } from './ordinal.pipe';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';

describe('OrdinalPipe', () => {
  let translateService: TranslocoService;
  let pipe: OrdinalPipe;
  let translateSpy: jasmine.Spy;
  beforeEach(() => {
    const testBed = configureTestModule(
      [getTranslocoModule()],
      [TranslocoService]
    );
    translateService = testBed.inject(TranslocoService);
    testBed.runInInjectionContext(() => {
      pipe = new OrdinalPipe();
    });
    translateSpy = spyOn(translateService, 'translate');
  });
  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
  it('transforms "1" to "1." with German localization', () => {
    translateService.setActiveLang('de');
    pipe.transform(1);
    expect(translateSpy).toHaveBeenCalledWith('ordinal.other');
  });
  it('transforms "2" to "2." with German localization', () => {
    translateService.setActiveLang('de');
    pipe.transform(2);
    expect(translateSpy).toHaveBeenCalledWith('ordinal.other');
  });
  it('transforms "3" to "3." with German localization', () => {
    translateService.setActiveLang('de');
    pipe.transform(3);
    expect(translateSpy).toHaveBeenCalledWith('ordinal.other');
  });
  it('transforms "42" to "42." with German localization', () => {
    translateService.setActiveLang('de');
    pipe.transform(42);
    expect(translateSpy).toHaveBeenCalledWith('ordinal.other');
  });
  it('transforms "1" to "1st" with English localization', () => {
    translateService.setActiveLang('en');
    pipe.transform(1);
    expect(translateSpy).toHaveBeenCalledWith('ordinal.one');
  });
  it('transforms "2" to "2nd" with English localization', () => {
    translateService.setActiveLang('en');
    pipe.transform(2);
    expect(translateSpy).toHaveBeenCalledWith('ordinal.two');
  });
  it('transforms "3" to "3rd" with English localization', () => {
    translateService.setActiveLang('en');
    pipe.transform(3);
    expect(translateSpy).toHaveBeenCalledWith('ordinal.few');
  });
  it('transforms "42" to "42nd" with English localization', () => {
    translateService.setActiveLang('en');
    pipe.transform(42);
    expect(translateSpy).toHaveBeenCalledWith('ordinal.two');
  });
  it('transforms "1" to "1°" with Spanish localization', () => {
    translateService.setActiveLang('es');
    pipe.transform(1);
    expect(translateSpy).toHaveBeenCalledWith('ordinal.other');
  });
  it('transforms "2" to "2°" with Spanish localization', () => {
    translateService.setActiveLang('es');
    pipe.transform(2);
    expect(translateSpy).toHaveBeenCalledWith('ordinal.other');
  });
  it('transforms "3" to "3°" with Spanish localization', () => {
    translateService.setActiveLang('es');
    pipe.transform(3);
    expect(translateSpy).toHaveBeenCalledWith('ordinal.other');
  });
  it('transforms "42" to "42°" with Spanish localization', () => {
    translateService.setActiveLang('es');
    pipe.transform(42);
    expect(translateSpy).toHaveBeenCalledWith('ordinal.other');
  });
});
