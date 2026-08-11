import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, Subject } from 'rxjs';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import { AnswerGridListComponent } from '@app/standalone/answer-grid-list/answer-grid-list.component';
import { CorrectAnswerResultsComponent } from '@app/standalone/correct-answer-results/correct-answer-results.component';
import {
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

function complete(data: unknown) {
  return of({ dataState: 'complete' as const, data });
}

describe('ShortAnswerResultsComponent', () => {
  let fixture: ComponentFixture<ShortAnswerResultsComponent>;
  let component: ShortAnswerResultsComponent;
  let statsByRoundId: jasmine.SpyObj<QuestionnaireShortAnswerRoundStatsByRoundIdGql>;
  // Inert unless a spec pushes into it, so the query result stands.
  let statsUpdated: Subject<unknown>;

  interface SetUpOptions {
    stats?: ShortAnswerContentRoundStats | null;
    contentFormatData?: ShortAnswerContentFormatData;
  }

  function setUp(options: SetUpOptions = {}) {
    statsByRoundId = jasmine.createSpyObj(
      'QuestionnaireShortAnswerRoundStatsByRoundIdGql',
      ['watch']
    );
    statsByRoundId.watch.and.returnValue({
      valueChanges: complete({
        questionnaireShortAnswerRoundStatsByRoundId:
          options.stats === undefined ? roundStats() : options.stats,
      }),
    } as never);

    statsUpdated = new Subject<unknown>();

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
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(ShortAnswerResultsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput(
      'formatData',
      options.contentFormatData ?? formatData()
    );
    fixture.componentRef.setInput('roundIds', ['round-1']);
    fixture.detectChanges();
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

  it('merges live subscription emissions into the grid', () => {
    setUp();
    expect(grid()?.answers.length).toBe(3);

    statsUpdated.next({
      data: {
        questionnaireShortAnswerRoundStatsUpdated: roundStats({
          texts: ['Kotlin'],
          counts: [5],
        }),
      },
    });
    fixture.detectChanges();

    expect(gridEntries()).toEqual([['Kotlin', 5]]);
  });
});
