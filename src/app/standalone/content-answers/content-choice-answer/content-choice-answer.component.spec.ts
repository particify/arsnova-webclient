import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnswerOption } from '@app/core/models/answer-option';
import { LikertScaleTemplate } from '@app/core/models/likert-scale-template.enum';
import { SelectableAnswer } from '@app/core/models/selectable-answer';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { BROWSER_LANG } from '@app/core/services/util/language.service';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { ContentChoiceAnswerComponent } from '@app/standalone/content-answers/content-choice-answer/content-choice-answer.component';
import { TranslocoService } from '@jsverse/transloco';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModuleWithTranslations } from '@testing/transloco-testing.module';
import { of } from 'rxjs';

/*
 * Option labels of a Likert content are translation keys resolved against the language of the
 * room, not the language of the UI, so that every participant reads the same scale. Plain choice
 * contents carry literal labels which no language may touch.
 */
describe('ContentChoiceAnswerComponent option labels', () => {
  const likertLabels = new LikertScaleService().getOptionLabels(
    LikertScaleTemplate.AGREEMENT,
    5
  ) as string[];
  const SOMEWHAT_AGREE_KEY = 'option-template.agreement-positive-1';
  const SOMEWHAT_AGREE_EN = 'Somewhat agree';
  const SOMEWHAT_AGREE_DE = 'stimme eher zu';

  let translateService: TranslocoService;

  beforeEach(() => {
    const formattingService = jasmine.createSpyObj(['postString']);
    formattingService.postString.and.returnValue(of('rendered'));
    configureTestModule(
      [getTranslocoModuleWithTranslations()],
      [
        { provide: BROWSER_LANG, useValue: 'en' },
        { provide: FormattingService, useValue: formattingService },
      ]
    );
    translateService = TestBed.inject(TranslocoService);
  });

  function createComponent(
    uiLang: string,
    roomLang?: string,
    labels: string[] = likertLabels,
    translateOptions = true
  ): ComponentFixture<ContentChoiceAnswerComponent> {
    translateService.setActiveLang(uiLang);
    const fixture = TestBed.createComponent(ContentChoiceAnswerComponent);
    fixture.componentInstance.selectableAnswers = labels.map(
      (label) => new SelectableAnswer(new AnswerOption(label), false)
    );
    fixture.componentInstance.translateOptions = translateOptions;
    fixture.componentInstance.language = roomLang;
    fixture.detectChanges();
    return fixture;
  }

  function displayedLabels(
    fixture: ComponentFixture<ContentChoiceAnswerComponent>
  ): string[] {
    return (fixture.componentInstance.displayAnswers ?? []).map(
      (a) => a.answerOption.label
    );
  }

  it('should use the UI language when the room has none', () => {
    expect(displayedLabels(createComponent('de'))).toContain(SOMEWHAT_AGREE_DE);
    expect(displayedLabels(createComponent('en'))).toContain(SOMEWHAT_AGREE_EN);
  });

  it('should use an English room language over a German UI', () => {
    expect(displayedLabels(createComponent('de', 'en'))).toContain(
      SOMEWHAT_AGREE_EN
    );
  });

  it('should use a German room language over an English UI', () => {
    expect(displayedLabels(createComponent('en', 'de'))).toContain(
      SOMEWHAT_AGREE_DE
    );
  });

  it('should keep the labels of a choice content untranslated', () => {
    const labels = ['answer 1', 'answer 2'];
    expect(displayedLabels(createComponent('en', 'de', labels, false))).toEqual(
      labels
    );
  });

  it('should derive the option labels from the scale template', () => {
    expect(likertLabels).toContain(SOMEWHAT_AGREE_KEY);
  });
});
