import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import { BROWSER_LANG } from '@app/core/services/util/language.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { Theme, ThemeService } from '@app/core/theme/theme.service';
import { BarChartComponent } from '@app/standalone/content-results/visualization/chart/bar-chart.component';
import {
  BinaryContentFormatData,
  BinaryContentRoundStats,
  ContentType,
  QuestionnaireBinaryRoundStatsByRoundIdGql,
  QuestionnaireBinaryRoundStatsUpdatedGql,
} from '@gql/generated/graphql';
import { BinaryResultsComponent } from './binary-results.component';

/** Green for yes, red for no, as ThemeService.getBinaryColors resolves them. */
const BINARY_COLORS = [
  'var(--likert-strongly-agree)',
  'var(--likert-strongly-disagree)',
];

const GREY = 'var(--grey)';

const themeService = {
  getBarColors: () => ['var(--bar-blue)', 'var(--bar-yellow)'],
  getBinaryColors: () => [...BINARY_COLORS],
  getColor: (name: string) => (name === 'grey' ? GREY : '#000000'),
  getCurrentTheme$: () => of(Theme.LIGHT),
};

function answerLabels(labels: [string, string]) {
  return { answer: { yes: labels[0], no: labels[1] } };
}

function formatData(
  correctAnswer: boolean | null = null
): BinaryContentFormatData {
  return {
    __typename: 'BinaryContentFormatData',
    format: ContentType.Binary,
    correctAnswer: correctAnswer,
  };
}

function roundStats(selectionCounts: number[]): BinaryContentRoundStats {
  return {
    __typename: 'BinaryContentRoundStats',
    selectionCounts: selectionCounts,
  };
}

function result(data: unknown) {
  return { dataState: 'complete' as const, data };
}

describe('BinaryResultsComponent', () => {
  let fixture: ComponentFixture<BinaryResultsComponent>;
  let component: BinaryResultsComponent;
  let statsByRoundId: jasmine.SpyObj<QuestionnaireBinaryRoundStatsByRoundIdGql>;
  let stats$: Map<string, BehaviorSubject<unknown>>;
  // Inert unless a spec pushes into it, so the query result stands.
  let statsUpdated: Subject<unknown>;

  interface SetUpOptions {
    stats?: BinaryContentRoundStats | null;
    secondRoundStats?: BinaryContentRoundStats;
    contentFormatData?: BinaryContentFormatData;
    roundIds?: string[];
    language?: string;
    hasCorrectAnswer?: boolean;
    showCorrect?: boolean;
    isPresentation?: boolean;
  }

  function setUp(options: SetUpOptions = {}) {
    statsByRoundId = jasmine.createSpyObj(
      'QuestionnaireBinaryRoundStatsByRoundIdGql',
      ['watch']
    );
    stats$ = new Map();
    // Writes land in the query like in Apollo's cache: as a new result.
    statsByRoundId.watch.and.callFake((watchOptions) => {
      const roundId = (watchOptions?.variables as { roundId: string }).roundId;
      const subject = new BehaviorSubject<unknown>(
        result({
          questionnaireBinaryRoundStatsByRoundId:
            roundId === 'round-2'
              ? options.secondRoundStats
              : options.stats === undefined
                ? roundStats([7, 3])
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
            de: answerLabels(['Ja', 'Nein']),
            en: answerLabels(['Yes', 'No']),
          },
          translocoConfig: {
            availableLangs: ['de', 'en'],
            defaultLang: 'en',
          },
        }),
        BinaryResultsComponent,
      ],
      [
        {
          provide: QuestionnaireBinaryRoundStatsByRoundIdGql,
          useValue: statsByRoundId,
        },
        {
          provide: QuestionnaireBinaryRoundStatsUpdatedGql,
          useValue: { subscribe: () => statsUpdated.asObservable() },
        },
        { provide: ThemeService, useValue: themeService },
        { provide: PresentationService, useValue: { getScale: () => 1 } },
        { provide: BROWSER_LANG, useValue: 'en' },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(BinaryResultsComponent);
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
    fixture.componentRef.setInput(
      'hasCorrectAnswer',
      options.hasCorrectAnswer ?? false
    );
    fixture.componentRef.setInput('showCorrect', options.showCorrect ?? false);
    fixture.componentRef.setInput(
      'isPresentation',
      options.isPresentation ?? false
    );
    fixture.detectChanges();
  }

  function chart(): BarChartComponent | undefined {
    return fixture.debugElement.query(By.directive(BarChartComponent))
      ?.componentInstance;
  }

  function chartLabels(): string[] | undefined {
    return chart()?.data().labels;
  }

  function correctAnswerText(): string | undefined {
    return fixture.debugElement
      .query(By.css('[data-testid="correct-answer"]'))
      ?.nativeElement.textContent.trim();
  }

  it('puts the two counts onto two labelled bars', () => {
    setUp();
    expect(chartLabels()).toEqual(['Yes', 'No']);
    expect(chart()?.data().datasets.length).toBe(1);
    expect(chart()?.data().datasets[0].values).toEqual([7, 3]);
  });

  it('colours the yes and no bar in the binary colours', () => {
    setUp();
    expect(chart()?.data().datasets[0].colors).toEqual(BINARY_COLORS);
  });

  it('colours the bars the same way whether or not the content is scored', () => {
    setUp({ contentFormatData: formatData(false) });
    expect(chart()?.data().datasets[0].colors).toEqual(BINARY_COLORS);
  });

  it('greys out the wrong bar on the reveal when yes is correct', () => {
    setUp({
      contentFormatData: formatData(true),
      hasCorrectAnswer: true,
      showCorrect: true,
    });
    expect(chart()?.data().datasets[0].colors).toEqual([
      BINARY_COLORS[0],
      GREY,
    ]);
  });

  it('greys out the wrong bar on the reveal when no is correct', () => {
    setUp({
      contentFormatData: formatData(false),
      hasCorrectAnswer: true,
      showCorrect: true,
    });
    expect(chart()?.data().datasets[0].colors).toEqual([
      GREY,
      BINARY_COLORS[1],
    ]);
  });

  it('keeps both colours on the reveal without a correct answer', () => {
    setUp({ showCorrect: true });
    expect(chart()?.data().datasets[0].colors).toEqual(BINARY_COLORS);
  });

  it('shows an empty chart over both options while there are no answers', () => {
    setUp({ stats: null });
    expect(chartLabels()).toEqual(['Yes', 'No']);
    expect(chart()?.data().datasets[0].values).toEqual([0, 0]);
  });

  it('titles every bar with its option', () => {
    setUp();
    expect(chart()?.tooltipTitles()).toEqual(chartLabels());
  });

  it('labels the bars on the chart itself outside presentation', () => {
    setUp({ isPresentation: false });
    expect(chart()?.showLabels()).toBeTrue();
    expect(chart()?.alwaysShowXAxisLabels()).toBeTrue();
  });

  it('labels the bars on the chart itself in presentation', () => {
    setUp({ isPresentation: true });
    expect(chart()?.showLabels()).toBeTrue();
    expect(chart()?.alwaysShowXAxisLabels()).toBeTrue();
  });

  it('labels the bars in the active language', () => {
    setUp();
    expect(chartLabels()).toEqual(['Yes', 'No']);
  });

  it('labels the bars in the room language where it has translations', () => {
    setUp({ language: 'de' });
    expect(chartLabels()).toEqual(['Ja', 'Nein']);
  });

  it('falls back to the active language without a room language', () => {
    setUp({ language: undefined });
    expect(chartLabels()).toEqual(['Yes', 'No']);
  });

  it('falls back to the active language for a room language without translations', () => {
    setUp({ language: 'sv' });
    expect(chartLabels()).toEqual(['Yes', 'No']);
  });

  it('names yes as the correct answer when the content stores yes', () => {
    setUp({
      contentFormatData: formatData(true),
      hasCorrectAnswer: true,
      showCorrect: true,
    });
    expect(correctAnswerText()).toBe('Yes');
  });

  it('names no as the correct answer when the content stores no', () => {
    setUp({
      contentFormatData: formatData(false),
      hasCorrectAnswer: true,
      showCorrect: true,
    });
    expect(correctAnswerText()).toBe('No');
  });

  it('names the correct answer in the room language', () => {
    setUp({
      contentFormatData: formatData(true),
      hasCorrectAnswer: true,
      showCorrect: true,
      language: 'de',
    });
    expect(correctAnswerText()).toBe('Ja');
  });

  it('hides the correct answer while it is not revealed', () => {
    setUp({
      contentFormatData: formatData(true),
      hasCorrectAnswer: true,
      showCorrect: false,
    });
    expect(correctAnswerText()).toBeUndefined();
  });

  it('names no correct answer for a survey content', () => {
    setUp({ hasCorrectAnswer: false, showCorrect: true });
    expect(correctAnswerText()).toBeUndefined();
    expect(component.correctLabel()).toBeUndefined();
  });

  it('draws one dataset per round when comparing rounds', () => {
    setUp({
      roundIds: ['round-1', 'round-2'],
      secondRoundStats: roundStats([2, 8]),
    });
    expect(component.comparingRounds()).toBeTrue();
    expect(chart()?.data().datasets.length).toBe(2);
    expect(chart()?.data().datasets[0].values).toEqual([7, 3]);
    expect(chart()?.data().datasets[1].values).toEqual([2, 8]);
  });

  it('names the datasets after their rounds only when comparing', () => {
    setUp({
      roundIds: ['round-1', 'round-2'],
      secondRoundStats: roundStats([2, 8]),
    });
    expect(
      chart()
        ?.data()
        .datasets.map((dataset) => dataset.label)
    ).toEqual(['content.round 1', 'content.round 2']);
  });

  it('leaves the dataset unnamed for a single round', () => {
    setUp();
    expect(chart()?.data().datasets[0].label).toBeUndefined();
  });

  it('keeps both bars labelled while comparing rounds', () => {
    setUp({
      roundIds: ['round-1', 'round-2'],
      secondRoundStats: roundStats([2, 8]),
    });
    expect(chartLabels()).toEqual(['Yes', 'No']);
  });

  it('hides the chart while the results are hidden', () => {
    setUp();
    fixture.componentRef.setInput('resultsVisible', false);
    fixture.detectChanges();
    expect(chart()).toBeUndefined();
  });

  function emitUpdate(stats: BinaryContentRoundStats) {
    statsUpdated.next({
      data: { questionnaireBinaryRoundStatsUpdated: stats },
    });
    fixture.detectChanges();
  }

  it('shows the pushed stats in the chart', () => {
    setUp();
    expect(chart()?.data().datasets[0].values).toEqual([7, 3]);

    emitUpdate(roundStats([8, 3]));

    expect(chart()?.data().datasets[0].values).toEqual([8, 3]);
  });

  it('still reflects a refetch of the query after a push', () => {
    setUp();
    emitUpdate(roundStats([8, 3]));

    stats$
      .get('round-1')!
      .next(
        result({ questionnaireBinaryRoundStatsByRoundId: roundStats([0, 0]) })
      );
    fixture.detectChanges();

    expect(chart()?.data().datasets[0].values).toEqual([0, 0]);
  });

  it('keeps the last stats when the updates fail', () => {
    spyOn(console, 'error');
    setUp();

    statsUpdated.error(new Error('Subscription lost'));
    fixture.detectChanges();

    expect(chart()?.data().datasets[0].values).toEqual([7, 3]);
    expect(console.error).toHaveBeenCalled();
  });
});
