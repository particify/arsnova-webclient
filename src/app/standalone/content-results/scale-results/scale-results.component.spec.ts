import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import { BROWSER_LANG } from '@app/core/services/util/language.service';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { Theme, ThemeService } from '@app/core/theme/theme.service';
import { BarChartComponent } from '@app/standalone/content-results/visualization/chart/bar-chart.component';
import {
  ContentType,
  QuestionnaireScaleRoundStatsByRoundIdGql,
  QuestionnaireScaleRoundStatsUpdatedGql,
  ScaleContentFormatData,
  ScaleContentRoundStats,
  ScaleContentTemplate,
} from '@gql/generated/graphql';
import { ScaleResultsComponent } from './scale-results.component';

const LIKERT_COLORS = [
  'var(--likert-strongly-agree)',
  'var(--likert-agree)',
  'var(--likert-neither)',
  'var(--likert-disagree)',
  'var(--likert-strongly-disagree)',
];

// A fresh array per call, as the component splices the neutral colour out.
const themeService = {
  getColor: (name: string) => `var(--${name})`,
  getCurrentTheme$: () => of(Theme.LIGHT),
  getLikertColors: () => [...LIKERT_COLORS],
};

const EN_LABELS = [
  'Strongly agree',
  'Somewhat agree',
  'Neither agree or disagree',
  'Somewhat disagree',
  'Strongly disagree',
];
const DE_LABELS = [
  'stimme vollkommen zu',
  'stimme eher zu',
  'teils, teils',
  'stimme eher nicht zu',
  'stimme gar nicht zu',
];
const SUFFIXES = [
  'positive-2',
  'positive-1',
  'neutral',
  'negative-1',
  'negative-2',
];

function optionTemplate(labels: string[]) {
  return {
    'option-template': Object.fromEntries(
      SUFFIXES.map((suffix, i) => ['agreement-' + suffix, labels[i]])
    ),
  };
}

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

function roundStats(
  overrides: Partial<ScaleContentRoundStats> = {}
): ScaleContentRoundStats {
  return {
    __typename: 'ScaleContentRoundStats',
    counts: [4, 3, 2, 1, 0],
    ...overrides,
  };
}

function result(data: unknown) {
  return { dataState: 'complete' as const, data };
}

describe('ScaleResultsComponent', () => {
  let fixture: ComponentFixture<ScaleResultsComponent>;
  let component: ScaleResultsComponent;
  let statsByRoundId: jasmine.SpyObj<QuestionnaireScaleRoundStatsByRoundIdGql>;
  let stats$: Map<string, BehaviorSubject<unknown>>;
  // Inert unless a spec pushes into it, so the query result stands.
  let statsUpdated: Subject<unknown>;

  interface SetUpOptions {
    stats?: ScaleContentRoundStats | null;
    secondRoundStats?: ScaleContentRoundStats;
    contentFormatData?: ScaleContentFormatData;
    roundIds?: string[];
    language?: string;
  }

  function setUp(options: SetUpOptions = {}) {
    statsByRoundId = jasmine.createSpyObj(
      'QuestionnaireScaleRoundStatsByRoundIdGql',
      ['watch']
    );
    stats$ = new Map();
    // Writes land in the query like in Apollo's cache: as a new result.
    statsByRoundId.watch.and.callFake((watchOptions) => {
      const roundId = (watchOptions?.variables as { roundId: string }).roundId;
      const subject = new BehaviorSubject<unknown>(
        result({
          questionnaireScaleRoundStatsByRoundId:
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

    configureTestModule(
      [
        getTranslocoModule({
          langs: {
            de: optionTemplate(DE_LABELS),
            en: optionTemplate(EN_LABELS),
          },
          translocoConfig: {
            availableLangs: ['de', 'en'],
            defaultLang: 'en',
          },
        }),
        ScaleResultsComponent,
      ],
      [
        {
          provide: QuestionnaireScaleRoundStatsByRoundIdGql,
          useValue: statsByRoundId,
        },
        {
          provide: QuestionnaireScaleRoundStatsUpdatedGql,
          useValue: { subscribe: () => statsUpdated.asObservable() },
        },
        { provide: LikertScaleService, useValue: new LikertScaleService() },
        { provide: ThemeService, useValue: themeService },
        { provide: PresentationService, useValue: { getScale: () => 1 } },
        { provide: BROWSER_LANG, useValue: 'en' },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(ScaleResultsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput(
      'formatData',
      options.contentFormatData ?? formatData()
    );
    fixture.componentRef.setInput('rounds', [
      { id: 'round-1', roundNo: 1 },
      { id: 'round-2', roundNo: 2 },
    ]);
    fixture.componentRef.setInput('roundIds', options.roundIds ?? ['round-1']);
    fixture.componentRef.setInput('language', options.language);
    fixture.detectChanges();
  }

  function chart(): BarChartComponent | undefined {
    return fixture.debugElement.query(By.directive(BarChartComponent))
      ?.componentInstance;
  }

  it('labels the bars with the options of the template', () => {
    setUp();
    expect(chart()?.data().labels).toEqual(EN_LABELS);
  });

  it('labels the bars in the room language where it has translations', () => {
    setUp({ language: 'de' });
    expect(chart()?.data().labels).toEqual(DE_LABELS);
  });

  it('falls back to the active language without a room language', () => {
    setUp({ language: undefined });
    expect(chart()?.data().labels).toEqual(EN_LABELS);
  });

  it('falls back to the active language for a room language without translations', () => {
    setUp({ language: 'sv' });
    expect(chart()?.data().labels).toEqual(EN_LABELS);
  });

  it('labels the bars of a symbol template with its literal labels', () => {
    setUp({
      contentFormatData: formatData({ template: ScaleContentTemplate.Emoji }),
    });
    expect(chart()?.data().labels).toEqual(['😀', '🙂', '😐', '🙁', '😟']);
  });

  it('leaves the literal labels alone whatever the room language', () => {
    setUp({
      contentFormatData: formatData({ template: ScaleContentTemplate.Emoji }),
      language: 'de',
    });
    expect(chart()?.data().labels).toEqual(['😀', '🙂', '😐', '🙁', '😟']);
  });

  it('puts the counts of the round into the chart', () => {
    setUp();
    expect(chart()?.data().datasets.length).toBe(1);
    expect(chart()?.data().datasets[0].values).toEqual([4, 3, 2, 1, 0]);
  });

  it('titles every bar with its option', () => {
    setUp();
    expect(chart()?.tooltipTitles()).toEqual(chart()?.data().labels);
  });

  it('drops the neutral option and its colour without the neutral option', () => {
    setUp({
      contentFormatData: formatData({ neutralOption: false }),
      stats: roundStats({ counts: [4, 3, 2, 1] }),
    });
    expect(chart()?.data().labels).toEqual([
      EN_LABELS[0],
      EN_LABELS[1],
      EN_LABELS[3],
      EN_LABELS[4],
    ]);
    expect(chart()?.data().datasets[0].values).toEqual([4, 3, 2, 1]);
    expect(chart()?.data().datasets[0].colors).toEqual([
      'var(--likert-strongly-agree)',
      'var(--likert-agree)',
      'var(--likert-disagree)',
      'var(--likert-strongly-disagree)',
    ]);
  });

  it('colours the five options in the likert colours in order', () => {
    setUp();
    expect(chart()?.data().datasets[0].colors).toEqual(LIKERT_COLORS);
  });

  it('shows an empty chart over all options while there are no answers', () => {
    setUp({ stats: null });
    expect(chart()?.data().labels?.length).toBe(5);
    expect(chart()?.data().datasets[0].values).toEqual([0, 0, 0, 0, 0]);
  });

  it('zero-fills counts the server left out', () => {
    setUp({ stats: roundStats({ counts: [2, 1] }) });
    expect(chart()?.data().datasets[0].values).toEqual([2, 1, 0, 0, 0]);
  });

  it('adds one labelled dataset per compared round', () => {
    setUp({
      roundIds: ['round-1', 'round-2'],
      secondRoundStats: roundStats({ counts: [0, 1, 2, 3, 4] }),
    });
    expect(component.comparingRounds()).toBe(true);
    expect(chart()?.data().datasets.length).toBe(2);
    expect(chart()?.data().datasets[1].values).toEqual([0, 1, 2, 3, 4]);
    expect(chart()?.data().datasets[0].label).toBeTruthy();
    expect(chart()?.data().datasets[1].label).toBeTruthy();
  });

  it('gives every compared round the same colours', () => {
    setUp({
      roundIds: ['round-1', 'round-2'],
      secondRoundStats: roundStats(),
    });
    const datasets = chart()?.data().datasets ?? [];
    expect(datasets.length).toBe(2);
    datasets.forEach((dataset) =>
      expect(dataset.colors).toEqual(LIKERT_COLORS)
    );
  });

  it('hides the chart while the results are hidden', () => {
    setUp();
    fixture.componentRef.setInput('resultsVisible', false);
    fixture.detectChanges();
    expect(chart()).toBeUndefined();
  });

  function emitUpdate(stats: ScaleContentRoundStats) {
    statsUpdated.next({ data: { questionnaireScaleRoundStatsUpdated: stats } });
    fixture.detectChanges();
  }

  it('shows the pushed stats in the chart', () => {
    setUp();
    expect(chart()?.data().datasets[0].values).toEqual([4, 3, 2, 1, 0]);

    emitUpdate(roundStats({ counts: [5, 3, 2, 1, 1] }));

    expect(chart()?.data().datasets[0].values).toEqual([5, 3, 2, 1, 1]);
  });

  it('still reflects a refetch of the query after a push', () => {
    setUp();
    emitUpdate(roundStats({ counts: [5, 3, 2, 1, 1] }));

    stats$.get('round-1')!.next(
      result({
        questionnaireScaleRoundStatsByRoundId: roundStats({ counts: [] }),
      })
    );
    fixture.detectChanges();

    expect(chart()?.data().datasets[0].values).toEqual([0, 0, 0, 0, 0]);
  });

  it('keeps the last stats when the updates fail', () => {
    spyOn(console, 'error');
    setUp();

    statsUpdated.error(new Error('Subscription lost'));
    fixture.detectChanges();

    expect(chart()?.data().datasets[0].values).toEqual([4, 3, 2, 1, 0]);
    expect(console.error).toHaveBeenCalled();
  });
});
