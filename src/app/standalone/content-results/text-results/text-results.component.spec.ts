import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import { DialogService } from '@app/core/services/util/dialog.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import {
  ContentType,
  QuestionnaireAnswerByRoundIdGql,
  QuestionnaireTextAnswersByRoundIdGql,
  QuestionnaireTextAnswersUpdatedGql,
  TextContentFormatData,
  ToggleQuestionnaireTextAnswerHiddenGql,
} from '@gql/generated/graphql';
import { TextAnswerListComponent } from './text-answer-list/text-answer-list.component';
import { TextResultsComponent } from './text-results.component';

function answer(id: string, body: string, hidden = false) {
  return {
    id,
    result: null,
    hidden,
    formatData: {
      __typename: 'TextAnswerFormatData',
      format: ContentType.Text,
      body,
    },
  };
}

function formatData(answersPublished: boolean): TextContentFormatData {
  return {
    __typename: 'TextContentFormatData',
    format: ContentType.Text,
    answersPublished,
  };
}

function result(data: unknown) {
  return { dataState: 'complete' as const, data };
}

function complete(data: unknown) {
  return of(result(data));
}

describe('TextResultsComponent', () => {
  let fixture: ComponentFixture<TextResultsComponent>;
  let answersByRoundId: jasmine.SpyObj<QuestionnaireTextAnswersByRoundIdGql>;
  let answerByRoundId: jasmine.SpyObj<QuestionnaireAnswerByRoundIdGql>;
  let answers$: BehaviorSubject<unknown>;
  // Never emits unless a spec pushes into it, so the initial query result
  // stands for every spec that is not about live updates.
  let answersUpdated: Subject<unknown>;

  interface SetUpOptions {
    answersPublished?: boolean;
    viewAsParticipant?: boolean;
    ownAnswer?: ReturnType<typeof answer> | null;
    roundIds?: string[];
  }

  function setUp(options: SetUpOptions = {}) {
    answersByRoundId = jasmine.createSpyObj(
      'QuestionnaireTextAnswersByRoundIdGql',
      ['watch']
    );
    answers$ = new BehaviorSubject<unknown>(
      result({
        questionnaireTextAnswersByRoundId: [
          answer('a-1', 'First'),
          answer('a-2', 'Second'),
        ],
      })
    );
    // Writes land in the query like in Apollo's cache: as a new result.
    answersByRoundId.watch.and.returnValue({
      valueChanges: answers$,
      updateQuery: (mapFn: () => unknown) => answers$.next(result(mapFn())),
    } as never);

    answerByRoundId = jasmine.createSpyObj('QuestionnaireAnswerByRoundIdGql', [
      'watch',
    ]);
    answerByRoundId.watch.and.returnValue({
      valueChanges: complete({
        questionnaireAnswerByRoundId:
          options.ownAnswer === undefined
            ? answer('own-1', 'My own answer')
            : options.ownAnswer,
      }),
    } as never);

    answersUpdated = new Subject<unknown>();

    configureTestModule(
      [getTranslocoModule(), TextResultsComponent],
      [
        {
          provide: QuestionnaireTextAnswersByRoundIdGql,
          useValue: answersByRoundId,
        },
        {
          provide: QuestionnaireTextAnswersUpdatedGql,
          useValue: { subscribe: () => answersUpdated.asObservable() },
        },
        {
          provide: QuestionnaireAnswerByRoundIdGql,
          useValue: answerByRoundId,
        },
        {
          provide: ToggleQuestionnaireTextAnswerHiddenGql,
          useValue: jasmine.createSpyObj(
            'ToggleQuestionnaireTextAnswerHiddenGql',
            ['mutate']
          ),
        },
        {
          provide: DialogService,
          useValue: jasmine.createSpyObj('DialogService', ['openDeleteDialog']),
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', [
            'showAdvanced',
          ]),
        },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(TextResultsComponent);
    fixture.componentRef.setInput(
      'formatData',
      formatData(options.answersPublished ?? true)
    );
    fixture.componentRef.setInput(
      'roundIds',
      options.roundIds ?? ['round-1', 'round-2']
    );
    if (options.viewAsParticipant) {
      fixture.componentRef.setInput('viewAsParticipant', true);
    }
    fixture.detectChanges();
  }

  function list(): TextAnswerListComponent | undefined {
    return fixture.debugElement.query(By.directive(TextAnswerListComponent))
      ?.componentInstance;
  }

  function bodies(): string[] {
    return (list()?.answers() ?? []).map((a) => a.body);
  }

  it('lists the answers of the round', () => {
    setUp();
    expect(bodies()).toEqual(['First', 'Second']);
  });

  it('accepts the roundIds and resultsVisible inputs sent by the results component outlet', () => {
    setUp();
    expect(() => {
      fixture.componentRef.setInput('roundIds', ['round-1']);
      fixture.componentRef.setInput('resultsVisible', true);
    }).not.toThrow();
    fixture.detectChanges();
    expect(bodies()).toEqual(['First', 'Second']);
  });

  it('allows hiding an answer when answer moderation is allowed', () => {
    setUp();
    expect(list()?.hidingAllowed()).toBe(false);
    fixture.componentRef.setInput('allowAnswerModeration', true);
    fixture.detectChanges();
    expect(list()?.hidingAllowed()).toBe(true);
  });

  it('queries the whole list when the answers are published', () => {
    setUp({ answersPublished: true, viewAsParticipant: true });
    expect(fixture.componentInstance.restricted()).toBe(false);
    expect(answersByRoundId.watch).toHaveBeenCalled();
    expect(answerByRoundId.watch).not.toHaveBeenCalled();
    expect(bodies()).toEqual(['First', 'Second']);
  });

  it('shows a participant only their own answer while the set is unpublished', () => {
    setUp({ answersPublished: false, viewAsParticipant: true });
    expect(fixture.componentInstance.restricted()).toBe(true);
    expect(answersByRoundId.watch).not.toHaveBeenCalled();
    expect(answerByRoundId.watch).toHaveBeenCalledWith({
      variables: { roundId: 'round-1' },
    });
    expect(bodies()).toEqual(['My own answer']);
  });

  it('drops the own answer from the restricted view when it is hidden', () => {
    setUp({
      answersPublished: false,
      viewAsParticipant: true,
      ownAnswer: answer('own-1', 'My own answer', true),
    });
    expect(bodies()).toEqual([]);
  });

  it('shows nothing restricted when there is no round yet', () => {
    setUp({
      answersPublished: false,
      viewAsParticipant: true,
      roundIds: [],
    });
    expect(answerByRoundId.watch).not.toHaveBeenCalled();
    expect(answersByRoundId.watch).not.toHaveBeenCalled();
    expect(bodies()).toEqual([]);
  });

  it('keeps the full list for an editor even while the set is unpublished', () => {
    setUp({ answersPublished: false });
    expect(fixture.componentInstance.restricted()).toBe(false);
    expect(answersByRoundId.watch).toHaveBeenCalled();
    expect(bodies()).toEqual(['First', 'Second']);
  });

  it('shows nothing unrestricted when there is no round yet', () => {
    setUp({ roundIds: [] });
    expect(answersByRoundId.watch).not.toHaveBeenCalled();
    expect(bodies()).toEqual([]);
  });

  function emitUpdate(answers: ReturnType<typeof answer>[]) {
    answersUpdated.next({ data: { questionnaireTextAnswersUpdated: answers } });
    fixture.detectChanges();
  }

  it('shows the pushed answers in the unrestricted list', () => {
    setUp();
    expect(bodies()).toEqual(['First', 'Second']);

    emitUpdate([
      answer('a-1', 'First'),
      answer('a-2', 'Second'),
      answer('a-3', 'Third'),
    ]);

    expect(bodies()).toEqual(['First', 'Second', 'Third']);
  });

  it('leaves out hidden answers that moderating readers receive', () => {
    setUp();

    answers$.next(
      result({
        questionnaireTextAnswersByRoundId: [
          answer('a-1', 'First'),
          answer('a-2', 'Second', true),
        ],
      })
    );
    fixture.detectChanges();
    expect(bodies()).toEqual(['First']);

    emitUpdate([answer('a-1', 'First', true), answer('a-3', 'Third')]);
    expect(bodies()).toEqual(['Third']);
  });

  it('still reflects a refetch of the query after a push', () => {
    setUp();
    emitUpdate([answer('a-3', 'Third')]);

    answers$.next(result({ questionnaireTextAnswersByRoundId: [] }));
    fixture.detectChanges();

    expect(bodies()).toEqual([]);
  });

  it('keeps the last answers when the updates fail', () => {
    spyOn(console, 'error');
    setUp();

    answersUpdated.error(new Error('Subscription lost'));
    fixture.detectChanges();

    expect(bodies()).toEqual(['First', 'Second']);
    expect(console.error).toHaveBeenCalled();
  });
});
