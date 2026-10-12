import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { Theme, ThemeService } from '@app/core/theme/theme.service';
import { ChoiceAnswerListComponent } from '@app/standalone/content-results/choice-results/choice-answer-list/choice-answer-list.component';
import { BarChartComponent } from '@app/standalone/content-results/visualization/chart/bar-chart.component';
import { CorrectAnswerResultsComponent } from '@app/standalone/correct-answer-results/correct-answer-results.component';
import {
  ContentType,
  QuestionnaireSortRoundStatsByRoundIdGql,
  QuestionnaireSortRoundStatsUpdatedGql,
  SortContentFormatData,
  SortContentRoundStats,
} from '@gql/generated/graphql';
import { SortResultsComponent } from './sort-results.component';

const GREY = 'grey';
const PALETTE = ['bar-1', 'bar-2', 'bar-3', 'bar-4', 'bar-5'];

/** Stored in the given order, which is also the correct one unless stated. */
function formatData(
  labels = ['A', 'B', 'C', 'D'],
  correctOrder: number[] | null = labels.map((_, index) => index)
): SortContentFormatData {
  return {
    __typename: 'SortContentFormatData',
    format: ContentType.Sort,
    correctOrder,
    options: labels.map((label) => ({
      __typename: 'AnswerOption' as const,
      label,
      labelRendered: null,
    })),
  };
}

function roundStats(combinations: [number[], number][]): SortContentRoundStats {
  return {
    __typename: 'SortContentRoundStats',
    combinations: combinations.map(([selectedChoiceIndexes, count]) => ({
      __typename: 'SortCombination' as const,
      selectedChoiceIndexes,
      count,
    })),
  };
}

function result(data: unknown) {
  return { dataState: 'complete' as const, data };
}

describe('SortResultsComponent', () => {
  let fixture: ComponentFixture<SortResultsComponent>;
  let component: SortResultsComponent;
  let stats$: BehaviorSubject<unknown>;
  // Inert unless a spec pushes into it, so the query result stands.
  let statsUpdated: Subject<unknown>;
  let statsByRoundId: jasmine.SpyObj<QuestionnaireSortRoundStatsByRoundIdGql>;

  function setUp(
    stats: SortContentRoundStats | null = roundStats([]),
    roundIds = ['round-1'],
    data = formatData()
  ) {
    statsByRoundId = jasmine.createSpyObj(
      'QuestionnaireSortRoundStatsByRoundIdGql',
      ['watch']
    );
    stats$ = new BehaviorSubject<unknown>(
      result({ questionnaireSortRoundStatsByRoundId: stats })
    );
    // Writes land in the query like in Apollo's cache: as a new result.
    statsByRoundId.watch.and.returnValue({
      valueChanges: stats$,
      updateQuery: (mapFn: () => unknown) => stats$.next(result(mapFn())),
    } as never);

    statsUpdated = new Subject<unknown>();

    configureTestModule(
      [getTranslocoModule(), SortResultsComponent],
      [
        {
          provide: QuestionnaireSortRoundStatsByRoundIdGql,
          useValue: statsByRoundId,
        },
        {
          provide: QuestionnaireSortRoundStatsUpdatedGql,
          useValue: { subscribe: () => statsUpdated.asObservable() },
        },
        {
          provide: ThemeService,
          useValue: {
            getBarColors: () => PALETTE,
            getColor: (name: string) => name,
            getCurrentTheme$: () => of(Theme.LIGHT),
          },
        },
        { provide: PresentationService, useValue: { getScale: () => 1 } },
        // The item list renders the labels through this service.
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

    fixture = TestBed.createComponent(SortResultsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('formatData', data);
    fixture.componentRef.setInput('roundIds', roundIds);
    fixture.detectChanges();
  }

  function reveal() {
    fixture.componentRef.setInput('showCorrect', true);
    fixture.detectChanges();
  }

  function chart(): BarChartComponent | undefined {
    return fixture.debugElement.query(By.directive(BarChartComponent))
      ?.componentInstance;
  }

  function barLabels(): string[] {
    return chart()?.data().labels ?? [];
  }

  function barColors(): string[] {
    return (chart()?.data().datasets[0].colors ?? []) as string[];
  }

  function optionList(): ChoiceAnswerListComponent {
    return fixture.debugElement.query(By.directive(ChoiceAnswerListComponent))
      .componentInstance;
  }

  function optionOrder(): string[] {
    return optionList()
      .answers()
      .map((answer) => answer.label);
  }

  function summary(): CorrectAnswerResultsComponent | undefined {
    return fixture.debugElement.query(
      By.directive(CorrectAnswerResultsComponent)
    )?.componentInstance;
  }

  it('numbers the items in shuffled order until the reveal', () => {
    setUp();
    expect(optionOrder()).toEqual(['D', 'C', 'B', 'A']);
    expect(
      optionList()
        .answers()
        .map((answer) => answer.labelLetter)
    ).toEqual(['1', '2', '3', '4']);
  });

  it('passes both the raw and the rendered label of an item', () => {
    setUp();
    fixture.componentRef.setInput('formatData', {
      ...formatData(['**A**']),
      options: [
        {
          __typename: 'AnswerOption' as const,
          label: '**A**',
          labelRendered: '<p><strong>A</strong></p>',
        },
      ],
    });
    fixture.detectChanges();

    expect(component.answerItems()[0]).toEqual(
      jasmine.objectContaining({
        label: '**A**',
        labelRendered: '<p><strong>A</strong></p>',
      })
    );
  });

  it('puts the items back into their correct order on the reveal', () => {
    setUp();
    reveal();
    expect(optionOrder()).toEqual(['A', 'B', 'C', 'D']);
  });

  it('marks the whole list as correct on the reveal', () => {
    setUp();
    expect(
      optionList()
        .answers()
        .map((answer) => answer.isCorrect)
    ).toEqual([false, false, false, false]);
    reveal();
    expect(
      optionList()
        .answers()
        .map((answer) => answer.isCorrect)
    ).toEqual([true, true, true, true]);
  });

  it('labels a bar with the positions in the shuffled list', () => {
    setUp(roundStats([[[0, 1, 2, 3], 3]]));
    // A is shown fourth, B third, C second, D first.
    expect(barLabels()).toEqual(['4-3-2-1']);
  });

  it('relabels the bars with the correct positions on the reveal', () => {
    setUp(roundStats([[[0, 2, 1, 3], 3]]));
    expect(barLabels()).toEqual(['4-2-3-1']);
    reveal();
    expect(barLabels()).toEqual(['1-3-2-4']);
  });

  it('charts one bar per submitted order with its count', () => {
    setUp(
      roundStats([
        [[0, 1, 2, 3], 5],
        [[1, 0, 2, 3], 2],
      ])
    );
    expect(barLabels().length).toBe(2);
    expect(chart()?.data().datasets[0].values).toEqual([5, 2]);
  });

  it('names the aggregate bar rather than numbering it', () => {
    setUp(
      roundStats([
        [[1, 0, 2, 3], 6],
        [[2, 1, 0, 3], 5],
        [[3, 1, 2, 0], 4],
        [[0, 2, 1, 3], 3],
        [[0, 3, 2, 1], 2],
        [[0, 1, 3, 2], 1],
      ])
    );
    expect(barLabels()[4]).toBe('statistic.other-combinations');
    expect(chart()?.data().datasets[0].values).toEqual([6, 5, 4, 3, 3]);
  });

  it('colours every bar from the palette while the correct one is hidden', () => {
    setUp(
      roundStats([
        [[0, 1, 2, 3], 5],
        [[1, 0, 2, 3], 2],
      ])
    );
    expect(barColors()).toEqual([PALETTE[0], PALETTE[1]]);
  });

  it('greys out every bar but the correct order on the reveal', () => {
    setUp(
      roundStats([
        [[1, 0, 2, 3], 5],
        [[0, 1, 2, 3], 2],
      ])
    );
    reveal();
    expect(barColors()).toEqual([GREY, PALETTE[1]]);
  });

  it('greys out the aggregate bar too', () => {
    setUp(
      roundStats([
        [[1, 0, 2, 3], 6],
        [[0, 1, 2, 3], 5],
        [[3, 1, 2, 0], 4],
        [[0, 2, 1, 3], 3],
        [[0, 3, 2, 1], 2],
        [[0, 1, 3, 2], 1],
      ])
    );
    reveal();
    expect(barColors()).toEqual([GREY, PALETTE[1], GREY, GREY, GREY]);
  });

  it('charts no bar at all while the round has no answers', () => {
    setUp(null);
    expect(component.topCombinations()).toEqual([]);
    expect(barLabels()).toEqual([]);
    expect(chart()?.data().datasets[0].values).toEqual([]);
  });

  function emitUpdate(stats: SortContentRoundStats) {
    statsUpdated.next({ data: { questionnaireSortRoundStatsUpdated: stats } });
    fixture.detectChanges();
  }

  it('keeps the numbering while a live update arrives', () => {
    setUp(roundStats([[[0, 1, 2, 3], 1]]));
    const shuffled = optionOrder();

    emitUpdate(
      roundStats([
        [[0, 1, 2, 3], 4],
        [[1, 0, 2, 3], 1],
      ])
    );

    expect(chart()?.data().datasets[0].values).toEqual([4, 1]);
    expect(optionOrder()).toEqual(shuffled);
  });

  it('still reflects a refetch of the query after a push', () => {
    setUp(roundStats([[[0, 1, 2, 3], 1]]));
    emitUpdate(roundStats([[[0, 1, 2, 3], 4]]));

    stats$.next(
      result({ questionnaireSortRoundStatsByRoundId: roundStats([]) })
    );
    fixture.detectChanges();

    expect(chart()?.data().datasets[0].values).toEqual([]);
  });

  it('keeps the last stats when the updates fail', () => {
    spyOn(console, 'error');
    setUp(roundStats([[[0, 1, 2, 3], 1]]));

    statsUpdated.error(new Error('Subscription lost'));
    fixture.detectChanges();

    expect(chart()?.data().datasets[0].values).toEqual([1]);
    expect(console.error).toHaveBeenCalled();
  });

  it('hides the chart while the results are hidden, keeping the items', () => {
    setUp(roundStats([[[0, 1, 2, 3], 1]]));
    fixture.componentRef.setInput('resultsVisible', false);
    fixture.detectChanges();
    expect(chart()).toBeUndefined();
    expect(optionOrder().length).toBe(4);
  });

  it('summarizes the score only for a scored content in presentation', () => {
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

  it('reveals the correct order outside presentation, without the score', () => {
    setUp();
    fixture.componentRef.setInput('hasCorrectAnswer', true);
    reveal();
    expect(optionOrder()).toEqual(['A', 'B', 'C', 'D']);
    expect(summary()).toBeUndefined();
  });

  it('does not query stats for a content without a round yet', () => {
    setUp(null, []);

    expect(statsByRoundId.watch).not.toHaveBeenCalled();
  });

  describe('with shuffled storage', () => {
    // Stored as C, A, D, B; the correct order is A, B, C, D.
    const shuffled = () => formatData(['C', 'A', 'D', 'B'], [1, 3, 0, 2]);

    it('reveals the correct order rather than the stored one', () => {
      setUp(roundStats([]), ['round-1'], shuffled());
      reveal();
      expect(optionOrder()).toEqual(['A', 'B', 'C', 'D']);
    });

    it('keeps the bar of the correct order coloured on the reveal', () => {
      setUp(
        roundStats([
          [[0, 1, 2, 3], 5],
          [[1, 3, 0, 2], 2],
        ]),
        ['round-1'],
        shuffled()
      );
      reveal();
      expect(barColors()).toEqual([GREY, PALETTE[1]]);
      expect(barLabels()).toEqual(['3-1-4-2', '1-2-3-4']);
    });
  });

  describe('while the correct order is withheld', () => {
    const withheld = () => formatData(['A', 'B', 'C', 'D'], null);

    it('neither reorders nor marks the items on the reveal', () => {
      setUp(roundStats([]), ['round-1'], withheld());
      const shuffledOrder = optionOrder();
      reveal();
      expect(optionOrder()).toEqual(shuffledOrder);
      expect(
        optionList()
          .answers()
          .map((answer) => answer.isCorrect)
      ).toEqual([false, false, false, false]);
    });

    it('greys out no bar on the reveal', () => {
      setUp(
        roundStats([
          [[1, 0, 2, 3], 5],
          [[0, 1, 2, 3], 2],
        ]),
        ['round-1'],
        withheld()
      );
      reveal();
      expect(barColors()).toEqual([PALETTE[0], PALETTE[1]]);
    });
  });
});
