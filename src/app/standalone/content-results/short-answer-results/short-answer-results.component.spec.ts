import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import { DialogService } from '@app/core/services/util/dialog.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { AnswerGridListComponent } from '@app/standalone/answer-grid-list/answer-grid-list.component';
import { AnswerListComponent } from '@app/standalone/answer-list/answer-list.component';
import { CorrectAnswerResultsComponent } from '@app/standalone/correct-answer-results/correct-answer-results.component';
import {
  BanQuestionnaireShortAnswerContentKeywordGql,
  ContentType,
  QuestionnaireShortAnswerRoundStatsByRoundIdGql,
  QuestionnaireShortAnswerRoundStatsUpdatedGql,
  ShortAnswerContentFormatData,
  ShortAnswerContentRoundStats,
} from '@gql/generated/graphql';
import { ShortAnswerResultsComponent } from './short-answer-results.component';

function formatData(
  correctTerms: string[] = ['Kotlin', 'Java']
): ShortAnswerContentFormatData {
  return {
    __typename: 'ShortAnswerContentFormatData',
    format: ContentType.ShortAnswer,
    correctTerms,
  };
}

function roundStats(
  overrides: Partial<ShortAnswerContentRoundStats> = {}
): ShortAnswerContentRoundStats {
  return {
    __typename: 'ShortAnswerContentRoundStats',
    texts: ['Kotlin', 'Scala', 'Java'],
    counts: [4, 2, 1],
    ...overrides,
  };
}

function result(data: unknown) {
  return { dataState: 'complete' as const, data };
}

describe('ShortAnswerResultsComponent', () => {
  let fixture: ComponentFixture<ShortAnswerResultsComponent>;
  let component: ShortAnswerResultsComponent;
  let statsByRoundId: jasmine.SpyObj<QuestionnaireShortAnswerRoundStatsByRoundIdGql>;
  let stats$: BehaviorSubject<unknown>;
  // Inert unless a spec pushes into it, so the query result stands.
  let statsUpdated: Subject<unknown>;
  let banKeyword: jasmine.SpyObj<BanQuestionnaireShortAnswerContentKeywordGql>;
  let dialogService: jasmine.SpyObj<DialogService>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  interface SetUpOptions {
    stats?: ShortAnswerContentRoundStats | null;
    contentFormatData?: ShortAnswerContentFormatData;
    dialogResult?: unknown;
  }

  function setUp(options: SetUpOptions = {}) {
    statsByRoundId = jasmine.createSpyObj(
      'QuestionnaireShortAnswerRoundStatsByRoundIdGql',
      ['watch']
    );
    stats$ = new BehaviorSubject<unknown>(
      result({
        questionnaireShortAnswerRoundStatsByRoundId:
          options.stats === undefined ? roundStats() : options.stats,
      })
    );
    // Writes land in the query like in Apollo's cache: as a new result.
    statsByRoundId.watch.and.returnValue({
      valueChanges: stats$,
      updateQuery: (mapFn: () => unknown) => stats$.next(result(mapFn())),
    } as never);

    statsUpdated = new Subject<unknown>();
    banKeyword = jasmine.createSpyObj(
      'BanQuestionnaireShortAnswerContentKeywordGql',
      ['mutate']
    );
    banKeyword.mutate.and.returnValue(of({}) as never);
    dialogService = jasmine.createSpyObj('DialogService', ['openDeleteDialog']);
    dialogService.openDeleteDialog.and.returnValue({
      afterClosed: () => of(options.dialogResult ?? true),
    } as never);
    notificationService = jasmine.createSpyObj('NotificationService', [
      'showAdvanced',
    ]);

    configureTestModule(
      [getTranslocoModule(), ShortAnswerResultsComponent],
      [
        {
          provide: QuestionnaireShortAnswerRoundStatsByRoundIdGql,
          useValue: statsByRoundId,
        },
        {
          provide: QuestionnaireShortAnswerRoundStatsUpdatedGql,
          useValue: { subscribe: () => statsUpdated.asObservable() },
        },
        {
          provide: BanQuestionnaireShortAnswerContentKeywordGql,
          useValue: banKeyword,
        },
        { provide: DialogService, useValue: dialogService },
        { provide: NotificationService, useValue: notificationService },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(ShortAnswerResultsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput(
      'formatData',
      options.contentFormatData ?? formatData()
    );
    fixture.componentRef.setInput('contentId', 'content-1');
    fixture.componentRef.setInput('roundIds', ['round-1']);
    fixture.detectChanges();
  }

  function answerList(): AnswerListComponent | undefined {
    return fixture.debugElement.query(By.directive(AnswerListComponent))
      ?.componentInstance;
  }

  function banButtons(): HTMLElement[] {
    return fixture.debugElement
      .queryAll(By.css('.delete-button'))
      .map((element) => element.nativeElement);
  }

  function grid(): AnswerGridListComponent | undefined {
    return fixture.debugElement.query(By.directive(AnswerGridListComponent))
      ?.componentInstance;
  }

  function correctIndicators(): HTMLElement[] {
    return fixture.debugElement
      .queryAll(By.css('[data-testid="short-answer-correct-indicator"]'))
      .map((element) => element.nativeElement)
      .filter((element: HTMLElement) =>
        element.classList.contains('show-correct-icon')
      );
  }

  function gridEntries(): [string, number][] {
    return (grid()?.answers ?? []).map((a) => [a.answer, a.count]);
  }

  function summary(): CorrectAnswerResultsComponent | undefined {
    return fixture.debugElement.query(
      By.directive(CorrectAnswerResultsComponent)
    )?.componentInstance;
  }

  it('puts the texts and their counts into the grid', () => {
    setUp();
    expect(gridEntries()).toEqual([
      ['Kotlin', 4],
      ['Scala', 2],
      ['Java', 1],
    ]);
  });

  it('zero-fills a count the server left out', () => {
    setUp({ stats: roundStats({ counts: [4] }) });
    expect(grid()?.answers.map((a) => a.count)).toEqual([4, 0, 0]);
  });

  it('hands the correct terms to the grid', () => {
    setUp();
    expect(grid()?.correctTerms).toEqual(['Kotlin', 'Java']);
  });

  it('highlights no answer while the correct ones are hidden', () => {
    setUp();
    expect(grid()?.showCorrect).toBe(false);
    expect(correctIndicators().length).toBe(0);
  });

  it('highlights only the correct answers once shown', () => {
    setUp();
    fixture.componentRef.setInput('showCorrect', true);
    fixture.detectChanges();
    expect(grid()?.showCorrect).toBe(true);
    expect(grid()?.isCorrect('Kotlin')).toBe(true);
    expect(grid()?.isCorrect('Java')).toBe(true);
    expect(grid()?.isCorrect('Scala')).toBe(false);
    expect(correctIndicators().length).toBe(2);
  });

  it('shows a hint instead of the grid while there are no answers', () => {
    setUp({ stats: null });
    expect(component.hasAnswers()).toBe(false);
    expect(grid()).toBeUndefined();
  });

  it('hides the grid while the results are hidden', () => {
    setUp();
    fixture.componentRef.setInput('resultsVisible', false);
    fixture.detectChanges();
    expect(grid()).toBeUndefined();
  });

  it('summarizes the score only for a scored content', () => {
    setUp();
    fixture.componentRef.setInput('isPresentation', true);
    fixture.detectChanges();
    expect(summary()).toBeUndefined();

    fixture.componentRef.setInput('hasCorrectAnswer', true);
    fixture.componentRef.setInput('answerCount', 7);
    fixture.componentRef.setInput('correctAnswerCount', 5);
    fixture.detectChanges();

    expect(summary()?.answerCount()).toBe(7);
    expect(summary()?.correctAnswerCount()).toBe(5);
  });

  it('highlights the correct answers outside presentation, without the score', () => {
    setUp();
    fixture.componentRef.setInput('hasCorrectAnswer', true);
    fixture.componentRef.setInput('showCorrect', true);
    fixture.detectChanges();

    expect(correctIndicators().length).toBe(2);
    expect(summary()).toBeUndefined();
  });

  it('reveals highlight and score together in presentation', () => {
    setUp();
    fixture.componentRef.setInput('hasCorrectAnswer', true);
    fixture.componentRef.setInput('isPresentation', true);
    fixture.detectChanges();
    expect(correctIndicators().length).toBe(0);
    expect(summary()?.show()).toBe(false);

    fixture.componentRef.setInput('showCorrect', true);
    fixture.detectChanges();
    expect(correctIndicators().length).toBe(2);
    expect(summary()?.show()).toBe(true);
  });

  it('offers no banning without moderation rights', () => {
    setUp();
    expect(answerList()).toBeUndefined();
    expect(banButtons().length).toBe(0);
  });

  it('lists the answers with ban buttons where answers may be moderated', () => {
    setUp();
    fixture.componentRef.setInput('allowAnswerModeration', true);
    fixture.detectChanges();

    expect(grid()).toBeUndefined();
    expect(answerList()?.banMode).toBe(true);
    expect(answerList()?.correctAnswers).toEqual(['Kotlin', 'Java']);
    expect(banButtons().length).toBeGreaterThan(0);
  });

  it('offers no banning in presentation', () => {
    setUp();
    fixture.componentRef.setInput('allowAnswerModeration', true);
    fixture.componentRef.setInput('isPresentation', true);
    fixture.detectChanges();

    expect(answerList()).toBeUndefined();
    expect(grid()).toBeDefined();
  });

  it('bans an answer of the content once confirmed', () => {
    setUp();

    component.banAnswer('Scala');

    const [, , keyword, , confirmAction] =
      dialogService.openDeleteDialog.calls.mostRecent().args;
    expect(keyword).toBe('Scala');
    (confirmAction as () => Observable<unknown>)().subscribe();
    expect(banKeyword.mutate).toHaveBeenCalledWith({
      variables: { contentId: 'content-1', keyword: 'Scala' },
    });
    expect(notificationService.showAdvanced).toHaveBeenCalled();
  });

  it('does not report a ban that was cancelled', () => {
    setUp({ dialogResult: false });

    component.banAnswer('Scala');

    expect(notificationService.showAdvanced).not.toHaveBeenCalled();
  });

  it('bans the answer whose button was clicked', () => {
    setUp();
    fixture.componentRef.setInput('allowAnswerModeration', true);
    fixture.detectChanges();

    banButtons()[0].click();

    expect(dialogService.openDeleteDialog.calls.mostRecent().args[2]).toBe(
      answerList()?.answers.find((a) => !answerList()?.isCorrect(a.answer))
        ?.answer
    );
  });

  function emitUpdate(stats: ShortAnswerContentRoundStats) {
    statsUpdated.next({
      data: { questionnaireShortAnswerRoundStatsUpdated: stats },
    });
    fixture.detectChanges();
  }

  it('shows the pushed stats in the grid', () => {
    setUp();
    expect(grid()?.answers.length).toBe(3);

    emitUpdate(roundStats({ texts: ['Kotlin'], counts: [5] }));

    expect(gridEntries()).toEqual([['Kotlin', 5]]);
  });

  it('still reflects a refetch of the query after a push', () => {
    setUp();
    emitUpdate(roundStats({ texts: ['Kotlin'], counts: [5] }));

    stats$.next(
      result({
        questionnaireShortAnswerRoundStatsByRoundId: roundStats({
          texts: [],
          counts: [],
        }),
      })
    );
    fixture.detectChanges();

    expect(grid()).toBeUndefined();
  });

  it('keeps the last stats when the updates fail', () => {
    spyOn(console, 'error');
    setUp();

    statsUpdated.error(new Error('Subscription lost'));
    fixture.detectChanges();

    expect(grid()?.answers.length).toBe(3);
    expect(console.error).toHaveBeenCalled();
  });

  it('sends no query while the content has no round', () => {
    setUp();
    statsByRoundId.watch.calls.reset();

    fixture.componentRef.setInput('roundIds', []);
    fixture.detectChanges();

    expect(statsByRoundId.watch).not.toHaveBeenCalled();
    expect(grid()).toBeUndefined();
  });
});
