import { failedOperation } from '@testing/graphql-fixtures';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatSelect } from '@angular/material/select';
import { of } from 'rxjs';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { BROWSER_LANG } from '@app/core/services/util/language.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { QuestionnairePageService } from '@app/creator/questionnaire/questionnaire-page.service';
import { ContentChoiceAnswerComponent } from '@app/standalone/content-answers/content-choice-answer/content-choice-answer.component';
import {
  ContentType,
  CreateQuestionnaireScaleContentGql,
  ScaleContentFormatData,
  ScaleContentTemplate,
  UpdateQuestionnaireScaleContentGql,
} from '@gql/generated/graphql';
import { ScaleContentFormComponent } from './scale-content-form.component';

function formatData(
  overrides: Partial<ScaleContentFormatData> = {}
): ScaleContentFormatData {
  return {
    __typename: 'ScaleContentFormatData',
    format: ContentType.Scale,
    template: ScaleContentTemplate.Agreement,
    neutralOption: true,
    ...overrides,
  };
}

describe('ScaleContentFormComponent', () => {
  let fixture: ComponentFixture<ScaleContentFormComponent>;
  let component: ScaleContentFormComponent;
  let createContent: jasmine.SpyObj<CreateQuestionnaireScaleContentGql>;
  let updateContent: jasmine.SpyObj<UpdateQuestionnaireScaleContentGql>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  function setUp(initialFormatData: ScaleContentFormatData | null) {
    createContent = jasmine.createSpyObj('CreateQuestionnaireScaleContentGql', [
      'mutate',
    ]);
    createContent.mutate.and.returnValue(of({ data: undefined }));
    updateContent = jasmine.createSpyObj('UpdateQuestionnaireScaleContentGql', [
      'mutate',
    ]);
    updateContent.mutate.and.returnValue(of({ data: undefined }));
    notificationService = jasmine.createSpyObj('NotificationService', [
      'showAdvanced',
    ]);
    const formattingService = jasmine.createSpyObj('FormattingService', [
      'postString',
    ]);
    formattingService.postString.and.returnValue(of({ html: '' }));

    configureTestModule(
      [getTranslocoModule(), ScaleContentFormComponent],
      [
        { provide: BROWSER_LANG, useValue: 'en' },
        { provide: FormattingService, useValue: formattingService },
        { provide: NotificationService, useValue: notificationService },
        { provide: LikertScaleService, useValue: new LikertScaleService() },
        {
          provide: QuestionnairePageService,
          useValue: new QuestionnairePageService(),
        },
        {
          provide: CreateQuestionnaireScaleContentGql,
          useValue: createContent,
        },
        {
          provide: UpdateQuestionnaireScaleContentGql,
          useValue: updateContent,
        },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(ScaleContentFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('formatData', initialFormatData);
    fixture.detectChanges();
  }

  function createInput(): Record<string, unknown> {
    return (
      createContent.mutate.calls.mostRecent().args[0]?.variables as {
        input: Record<string, unknown>;
      }
    ).input;
  }

  function templateSelect(): MatSelect {
    return fixture.debugElement.query(By.directive(MatSelect))
      .componentInstance;
  }

  /** The select defers its first selection to a microtask. */
  async function settledTriggerText(): Promise<string> {
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.debugElement
      .query(By.css('mat-select-trigger'))
      .nativeElement.textContent.trim();
  }

  it('offers the twelve templates in the picker order', () => {
    setUp(null);
    expect(component.templates.length).toBe(12);
    expect(component.templates[0]).toBe(ScaleContentTemplate.Agreement);
    expect(component.templates[11]).toBe(ScaleContentTemplate.Points);
  });

  it('labels a template from the creator scope', () => {
    setUp(null);
    expect(component.templateLabel(ScaleContentTemplate.PlusMinus)).toBe(
      'creator.option-template.plus-minus'
    );
  });

  it('defaults to the agreement template', () => {
    setUp(null);
    expect(component.template()).toBe(ScaleContentTemplate.Agreement);
  });

  it('seeds the template from an existing content', () => {
    setUp(formatData({ template: ScaleContentTemplate.Frequency }));
    expect(component.template()).toBe(ScaleContentTemplate.Frequency);
  });

  it('previews five translatable options with the neutral option', () => {
    setUp(null);
    expect(component.optionLabels()).toEqual([
      'option-template.agreement-positive-2',
      'option-template.agreement-positive-1',
      'option-template.agreement-neutral',
      'option-template.agreement-negative-1',
      'option-template.agreement-negative-2',
    ]);
    expect(component.translateLabels()).toBe(true);
  });

  it('previews four options without the neutral option', () => {
    setUp(null);
    fixture.componentRef.setInput('neutralOption', false);
    fixture.detectChanges();
    expect(component.optionLabels()).toEqual([
      'option-template.agreement-positive-2',
      'option-template.agreement-positive-1',
      'option-template.agreement-negative-1',
      'option-template.agreement-negative-2',
    ]);
  });

  it('previews the literal labels of a symbol template', () => {
    setUp(formatData({ template: ScaleContentTemplate.Emoji }));
    expect(component.optionLabels()).toEqual(['😀', '🙂', '😐', '🙁', '😟']);
    expect(component.translateLabels()).toBe(false);
  });

  it('hands the preview the untranslated labels to render in the room language', () => {
    setUp(null);
    fixture.componentRef.setInput('preview', true);
    fixture.componentRef.setInput('language', 'de');
    fixture.detectChanges();
    const preview: ContentChoiceAnswerComponent = fixture.debugElement.query(
      By.directive(ContentChoiceAnswerComponent)
    ).componentInstance;
    expect(preview.answerOptions().map((o) => o.answerOption.label)).toEqual(
      component.optionLabels()
    );
    expect(preview.translateOptions()).toBe(true);
    expect(preview.language()).toBe('de');
  });

  it('hands the preview the literal labels of a symbol template untranslated', () => {
    setUp(formatData({ template: ScaleContentTemplate.Emoji }));
    fixture.componentRef.setInput('preview', true);
    fixture.detectChanges();
    const preview: ContentChoiceAnswerComponent = fixture.debugElement.query(
      By.directive(ContentChoiceAnswerComponent)
    ).componentInstance;
    expect(preview.translateOptions()).toBe(false);
  });

  it('keeps the template picker enabled on a new content even once answered', () => {
    setUp(null);
    fixture.componentRef.setInput('answered', true);
    fixture.detectChanges();
    expect(component.locked()).toBe(false);
    expect(templateSelect().disabled).toBe(false);
  });

  it('keeps the template picker enabled on an unanswered content', () => {
    setUp(formatData());
    fixture.componentRef.setInput('contentId', 'content-1');
    fixture.detectChanges();
    expect(component.locked()).toBe(false);
    expect(templateSelect().disabled).toBe(false);
  });

  it('locks the template picker once the content has answers', () => {
    setUp(formatData());
    fixture.componentRef.setInput('contentId', 'content-1');
    fixture.componentRef.setInput('answered', true);
    fixture.detectChanges();
    expect(component.locked()).toBe(true);
    expect(templateSelect().disabled).toBe(true);
  });

  it('creates a content with the template and the shared inputs', () => {
    setUp(null);
    fixture.componentRef.setInput('duration', 30);
    fixture.componentRef.setInput('abstentionsAllowed', false);
    fixture.detectChanges();
    component.template.set(ScaleContentTemplate.Quality);

    component.submit('questionnaire-1', 'How good was it?');

    expect(updateContent.mutate).not.toHaveBeenCalled();
    expect(createInput()).toEqual({
      questionnaireId: 'questionnaire-1',
      body: 'How good was it?',
      template: ScaleContentTemplate.Quality,
      neutralOption: true,
      duration: 30,
      abstentionsAllowed: false,
    });
  });

  it('reports a failed creation and reports nothing as submitted', () => {
    setUp(null);
    fixture.detectChanges();
    createContent.mutate.and.returnValue(failedOperation() as never);
    const submitted = jasmine.createSpy('submitted');
    component.submitted.subscribe(submitted);

    component.submit('questionnaire-1', 'The question');

    expect(submitted).not.toHaveBeenCalled();
    expect(notificationService.showAdvanced).toHaveBeenCalledOnceWith(
      jasmine.any(String),
      AdvancedSnackBarTypes.FAILED
    );
  });

  it('creates a content without the neutral option', () => {
    setUp(null);
    fixture.componentRef.setInput('neutralOption', false);
    fixture.detectChanges();

    component.submit('questionnaire-1', 'How good was it?');

    expect(createInput().neutralOption).toBe(false);
  });

  it('updates the content when a content id is set', () => {
    setUp(formatData({ template: ScaleContentTemplate.Pace }));
    fixture.componentRef.setInput('contentId', 'content-1');
    fixture.componentRef.setInput('duration', null);
    fixture.detectChanges();

    component.submit('questionnaire-1', 'How was the pace?');

    expect(createContent.mutate).not.toHaveBeenCalled();
    const input = (
      updateContent.mutate.calls.mostRecent().args[0]?.variables as {
        input: Record<string, unknown>;
      }
    ).input;
    expect(input).toEqual({
      id: 'content-1',
      body: 'How was the pace?',
      template: ScaleContentTemplate.Pace,
      neutralOption: true,
      duration: null,
      abstentionsAllowed: true,
    });
  });

  it('reports a failed update', () => {
    setUp(formatData({ template: ScaleContentTemplate.Pace }));
    fixture.componentRef.setInput('contentId', 'content-1');
    fixture.componentRef.setInput('duration', null);
    fixture.detectChanges();
    updateContent.mutate.and.returnValue(failedOperation() as never);

    component.submit('questionnaire-1', 'How was the pace?');

    expect(
      TestBed.inject(NotificationService).showAdvanced
    ).toHaveBeenCalledOnceWith(
      jasmine.any(String),
      AdvancedSnackBarTypes.FAILED
    );
  });

  it('shows the picked template through a trigger of its own', async () => {
    setUp(formatData({ template: ScaleContentTemplate.Probability }));
    expect(await settledTriggerText()).toBe(
      'creator.option-template.probability'
    );
  });

  it('populates the picker when the content arrives after creation', async () => {
    setUp(null);
    fixture.componentRef.setInput(
      'formatData',
      formatData({ template: ScaleContentTemplate.Probability })
    );
    fixture.detectChanges();
    expect(component.template()).toBe(ScaleContentTemplate.Probability);
    expect(templateSelect().value).toBe(ScaleContentTemplate.Probability);
    expect(await settledTriggerText()).toBe(
      'creator.option-template.probability'
    );
  });

  it('keeps a just-picked template when the content re-emits unchanged', async () => {
    setUp(formatData({ template: ScaleContentTemplate.Agreement }));
    component.template.set(ScaleContentTemplate.Quality);
    fixture.detectChanges();

    fixture.componentRef.setInput(
      'formatData',
      formatData({ template: ScaleContentTemplate.Agreement })
    );
    fixture.detectChanges();

    expect(component.template()).toBe(ScaleContentTemplate.Quality);
    expect(await settledTriggerText()).toBe('creator.option-template.quality');
  });

  it('re-seeds the picker when another content is loaded into the form', () => {
    setUp(formatData({ template: ScaleContentTemplate.Agreement }));
    fixture.componentRef.setInput(
      'formatData',
      formatData({ template: ScaleContentTemplate.Pace })
    );
    fixture.detectChanges();
    expect(component.template()).toBe(ScaleContentTemplate.Pace);
  });

  it('keeps a picked template on a new content, which persists none', () => {
    setUp(null);
    component.template.set(ScaleContentTemplate.Level);
    fixture.detectChanges();
    fixture.componentRef.setInput('duration', 30);
    fixture.detectChanges();
    expect(component.template()).toBe(ScaleContentTemplate.Level);
  });

  it('has nothing to validate', () => {
    setUp(null);
    expect(component.formatDataValid()).toBe(true);
    expect(notificationService.showAdvanced).not.toHaveBeenCalled();
  });
});
