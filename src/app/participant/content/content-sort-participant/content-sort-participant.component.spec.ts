import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { ContentSortAnswerComponent } from '@app/standalone/content-answers/content-sort-answer/content-sort-answer.component';
import {
  AnswerResultState,
  ContentType,
  CreateQuestionnaireSortAnswerGql,
  SortContentFormatData,
} from '@gql/generated/graphql';
import { ContentSortParticipantComponent } from './content-sort-participant.component';

function contentFormatData(
  labels = ['A', 'B', 'C', 'D']
): SortContentFormatData {
  return {
    __typename: 'SortContentFormatData',
    format: ContentType.Sort,
    options: labels.map((label) => ({
      __typename: 'AnswerOption' as const,
      label,
      labelRendered: null,
    })),
  };
}

describe('ContentSortParticipantComponent', () => {
  let fixture: ComponentFixture<ContentSortParticipantComponent>;
  let component: ContentSortParticipantComponent;
  let createAnswer: jasmine.SpyObj<CreateQuestionnaireSortAnswerGql>;

  function setUp() {
    createAnswer = jasmine.createSpyObj('CreateQuestionnaireSortAnswerGql', [
      'mutate',
    ]);
    createAnswer.mutate.and.returnValue(
      of({
        data: {
          createQuestionnaireSortAnswer: {
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

    configureTestModule(
      [getTranslocoModule(), ContentSortParticipantComponent],
      [
        {
          provide: CreateQuestionnaireSortAnswerGql,
          useValue: createAnswer,
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', [
            'showAdvanced',
          ]),
        },
        {
          provide: FormattingService,
          useValue: { postString: () => of({ html: '' }) },
        },
        // Reversing stands in for the shuffle, which is otherwise random.
        {
          provide: ContentAnswerService,
          useValue: {
            shuffleAnswerOptions: <T>(items: T[]) => items.reverse(),
          },
        },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(ContentSortParticipantComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('contentId', 'content-1');
    fixture.componentRef.setInput('roundId', 'round-1');
    fixture.componentRef.setInput('contentFormatData', contentFormatData());
    fixture.detectChanges();
  }

  function list(): ContentSortAnswerComponent {
    return fixture.debugElement.query(By.directive(ContentSortAnswerComponent))
      .componentInstance;
  }

  function displayed(): string[] {
    return component.displayOptions().map((option) => option.label);
  }

  function answerGiven(
    selectedChoiceIndexes: number[],
    result: AnswerResultState
  ) {
    fixture.componentRef.setInput('answerFormatData', {
      __typename: 'SortAnswerFormatData',
      format: ContentType.Sort,
      selectedChoiceIndexes,
    });
    fixture.componentRef.setInput('result', result);
    fixture.detectChanges();
  }

  function submittedIndexes(): number[] {
    return (
      createAnswer.mutate.calls.mostRecent().args[0]?.variables as {
        selectedChoiceIndexes: number[];
      }
    ).selectedChoiceIndexes;
  }

  it('shuffles the items instead of showing their correct order', () => {
    setUp();
    expect(displayed()).toEqual(['D', 'C', 'B', 'A']);
    expect(
      list()
        .answerOptions()
        .map((option) => option.label)
    ).toEqual(['D', 'C', 'B', 'A']);
  });

  it('leaves the list answerable until an answer is given', () => {
    setUp();
    expect(list().disabled()).toBe(false);
    answerGiven([0, 1, 2, 3], AnswerResultState.Correct);
    expect(list().disabled()).toBe(true);
  });

  it('locks the list while answering is locked', () => {
    setUp();
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(list().disabled()).toBe(true);
  });

  it('submits the displayed order as positions in the stored order', () => {
    setUp();
    component.submitAnswer();
    expect(submittedIndexes()).toEqual([3, 2, 1, 0]);
  });

  it('submits the order after the participant has reordered it', () => {
    setUp();
    list().drop(3, 0);
    fixture.detectChanges();
    expect(displayed()).toEqual(['A', 'D', 'C', 'B']);

    component.submitAnswer();
    expect(submittedIndexes()).toEqual([0, 3, 2, 1]);
  });

  it('submits the correct order as the identity permutation', () => {
    setUp();
    component.displayOptions.set([...contentFormatData().options]);
    component.submitAnswer();
    expect(submittedIndexes()).toEqual([0, 1, 2, 3]);
  });

  it('does not submit without an active round', () => {
    setUp();
    fixture.componentRef.setInput('roundId', undefined);
    fixture.detectChanges();
    component.submitAnswer();
    expect(createAnswer.mutate).not.toHaveBeenCalled();
  });

  it('emits the created answer', () => {
    setUp();
    const emitted: string[] = [];
    component.answerCreated.subscribe((answer) => emitted.push(answer.id));
    component.submitAnswer();
    expect(emitted).toEqual(['answer-1']);
  });

  it('restores a given answer in the order it was given', () => {
    setUp();
    answerGiven([2, 0, 3, 1], AnswerResultState.Wrong);
    expect(displayed()).toEqual(['C', 'A', 'D', 'B']);
  });

  it('round-trips the displayed order through the stored indexes', () => {
    setUp();
    list().drop(3, 1);
    fixture.detectChanges();
    const before = displayed();
    component.submitAnswer();

    answerGiven(submittedIndexes(), AnswerResultState.Wrong);
    expect(displayed()).toEqual(before);
  });

  it('keeps the arrangement when the content re-emits unchanged', () => {
    setUp();
    list().drop(3, 0);
    fixture.detectChanges();
    const arranged = displayed();

    // Apollo hands out a fresh object on every cache update, e.g. when an
    // answer count arrives, so the items are compared by value.
    fixture.componentRef.setInput('contentFormatData', contentFormatData());
    fixture.detectChanges();

    expect(displayed()).toEqual(arranged);
  });

  it('reseeds the list when the items themselves change', () => {
    setUp();
    list().drop(3, 0);
    fixture.detectChanges();

    fixture.componentRef.setInput(
      'contentFormatData',
      contentFormatData(['A', 'B'])
    );
    fixture.detectChanges();

    expect(displayed()).toEqual(['B', 'A']);
  });

  it('leaves the list neutral while nothing has been answered', () => {
    setUp();
    fixture.componentRef.setInput('correctOptionsPublished', true);
    fixture.detectChanges();
    expect(component.correct()).toBeUndefined();
  });

  it('leaves the list neutral while the correct order is unpublished', () => {
    setUp();
    answerGiven([0, 1, 2, 3], AnswerResultState.Correct);
    expect(component.correct()).toBeUndefined();
  });

  it('marks a correct answer once published', () => {
    setUp();
    answerGiven([0, 1, 2, 3], AnswerResultState.Correct);
    fixture.componentRef.setInput('correctOptionsPublished', true);
    fixture.detectChanges();
    expect(component.correct()).toBe(true);
    expect(
      fixture.debugElement.query(By.css('[data-testid="sort-answer-correct"]'))
    ).not.toBeNull();
  });

  it('marks a wrong answer once published', () => {
    setUp();
    answerGiven([1, 0, 2, 3], AnswerResultState.Wrong);
    fixture.componentRef.setInput('correctOptionsPublished', true);
    fixture.detectChanges();
    expect(component.correct()).toBe(false);
    expect(
      fixture.debugElement.query(By.css('[data-testid="sort-answer-wrong"]'))
    ).not.toBeNull();
  });
});
