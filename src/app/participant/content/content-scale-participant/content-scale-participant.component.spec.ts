import { failedOperation } from '@testing/graphql-fixtures';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { BROWSER_LANG } from '@app/core/services/util/language.service';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { ContentChoiceAnswerComponent } from '@app/standalone/content-answers/content-choice-answer/content-choice-answer.component';
import {
  AnswerResultState,
  ContentType,
  CreateQuestionnaireScaleAnswerGql,
  ScaleContentFormatData,
  ScaleContentTemplate,
} from '@gql/generated/graphql';
import { ContentScaleParticipantComponent } from './content-scale-participant.component';

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

describe('ContentScaleParticipantComponent', () => {
  let fixture: ComponentFixture<ContentScaleParticipantComponent>;
  let component: ContentScaleParticipantComponent;
  let createAnswer: jasmine.SpyObj<CreateQuestionnaireScaleAnswerGql>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  function setUp(contentFormatData = formatData()) {
    createAnswer = jasmine.createSpyObj('CreateQuestionnaireScaleAnswerGql', [
      'mutate',
    ]);
    createAnswer.mutate.and.returnValue(
      of({
        data: {
          createQuestionnaireScaleAnswer: {
            __typename: 'Answer',
            id: 'answer-1',
            result: AnswerResultState.Neutral,
            hidden: false,
            createdAt: null,
            durationMs: null,
            formatData: null,
          },
        },
      })
    );
    notificationService = jasmine.createSpyObj('NotificationService', [
      'showAdvanced',
    ]);
    const formattingService = jasmine.createSpyObj('FormattingService', [
      'postString',
    ]);
    formattingService.postString.and.returnValue(of({ html: '' }));

    configureTestModule(
      [getTranslocoModule(), ContentScaleParticipantComponent],
      [
        { provide: CreateQuestionnaireScaleAnswerGql, useValue: createAnswer },
        { provide: NotificationService, useValue: notificationService },
        { provide: LikertScaleService, useValue: new LikertScaleService() },
        { provide: FormattingService, useValue: formattingService },
        { provide: BROWSER_LANG, useValue: 'en' },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(ContentScaleParticipantComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('contentId', 'content-1');
    fixture.componentRef.setInput('roundId', 'round-1');
    fixture.componentRef.setInput('contentFormatData', contentFormatData);
    fixture.detectChanges();
  }

  function labels(): string[] {
    return component.answerOptions().map((o) => o.answerOption.label);
  }

  function choiceAnswer(): ContentChoiceAnswerComponent {
    return fixture.debugElement.query(
      By.directive(ContentChoiceAnswerComponent)
    ).componentInstance;
  }

  it('offers five options with the neutral option', () => {
    setUp();
    expect(labels()).toEqual([
      'option-template.agreement-positive-2',
      'option-template.agreement-positive-1',
      'option-template.agreement-neutral',
      'option-template.agreement-negative-1',
      'option-template.agreement-negative-2',
    ]);
  });

  it('offers four options without the neutral option', () => {
    setUp(formatData({ neutralOption: false }));
    expect(labels()).toEqual([
      'option-template.agreement-positive-2',
      'option-template.agreement-positive-1',
      'option-template.agreement-negative-1',
      'option-template.agreement-negative-2',
    ]);
  });

  it('offers the literal labels of a symbol template untranslated', () => {
    setUp(formatData({ template: ScaleContentTemplate.Emoji }));
    expect(labels()).toEqual(['😀', '🙂', '😐', '🙁', '😟']);
  });

  it('has the answer component translate the labels into the room language', () => {
    setUp();
    fixture.componentRef.setInput('language', 'de');
    fixture.detectChanges();
    expect(choiceAnswer().translateOptions()).toBe(true);
    expect(choiceAnswer().language()).toBe('de');
  });

  it('keeps the answer component from translating a symbol template', () => {
    setUp(formatData({ template: ScaleContentTemplate.Emoji }));
    expect(choiceAnswer().translateOptions()).toBe(false);
  });

  it('does not submit without a picked option', () => {
    setUp();
    component.submitAnswer();
    expect(createAnswer.mutate).not.toHaveBeenCalled();
    expect(notificationService.showAdvanced).toHaveBeenCalledWith(
      jasmine.anything(),
      AdvancedSnackBarTypes.WARNING
    );
  });

  it('submits the index of the picked option as the rating', () => {
    setUp();
    choiceAnswer().updateSelection(3);
    fixture.detectChanges();
    component.submitAnswer();
    expect(createAnswer.mutate).toHaveBeenCalledWith({
      variables: { roundId: 'round-1', rating: 3 },
    });
  });

  it('submits the most positive option as rating zero', () => {
    setUp();
    choiceAnswer().updateSelection(0);
    fixture.detectChanges();
    component.submitAnswer();
    expect(createAnswer.mutate).toHaveBeenCalledWith({
      variables: { roundId: 'round-1', rating: 0 },
    });
  });

  it('replaces an earlier pick rather than adding to it', () => {
    setUp();
    choiceAnswer().updateSelection(1);
    fixture.detectChanges();
    choiceAnswer().updateSelection(4);
    fixture.detectChanges();
    component.submitAnswer();
    expect(createAnswer.mutate).toHaveBeenCalledWith({
      variables: { roundId: 'round-1', rating: 4 },
    });
  });

  it('emits the created answer', () => {
    setUp();
    const emitted: string[] = [];
    component.answerCreated.subscribe((answer) => emitted.push(answer.id));
    choiceAnswer().updateSelection(2);
    fixture.detectChanges();
    component.submitAnswer();
    expect(emitted).toEqual(['answer-1']);
  });

  it('reports a failed answer and emits nothing', () => {
    setUp();
    createAnswer.mutate.and.returnValue(failedOperation() as never);
    const emitted: string[] = [];
    component.answerCreated.subscribe((answer) => emitted.push(answer.id));
    choiceAnswer().updateSelection(2);
    fixture.detectChanges();
    component.submitAnswer();
    expect(emitted).toEqual([]);
    expect(notificationService.showAdvanced).toHaveBeenCalledOnceWith(
      jasmine.any(String),
      AdvancedSnackBarTypes.FAILED
    );
  });

  it('does nothing while there is no active round', () => {
    setUp();
    fixture.componentRef.setInput('roundId', undefined);
    fixture.detectChanges();
    choiceAnswer().updateSelection(0);
    component.submitAnswer();
    expect(createAnswer.mutate).not.toHaveBeenCalled();
    expect(notificationService.showAdvanced).not.toHaveBeenCalled();
  });

  it('seeds the pick from an already given answer and locks the options', () => {
    setUp();
    fixture.componentRef.setInput('answerFormatData', {
      __typename: 'ScaleAnswerFormatData',
      format: ContentType.Scale,
      rating: 3,
    });
    fixture.detectChanges();
    expect(component.answered()).toBe(true);
    expect(component.answerOptions().map((o) => o.checked)).toEqual([
      false,
      false,
      false,
      true,
      false,
    ]);
    expect(choiceAnswer().disabled()).toBe(true);
  });

  it('locks the options while answering is disabled', () => {
    setUp();
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(choiceAnswer().disabled()).toBe(true);
  });
});
