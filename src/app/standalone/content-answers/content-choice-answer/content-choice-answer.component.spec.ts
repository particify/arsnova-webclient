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
import {
  getTranslocoModule,
  getTranslocoModuleWithTranslations,
} from '@testing/transloco-testing.module';
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
    fixture.componentRef.setInput(
      'answerOptions',
      labels.map(
        (label) => new SelectableAnswer(new AnswerOption(label), false)
      )
    );
    fixture.componentRef.setInput('translateOptions', translateOptions);
    fixture.componentRef.setInput('language', roomLang);
    fixture.detectChanges();
    return fixture;
  }

  function displayedLabels(
    fixture: ComponentFixture<ContentChoiceAnswerComponent>
  ): string[] {
    return fixture.componentInstance
      .displayAnswers()
      .map((a) => a.answerOption.label);
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

  it('should keep the selection of translated options', () => {
    const fixture = createComponent('en');
    fixture.componentInstance.updateSelection(1);
    fixture.detectChanges();
    expect(
      fixture.componentInstance.displayAnswers().map((a) => a.checked)
    ).toEqual([false, true, false, false, false]);
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

describe('ContentChoiceAnswerComponent', () => {
  let fixture: ComponentFixture<ContentChoiceAnswerComponent>;
  let component: ContentChoiceAnswerComponent;

  /** Three options with the first one picked, as a given answer leaves them. */
  function answerOptions(): SelectableAnswer[] {
    return ['Berlin', 'Bonn', 'Bern'].map(
      (label, index) =>
        new SelectableAnswer(new AnswerOption(label), index === 0)
    );
  }

  function setUp(correctOptionIndexes?: number[]) {
    const formattingService = jasmine.createSpyObj('FormattingService', [
      'postString',
    ]);
    formattingService.postString.and.returnValue(of({ html: '' }));

    configureTestModule(
      [getTranslocoModule(), ContentChoiceAnswerComponent],
      [
        { provide: FormattingService, useValue: formattingService },
        { provide: BROWSER_LANG, useValue: 'en' },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(ContentChoiceAnswerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('answerOptions', answerOptions());
    fixture.componentRef.setInput('answered', true);
    fixture.componentRef.setInput('correctOptionsPublished', true);
    fixture.componentRef.setInput('correctOptionIndexes', correctOptionIndexes);
    fixture.detectChanges();
  }

  it('marks a pick correct when it is among the correct options', () => {
    setUp([0]);
    expect(component.checkedOptions()[0]).toEqual({
      correct: true,
      incorrect: false,
    });
  });

  it('marks a pick incorrect when it is not among the correct options', () => {
    setUp([1]);
    expect(component.checkedOptions()[0]).toEqual({
      correct: false,
      incorrect: true,
    });
  });

  it('marks a pick neither way when there are no correct options', () => {
    setUp(undefined);
    expect(component.checkedOptions()[0]).toEqual({
      correct: false,
      incorrect: false,
    });
  });

  it('leaves the unpicked options unmarked', () => {
    setUp([1]);
    expect(component.checkedOptions().slice(1)).toEqual([
      { correct: false, incorrect: false },
      { correct: false, incorrect: false },
    ]);
  });

  it('marks nothing while the correct options are unpublished', () => {
    setUp([1]);
    fixture.componentRef.setInput('correctOptionsPublished', false);
    fixture.detectChanges();
    expect(component.checkedOptions()[0]).toEqual({
      correct: false,
      incorrect: false,
    });
  });

  it('shows no correctness indicator when there are no correct options', () => {
    setUp(undefined);
    expect(component.correctOptionVisible()).toEqual([false, false, false]);
  });

  it('marks a pick neither way when the correct options are empty', () => {
    setUp([]);
    expect(component.checkedOptions()[0]).toEqual({
      correct: false,
      incorrect: false,
    });
  });

  it('shows no correctness indicator when the correct options are empty', () => {
    setUp([]);
    expect(component.correctOptionVisible()).toEqual([false, false, false]);
  });
});
