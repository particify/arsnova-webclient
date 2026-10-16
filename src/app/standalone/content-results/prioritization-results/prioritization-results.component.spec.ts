import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, Subject, of } from 'rxjs';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { ThemeService } from '@app/core/theme/theme.service';
import { BarListComponent } from '@app/standalone/content-results/visualization/bar-list/bar-list.component';
import {
  ContentType,
  PrioritizationContentFormatData,
  PrioritizationContentRoundStats,
  QuestionnairePrioritizationRoundStatsByRoundIdGql,
  QuestionnairePrioritizationRoundStatsUpdatedGql,
  Round,
} from '@gql/generated/graphql';
import { PrioritizationResultsComponent } from './prioritization-results.component';

function formatData(labels = ['A', 'B', 'C']): PrioritizationContentFormatData {
  return {
    __typename: 'PrioritizationContentFormatData',
    format: ContentType.Prioritization,
    assignablePoints: 100,
    options: labels.map((label) => ({
      __typename: 'AnswerOption' as const,
      label,
      labelRendered: null,
    })),
  };
}

function roundStats(
  assignedPoints: number[] | null
): PrioritizationContentRoundStats {
  return {
    __typename: 'PrioritizationContentRoundStats',
    assignedPoints,
  };
}

function result(data: unknown) {
  return { dataState: 'complete' as const, data };
}

describe('PrioritizationResultsComponent', () => {
  let fixture: ComponentFixture<PrioritizationResultsComponent>;
  let component: PrioritizationResultsComponent;
  let stats$: BehaviorSubject<unknown>;
  let statsByRoundId: jasmine.SpyObj<QuestionnairePrioritizationRoundStatsByRoundIdGql>;
  // Inert unless a spec pushes into it, so the query result stands.
  let statsUpdated: Subject<unknown>;
  let subscribeStatsUpdated: jasmine.Spy;

  function setUp(
    stats: PrioritizationContentRoundStats | null = roundStats([]),
    labels?: string[],
    rounds?: Round[]
  ) {
    statsByRoundId = jasmine.createSpyObj(
      'QuestionnairePrioritizationRoundStatsByRoundIdGql',
      ['watch']
    );
    stats$ = new BehaviorSubject<unknown>(
      result({ questionnairePrioritizationRoundStatsByRoundId: stats })
    );
    // Writes land in the query like in Apollo's cache: as a new result.
    statsByRoundId.watch.and.returnValue({
      valueChanges: stats$,
      updateQuery: (mapFn: () => unknown) => stats$.next(result(mapFn())),
    } as never);

    statsUpdated = new Subject<unknown>();
    subscribeStatsUpdated = jasmine
      .createSpy('subscribe')
      .and.callFake(() => statsUpdated.asObservable());

    configureTestModule(
      [getTranslocoModule(), PrioritizationResultsComponent],
      [
        {
          provide: QuestionnairePrioritizationRoundStatsByRoundIdGql,
          useValue: statsByRoundId,
        },
        {
          provide: QuestionnairePrioritizationRoundStatsUpdatedGql,
          useValue: { subscribe: subscribeStatsUpdated },
        },
        {
          provide: ThemeService,
          useValue: { getBarColors: () => ['rgb(1, 2, 3)'] },
        },
        // The item labels are rendered through this service.
        {
          provide: FormattingService,
          useValue: { postString: () => of({ html: '' }) },
        },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(PrioritizationResultsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('formatData', formatData(labels));
    fixture.componentRef.setInput('roundIds', ['round-1']);
    if (rounds) {
      fixture.componentRef.setInput('rounds', rounds);
    }
    fixture.detectChanges();
  }

  function round(closed: boolean): Round {
    return {
      __typename: 'Round',
      id: 'round-1',
      roundNo: 1,
      closed,
      started: true,
      answerable: !closed,
    };
  }

  function barList(): BarListComponent | undefined {
    return fixture.debugElement.query(By.directive(BarListComponent))
      ?.componentInstance;
  }

  function bars(): [string, number][] {
    return (barList()?.items() ?? []).map((item) => [item.label, item.value]);
  }

  it('ranks the items by the points they were given', () => {
    setUp(roundStats([20, 50, 30]));
    expect(bars()).toEqual([
      ['B', 50],
      ['C', 30],
      ['A', 20],
    ]);
  });

  it('keeps the content order among items on equal points', () => {
    setUp(roundStats([10, 10, 10]));
    expect(bars()).toEqual([
      ['A', 10],
      ['B', 10],
      ['C', 10],
    ]);
  });

  it('shows an item nobody gave a point to, last', () => {
    setUp(roundStats([0, 40, 0]), ['A', 'B', 'C']);
    expect(bars()).toEqual([
      ['B', 40],
      ['A', 0],
      ['C', 0],
    ]);
  });

  it('shows every item at zero while the round has no answers', () => {
    setUp(roundStats([]));
    expect(bars()).toEqual([
      ['A', 0],
      ['B', 0],
      ['C', 0],
    ]);
  });

  it('shows every item at zero while the round has no stats at all', () => {
    setUp(null);
    expect(bars()).toEqual([
      ['A', 0],
      ['B', 0],
      ['C', 0],
    ]);
  });

  it('fills in an item the stats did not cover', () => {
    setUp(roundStats([30]));
    expect(bars()).toEqual([
      ['A', 30],
      ['B', 0],
      ['C', 0],
    ]);
  });

  function emitUpdate(stats: PrioritizationContentRoundStats) {
    statsUpdated.next({
      data: { questionnairePrioritizationRoundStatsUpdated: stats },
    });
    fixture.detectChanges();
  }

  it('reranks the items as a live update arrives', () => {
    setUp(roundStats([30, 20, 10]));
    expect(bars()[0]).toEqual(['A', 30]);

    emitUpdate(roundStats([30, 90, 10]));

    expect(bars()).toEqual([
      ['B', 90],
      ['A', 30],
      ['C', 10],
    ]);
  });

  it('still reflects a refetch of the query after a push', () => {
    setUp(roundStats([30, 20, 10]));
    emitUpdate(roundStats([30, 90, 10]));

    stats$.next(
      result({
        questionnairePrioritizationRoundStatsByRoundId: roundStats([1, 2, 3]),
      })
    );
    fixture.detectChanges();

    expect(bars()[0]).toEqual(['C', 3]);
  });

  it('keeps the last stats when the updates fail', () => {
    spyOn(console, 'error');
    setUp(roundStats([30, 20, 10]));

    statsUpdated.error(new Error('Subscription lost'));
    fixture.detectChanges();

    expect(bars()[0]).toEqual(['A', 30]);
    expect(console.error).toHaveBeenCalled();
  });

  it('loads the stats of a closed round without listening to updates', () => {
    setUp(roundStats([]), undefined, [round(true)]);

    expect(statsByRoundId.watch).toHaveBeenCalledWith({
      variables: { roundId: 'round-1' },
    });
    expect(subscribeStatsUpdated).not.toHaveBeenCalled();
  });

  it('listens to the updates of an open round', () => {
    setUp(roundStats([]), undefined, [round(false)]);

    expect(subscribeStatsUpdated).toHaveBeenCalledOnceWith({
      variables: { roundId: 'round-1' },
    });
  });

  it('sends no query while the content has no round', () => {
    setUp(roundStats([30, 20, 10]));
    statsByRoundId.watch.calls.reset();

    fixture.componentRef.setInput('roundIds', []);
    fixture.detectChanges();

    expect(statsByRoundId.watch).not.toHaveBeenCalled();
  });

  it('hides the bars while the results are hidden', () => {
    setUp(roundStats([30, 20, 10]));
    fixture.componentRef.setInput('resultsVisible', false);
    fixture.detectChanges();
    expect(barList()).toBeUndefined();
    expect(component.items().length).toBe(3);
  });

  it('labels the bars with points until the unit is switched', () => {
    setUp(roundStats([30, 20, 10]));
    expect(barList()?.dataLabelMode()).toBe('absolute');

    fixture.componentRef.setInput('visualizationUnitPercent', true);
    fixture.detectChanges();

    expect(barList()?.dataLabelMode()).toBe('percent');
  });
});
