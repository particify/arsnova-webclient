import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import { Theme, ThemeService } from '@app/core/theme/theme.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import {
  ContentType,
  NumericContentFormatData,
  NumericContentRoundStats,
  QuestionnaireNumericRoundStatsByRoundIdGql,
  QuestionnaireNumericRoundStatsUpdatedGql,
  Round,
} from '@gql/generated/graphql';
import { BarChartComponent } from '@app/standalone/content-results/visualization/chart/bar-chart.component';
import { CorrectAnswerResultsComponent } from '@app/standalone/correct-answer-results/correct-answer-results.component';
import { StatisticInfoComponent } from '@app/standalone/statistic-info/statistic-info.component';
import { NumericResultsComponent } from './numeric-results.component';

function formatData(
  overrides: Partial<NumericContentFormatData> = {}
): NumericContentFormatData {
  return {
    __typename: 'NumericContentFormatData',
    format: ContentType.Numeric,
    minNumber: 1,
    maxNumber: 5,
    correctNumber: null,
    tolerance: 0,
    ...overrides,
  };
}

function roundStats(
  overrides: Partial<NumericContentRoundStats> = {}
): NumericContentRoundStats {
  return {
    __typename: 'NumericContentRoundStats',
    selectedNumbers: [2, 4],
    counts: [1, 3],
    mean: 3.5,
    median: 4,
    standardDeviation: 1,
    variance: 1,
    minimum: 2,
    maximum: 4,
    correctAnswerFraction: null,
    ...overrides,
  };
}

// Echoes the variable name, so a spec can tell which colour a bar got.
const themeService = {
  getColor: (name: string) => `var(--${name})`,
  getCurrentTheme$: () => of(Theme.LIGHT),
};

function result(data: unknown) {
  return { dataState: 'complete' as const, data };
}

describe('NumericResultsComponent', () => {
  let fixture: ComponentFixture<NumericResultsComponent>;
  let component: NumericResultsComponent;
  let statsByRoundId: jasmine.SpyObj<QuestionnaireNumericRoundStatsByRoundIdGql>;
  let stats$: Map<string, BehaviorSubject<unknown>>;
  // Inert unless a spec pushes into it, so the query result stands.
  let statsUpdated: Subject<unknown>;
  let subscribeStatsUpdated: jasmine.Spy;

  interface SetUpOptions {
    stats?: NumericContentRoundStats | null;
    secondRoundStats?: NumericContentRoundStats;
    contentFormatData?: NumericContentFormatData;
    roundIds?: string[];
    rounds?: Round[];
  }

  function setUp(options: SetUpOptions = {}) {
    statsByRoundId = jasmine.createSpyObj(
      'QuestionnaireNumericRoundStatsByRoundIdGql',
      ['watch']
    );
    stats$ = new Map();
    // Writes land in the query like in Apollo's cache: as a new result.
    statsByRoundId.watch.and.callFake((options2) => {
      const roundId = (options2?.variables as { roundId: string }).roundId;
      const subject = new BehaviorSubject<unknown>(
        result({
          questionnaireNumericRoundStatsByRoundId:
            roundId === 'round-2'
              ? options.secondRoundStats
              : options.stats === undefined
                ? roundStats()
                : options.stats,
        })
      );
      stats$.set(roundId, subject);
      return {
        valueChanges: subject,
        updateQuery: (mapFn: () => unknown) => subject.next(result(mapFn())),
      } as never;
    });

    statsUpdated = new Subject<unknown>();
    subscribeStatsUpdated = jasmine
      .createSpy('subscribe')
      .and.callFake(() => statsUpdated.asObservable());

    configureTestModule(
      [getTranslocoModule(), NumericResultsComponent],
      [
        {
          provide: QuestionnaireNumericRoundStatsByRoundIdGql,
          useValue: statsByRoundId,
        },
        {
          provide: QuestionnaireNumericRoundStatsUpdatedGql,
          useValue: { subscribe: subscribeStatsUpdated },
        },
        { provide: ThemeService, useValue: themeService },
        { provide: PresentationService, useValue: { scale: () => 1 } },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(NumericResultsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput(
      'formatData',
      options.contentFormatData ?? formatData()
    );
    fixture.componentRef.setInput(
      'rounds',
      options.rounds ?? [
        { id: 'round-1', roundNo: 1 },
        { id: 'round-2', roundNo: 2 },
      ]
    );
    fixture.componentRef.setInput('roundIds', options.roundIds ?? ['round-1']);
    fixture.detectChanges();
  }

  function chart(): BarChartComponent | undefined {
    return fixture.debugElement.query(By.directive(BarChartComponent))
      ?.componentInstance;
  }

  function statisticInfos(): StatisticInfoComponent[] {
    return fixture.debugElement
      .queryAll(By.directive(StatisticInfoComponent))
      .map((node) => node.componentInstance);
  }

  function correctNumber(): string | undefined {
    return fixture.debugElement
      .query(By.css('[data-testid="correct-number"]'))
      ?.nativeElement.textContent.trim();
  }

  function summary(): CorrectAnswerResultsComponent | undefined {
    return fixture.debugElement.query(
      By.directive(CorrectAnswerResultsComponent)
    )?.componentInstance;
  }

  it('buckets the answers of the round into the chart', () => {
    setUp();
    expect(chart()?.data().labels).toEqual(['1', '2', '3', '4', '5']);
    expect(chart()?.data().datasets.length).toBe(1);
    expect(chart()?.data().datasets[0].values).toEqual([0, 1, 0, 3, 0]);
  });

  it('titles the bars of single-value groups with the value itself', () => {
    setUp();
    expect(chart()?.tooltipTitles()).toEqual(['1', '2', '3', '4', '5']);
  });

  it('colours every bar of a single round in the one bar blue', () => {
    setUp();
    expect(chart()?.data().datasets[0].colors).toEqual([
      'var(--bar-blue)',
      'var(--bar-blue)',
      'var(--bar-blue)',
      'var(--bar-blue)',
      'var(--bar-blue)',
    ]);
  });

  it('titles the bars with their range once a group spans several values', () => {
    setUp({
      contentFormatData: formatData({ minNumber: 1, maxNumber: 16 }),
      stats: roundStats({ selectedNumbers: [3], counts: [2] }),
    });
    expect(chart()?.tooltipTitles()?.[0]).toBe('0–1');
    expect(chart()?.data().datasets[0].values[1]).toBe(2);
  });

  it('shows an empty chart covering the range while there are no answers', () => {
    setUp({ stats: null });
    expect(chart()?.data().labels).toEqual(['1', '2', '3', '4', '5']);
    expect(chart()?.data().datasets[0].values).toEqual([0, 0, 0, 0, 0]);
    expect(component.hasAnswers()).toBe(false);
  });

  it('shows the six descriptive statistics of the round', () => {
    setUp();
    expect(statisticInfos().map((info) => info.label)).toEqual([
      'mean',
      'median',
      'standardDeviation',
      'variance',
      'minimum',
      'maximum',
    ]);
    expect(statisticInfos()[0].data).toEqual([3.5]);
    expect(statisticInfos()[0].hasAnswers).toBe(true);
    expect(statisticInfos()[0].round).toBe(0);
  });

  it('adds one dataset and one statistics row per compared round', () => {
    setUp({
      roundIds: ['round-1', 'round-2'],
      secondRoundStats: roundStats({
        selectedNumbers: [5],
        counts: [2],
        mean: 5,
      }),
    });
    expect(component.comparingRounds()).toBe(true);
    expect(chart()?.data().datasets.length).toBe(2);
    expect(chart()?.data().datasets[1].values).toEqual([0, 0, 0, 0, 2]);
    expect(chart()?.data().datasets[0].label).toBeTruthy();
    expect(statisticInfos()[0].data).toEqual([3.5, 5]);
    expect(statisticInfos()[0].round).toBe(2);
  });

  it('colours both compared rounds in the same bar blue', () => {
    setUp({ roundIds: ['round-1', 'round-2'] });
    const datasets = chart()?.data().datasets ?? [];
    expect(datasets.length).toBe(2);
    datasets.forEach((dataset) =>
      expect(new Set(dataset.colors)).toEqual(new Set(['var(--bar-blue)']))
    );
  });

  it('replaces the statistics with the correct answer once it is shown', () => {
    setUp({
      contentFormatData: formatData({ correctNumber: 4, tolerance: 1 }),
    });
    expect(statisticInfos().length).toBe(6);

    fixture.componentRef.setInput('showCorrect', true);
    fixture.detectChanges();

    expect(statisticInfos().length).toBe(0);
    expect(correctNumber()).toBe('4');
  });

  it('keeps the statistics visible for a content without a correct answer', () => {
    setUp();
    fixture.componentRef.setInput('showCorrect', true);
    fixture.detectChanges();
    expect(statisticInfos().length).toBe(6);
  });

  it('shows the correct answer outside presentation, without the score', () => {
    setUp({
      contentFormatData: formatData({ correctNumber: 4, tolerance: 1 }),
    });
    fixture.componentRef.setInput('hasCorrectAnswer', true);
    fixture.componentRef.setInput('showCorrect', true);
    fixture.detectChanges();

    expect(correctNumber()).toBe('4');
    expect(summary()).toBeUndefined();
  });

  it('reveals correct answer and score together in presentation', () => {
    setUp({
      contentFormatData: formatData({ correctNumber: 4, tolerance: 1 }),
    });
    fixture.componentRef.setInput('hasCorrectAnswer', true);
    fixture.componentRef.setInput('isPresentation', true);
    fixture.detectChanges();
    expect(correctNumber()).toBeUndefined();
    expect(summary()?.show()).toBe(false);

    fixture.componentRef.setInput('showCorrect', true);
    fixture.detectChanges();
    expect(correctNumber()).toBe('4');
    expect(summary()?.show()).toBe(true);
  });

  it('hides the chart while the results are hidden', () => {
    setUp();
    fixture.componentRef.setInput('resultsVisible', false);
    fixture.detectChanges();
    expect(chart()).toBeUndefined();
  });

  function emitUpdate(stats: NumericContentRoundStats) {
    statsUpdated.next({
      data: { questionnaireNumericRoundStatsUpdated: stats },
    });
    fixture.detectChanges();
  }

  it('shows the pushed stats in the chart', () => {
    setUp();
    expect(chart()?.data().datasets[0].values).toEqual([0, 1, 0, 3, 0]);

    emitUpdate(roundStats({ selectedNumbers: [2, 4, 5], counts: [1, 3, 6] }));

    expect(chart()?.data().datasets[0].values).toEqual([0, 1, 0, 3, 6]);
  });

  it('still reflects a refetch of the query after a push', () => {
    setUp();
    emitUpdate(roundStats({ selectedNumbers: [2, 4, 5], counts: [1, 3, 6] }));

    stats$.get('round-1')!.next(
      result({
        questionnaireNumericRoundStatsByRoundId: roundStats({
          selectedNumbers: [],
          counts: [],
        }),
      })
    );
    fixture.detectChanges();

    expect(chart()?.data().datasets[0].values).toEqual([0, 0, 0, 0, 0]);
  });

  it('loads the stats of a closed round without listening to updates', () => {
    setUp({
      roundIds: ['round-1', 'round-2'],
      rounds: [
        { id: 'round-1', roundNo: 1, closed: true },
        { id: 'round-2', roundNo: 2, closed: false },
      ] as Round[],
    });

    expect(statsByRoundId.watch).toHaveBeenCalledWith({
      variables: { roundId: 'round-1' },
      fetchPolicy: 'cache-and-network',
    });
    expect(subscribeStatsUpdated).toHaveBeenCalledOnceWith({
      variables: { roundId: 'round-2' },
    });
  });

  it('keeps the last stats when the updates fail', () => {
    spyOn(console, 'error');
    setUp();

    statsUpdated.error(new Error('Subscription lost'));
    fixture.detectChanges();

    expect(chart()?.data().datasets[0].values).toEqual([0, 1, 0, 3, 0]);
    expect(console.error).toHaveBeenCalled();
  });

  it('starts the live updates once a closed round is reopened', () => {
    setUp({
      rounds: [{ id: 'round-1', roundNo: 1, closed: true }] as Round[],
    });
    expect(subscribeStatsUpdated).not.toHaveBeenCalled();

    // Starting the content again reopens its round under the same id.
    fixture.componentRef.setInput('rounds', [
      { id: 'round-1', roundNo: 1, closed: false },
    ] as Round[]);
    fixture.detectChanges();

    expect(subscribeStatsUpdated).toHaveBeenCalledOnceWith({
      variables: { roundId: 'round-1' },
    });
  });

  it('keeps listening to a round closed while it is shown', () => {
    setUp({
      rounds: [{ id: 'round-1', roundNo: 1, closed: false }] as Round[],
    });

    fixture.componentRef.setInput('rounds', [
      { id: 'round-1', roundNo: 1, closed: true },
    ] as Round[]);
    fixture.detectChanges();
    emitUpdate(roundStats({ selectedNumbers: [2, 4, 5], counts: [1, 3, 6] }));

    expect(subscribeStatsUpdated).toHaveBeenCalledTimes(1);
    expect(chart()?.data().datasets[0].values).toEqual([0, 1, 0, 3, 6]);
  });
});
