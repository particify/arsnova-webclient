import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SelectableAnswer } from '@app/core/models/selectable-answer';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { BROWSER_LANG } from '@app/core/services/util/language.service';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { ContentChoiceAnswerComponent } from '@app/standalone/content-answers/content-choice-answer/content-choice-answer.component';
import { ContentNumericAnswerComponent } from '@app/standalone/content-answers/content-numeric-answer/content-numeric-answer.component';
import {
  ContentFormatData,
  ContentType,
  ScaleContentTemplate,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { TranslocoService } from '@jsverse/transloco';
import { of } from 'rxjs';
import {
  getTranslocoModule,
  getTranslocoModuleWithTranslations,
} from '@testing/transloco-testing.module';
import { ContentPreviewComponent } from './content-preview.component';

describe('ContentPreviewComponent', () => {
  let fixture: ComponentFixture<ContentPreviewComponent>;

  it('keeps the rendered label of each choice option', () => {
    TestBed.overrideComponent(ContentPreviewComponent, {
      set: { template: '' },
    });
    configureTestModule(
      [getTranslocoModule(), ContentPreviewComponent],
      [{ provide: LikertScaleService, useValue: new LikertScaleService() }]
    ).compileComponents();
    fixture = TestBed.createComponent(ContentPreviewComponent);
    fixture.componentRef.setInput('body', 'body');
    fixture.componentRef.setInput('contentFormatData', {
      __typename: 'ChoiceContentFormatData',
      format: ContentType.Choice,
      options: [{ label: '**A**', labelRendered: '<p><b>A</b></p>' }],
    });
    fixture.detectChanges();

    const inputs = fixture.componentInstance.componentInputs() as {
      answerOptions: SelectableAnswer[];
    };
    expect(inputs.answerOptions[0].answerOption).toEqual({
      label: '**A**',
      renderedLabel: '<p><b>A</b></p>',
    });
  });

  describe('binary', () => {
    function inputsFor(
      correctAnswer?: boolean | null,
      translocoModule = getTranslocoModule()
    ) {
      TestBed.overrideComponent(ContentPreviewComponent, {
        set: { template: '' },
      });
      configureTestModule(
        [translocoModule, ContentPreviewComponent],
        [{ provide: LikertScaleService, useValue: new LikertScaleService() }]
      ).compileComponents();
      fixture = TestBed.createComponent(ContentPreviewComponent);
      fixture.componentRef.setInput('body', 'body');
      fixture.componentRef.setInput('contentFormatData', {
        __typename: 'BinaryContentFormatData',
        format: ContentType.Binary,
        correctAnswer,
      } as ContentFormatData);
      fixture.detectChanges();
      return fixture.componentInstance.componentInputs() as {
        answerOptions: SelectableAnswer[];
        correctOptionIndexes?: number[];
      };
    }

    it('offers yes before no, both unchecked', () => {
      const inputs = inputsFor(true);
      expect(
        inputs.answerOptions.map((option) => option.answerOption.label)
      ).toEqual(['answer.yes', 'answer.no']);
      expect(inputs.answerOptions.some((option) => option.checked)).toBe(false);
    });

    it('marks yes as correct', () => {
      expect(inputsFor(true).correctOptionIndexes).toEqual([0]);
    });

    it('marks no as correct', () => {
      expect(inputsFor(false).correctOptionIndexes).toEqual([1]);
    });

    it('marks nothing without a correct answer', () => {
      expect(inputsFor(null).correctOptionIndexes).toBeUndefined();
    });

    it('labels the options in the active language and follows a switch', () => {
      const labels = () =>
        (
          fixture.componentInstance.componentInputs() as {
            answerOptions: SelectableAnswer[];
          }
        ).answerOptions.map((option) => option.answerOption.label);
      inputsFor(true, getTranslocoModuleWithTranslations());
      expect(labels()).toEqual(['Yes', 'No']);
      TestBed.inject(TranslocoService).setActiveLang('de');
      expect(labels()).toEqual(['Ja', 'Nein']);
    });
  });

  describe('rendered answer form', () => {
    function render(contentFormatData: ContentFormatData) {
      const formattingService = jasmine.createSpyObj('FormattingService', [
        'postString',
      ]);
      formattingService.postString.and.returnValue(of({ html: '' }));
      configureTestModule(
        [getTranslocoModule(), ContentPreviewComponent],
        [
          { provide: LikertScaleService, useValue: new LikertScaleService() },
          { provide: FormattingService, useValue: formattingService },
          { provide: BROWSER_LANG, useValue: 'en' },
        ]
      ).compileComponents();
      fixture = TestBed.createComponent(ContentPreviewComponent);
      fixture.componentRef.setInput('body', 'body');
      fixture.componentRef.setInput('language', 'de');
      fixture.componentRef.setInput('contentFormatData', contentFormatData);
      fixture.detectChanges();
    }

    function answerForm<T>(type: new (...args: never[]) => T): T {
      return fixture.debugElement.query(By.directive(type)).componentInstance;
    }

    it('offers the symbols of a static Likert scale untranslated', () => {
      render({
        __typename: 'ScaleContentFormatData',
        format: ContentType.Scale,
        template: ScaleContentTemplate.Emoji,
        neutralOption: false,
      });
      const form = answerForm(ContentChoiceAnswerComponent);
      expect(
        form.answerOptions().map((option) => option.answerOption.label)
      ).toEqual(['😀', '🙂', '🙁', '😟']);
      expect(form.answerOptions().some((option) => option.checked)).toBe(false);
      expect(form.translateOptions()).toBe(false);
    });

    it('offers the keys of a worded Likert scale for translation', () => {
      render({
        __typename: 'ScaleContentFormatData',
        format: ContentType.Scale,
        template: ScaleContentTemplate.Agreement,
        neutralOption: true,
      });
      const form = answerForm(ContentChoiceAnswerComponent);
      expect(
        form.answerOptions().map((option) => option.answerOption.label)
      ).toEqual([
        'option-template.agreement-positive-2',
        'option-template.agreement-positive-1',
        'option-template.agreement-neutral',
        'option-template.agreement-negative-1',
        'option-template.agreement-negative-2',
      ]);
      expect(form.translateOptions()).toBe(true);
      expect(form.language()).toBe('de');
    });

    it('shows the numeric answer field with its range, disabled', () => {
      render({
        __typename: 'NumericContentFormatData',
        format: ContentType.Numeric,
        minNumber: -5,
        maxNumber: 10,
        correctNumber: 3,
        tolerance: 1,
      });
      const form = answerForm(ContentNumericAnswerComponent);
      expect(form.minNumber()).toBe(-5);
      expect(form.maxNumber()).toBe(10);
      expect(form.disabled()).toBe(true);
    });
  });
});
