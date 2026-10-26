import { failedOperation } from '@testing/graphql-fixtures';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';
import {
  getTranslocoModule,
  getTranslocoModuleWithTranslations,
} from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { BROWSER_LANG } from '@app/core/services/util/language.service';
import { SelectableAnswer } from '@app/core/models/selectable-answer';
import { ContentChoiceAnswerComponent } from '@app/standalone/content-answers/content-choice-answer/content-choice-answer.component';
import {
  AnswerResultState,
  BinaryContentFormatData,
  ContentType,
  CreateQuestionnaireBinaryAnswerGql,
} from '@gql/generated/graphql';
import { ContentBinaryParticipantComponent } from './content-binary-participant.component';

function formatData(
  correctAnswer: boolean | null = null
): BinaryContentFormatData {
  return {
    __typename: 'BinaryContentFormatData',
    format: ContentType.Binary,
    correctAnswer: correctAnswer,
  };
}

describe('ContentBinaryParticipantComponent', () => {
  let fixture: ComponentFixture<ContentBinaryParticipantComponent>;
  let component: ContentBinaryParticipantComponent;
  let createAnswer: jasmine.SpyObj<CreateQuestionnaireBinaryAnswerGql>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  function setUp(
    contentFormatData = formatData(),
    translocoModule = getTranslocoModule()
  ) {
    createAnswer = jasmine.createSpyObj('CreateQuestionnaireBinaryAnswerGql', [
      'mutate',
    ]);
    createAnswer.mutate.and.returnValue(
      of({
        data: {
          createQuestionnaireBinaryAnswer: {
            __typename: 'Answer',
            id: 'answer-1',
            result: AnswerResultState.Correct,
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
      [translocoModule, ContentBinaryParticipantComponent],
      [
        { provide: CreateQuestionnaireBinaryAnswerGql, useValue: createAnswer },
        { provide: NotificationService, useValue: notificationService },
        { provide: FormattingService, useValue: formattingService },
        { provide: BROWSER_LANG, useValue: 'en' },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(ContentBinaryParticipantComponent);
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

  function answerGiven(answer: boolean) {
    fixture.componentRef.setInput('answerFormatData', {
      __typename: 'BinaryAnswerFormatData',
      format: ContentType.Binary,
      answer: answer,
    });
    fixture.detectChanges();
  }

  it('offers a yes and a no option in that order', () => {
    setUp();
    expect(labels()).toEqual(['answer.yes', 'answer.no']);
  });

  it('does not submit without a picked option', () => {
    setUp();
    component.submitAnswer();
    expect(createAnswer.mutate).not.toHaveBeenCalled();
    expect(notificationService.showAdvanced).toHaveBeenCalledWith(
      'participant.answer.please-one',
      AdvancedSnackBarTypes.WARNING
    );
  });

  it('submits true for the yes option', () => {
    setUp();
    choiceAnswer().updateSelection(0);
    fixture.detectChanges();
    component.submitAnswer();
    expect(createAnswer.mutate).toHaveBeenCalledWith({
      variables: { roundId: 'round-1', answer: true },
    });
  });

  it('submits false for the no option', () => {
    setUp();
    choiceAnswer().updateSelection(1);
    fixture.detectChanges();
    component.submitAnswer();
    expect(createAnswer.mutate).toHaveBeenCalledWith({
      variables: { roundId: 'round-1', answer: false },
    });
  });

  it('replaces an earlier pick rather than adding to it', () => {
    setUp();
    choiceAnswer().updateSelection(0);
    fixture.detectChanges();
    choiceAnswer().updateSelection(1);
    fixture.detectChanges();
    component.submitAnswer();
    expect(createAnswer.mutate).toHaveBeenCalledWith({
      variables: { roundId: 'round-1', answer: false },
    });
  });

  it('emits the created answer', () => {
    setUp();
    const emitted: string[] = [];
    component.answerCreated.subscribe((answer) => emitted.push(answer.id));
    choiceAnswer().updateSelection(0);
    fixture.detectChanges();
    component.submitAnswer();
    expect(emitted).toEqual(['answer-1']);
  });

  it('reports a failed answer and emits nothing', () => {
    setUp();
    createAnswer.mutate.and.returnValue(failedOperation() as never);
    const emitted: string[] = [];
    component.answerCreated.subscribe((answer) => emitted.push(answer.id));
    choiceAnswer().updateSelection(0);
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

  it('restores a given yes answer and locks the options', () => {
    setUp();
    answerGiven(true);
    expect(component.answered()).toBe(true);
    expect(component.answerOptions().map((o) => o.checked)).toEqual([
      true,
      false,
    ]);
    expect(choiceAnswer().disabled()).toBe(true);
  });

  it('restores a given no answer', () => {
    setUp();
    answerGiven(false);
    expect(component.answerOptions().map((o) => o.checked)).toEqual([
      false,
      true,
    ]);
  });

  it('locks the options while answering is disabled', () => {
    setUp();
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(choiceAnswer().disabled()).toBe(true);
  });

  it('marks the yes option correct when the content stores yes', () => {
    setUp(formatData(true));
    expect(component.correctOptionIndexes()).toEqual([0]);
  });

  it('marks the no option correct when the content stores no', () => {
    setUp(formatData(false));
    expect(component.correctOptionIndexes()).toEqual([1]);
  });

  it('marks no option correct for a survey content', () => {
    setUp();
    expect(component.correctOptionIndexes()).toBeUndefined();
  });

  it('does not mark a given answer wrong for a survey content', () => {
    setUp();
    fixture.componentRef.setInput('correctOptionsPublished', true);
    answerGiven(true);
    expect(choiceAnswer().checkedOptions()[0]).toEqual({
      correct: false,
      incorrect: false,
    });
  });

  it('marks a wrong answer wrong for a scored content', () => {
    setUp(formatData(false));
    fixture.componentRef.setInput('correctOptionsPublished', true);
    answerGiven(true);
    expect(choiceAnswer().checkedOptions()[0]).toEqual({
      correct: false,
      incorrect: true,
    });
  });

  it('marks a right answer right for a scored content', () => {
    setUp(formatData(true));
    fixture.componentRef.setInput('correctOptionsPublished', true);
    answerGiven(true);
    expect(choiceAnswer().checkedOptions()[0]).toEqual({
      correct: true,
      incorrect: false,
    });
  });

  describe('labels', () => {
    function switchTo(lang: string) {
      TestBed.inject(TranslocoService).setActiveLang(lang);
      fixture.detectChanges();
    }

    beforeEach(() => {
      setUp(formatData(), getTranslocoModuleWithTranslations());
    });

    it('shows the translated options', () => {
      expect(labels()).toEqual(['Yes', 'No']);
    });

    it('follows a language switch', () => {
      switchTo('de');
      expect(labels()).toEqual(['Ja', 'Nein']);
    });

    it('keeps a choice not yet sent across a language switch', () => {
      component.answerOptions.update((options) =>
        options.map(
          (option, index) =>
            new SelectableAnswer(option.answerOption, index === 1)
        )
      );
      switchTo('de');
      expect(component.answerOptions().map((o) => o.checked)).toEqual([
        false,
        true,
      ]);
    });

    it('keeps the given answer checked across a language switch', () => {
      answerGiven(false);
      switchTo('de');
      expect(component.answerOptions().map((o) => o.checked)).toEqual([
        false,
        true,
      ]);
    });
  });
});
