import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, Subject } from 'rxjs';
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

function complete(data: unknown) {
  return of({ dataState: 'complete' as const, data });
}

describe('PrioritizationResultsComponent', () => {
  let fixture: ComponentFixture<PrioritizationResultsComponent>;
  let component: PrioritizationResultsComponent;
  // Inert unless a spec pushes into it, so the query result stands.
  let statsUpdated: Subject<unknown>;

  function setUp(
    stats: PrioritizationContentRoundStats | null = roundStats([]),
    labels?: string[]
  ) {
    const statsByRoundId = jasmine.createSpyObj(
      'QuestionnairePrioritizationRoundStatsByRoundIdGql',
      ['watch']
    );
    statsByRoundId.watch.and.returnValue({
      valueChanges: complete({
        questionnairePrioritizationRoundStatsByRoundId: stats,
      }),
    } as never);

    statsUpdated = new Subject<unknown>();

    configureTestModule(
      [getTranslocoModule(), PrioritizationResultsComponent],
      [
        {
          provide: QuestionnairePrioritizationRoundStatsByRoundIdGql,
          useValue: statsByRoundId,
        },
        {
          provide: QuestionnairePrioritizationRoundStatsUpdatedGql,
          useValue: { subscribe: () => statsUpdated.asObservable() },
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
    fixture.detectChanges();
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

  it('reranks the items as a live update arrives', () => {
    setUp(roundStats([30, 20, 10]));
    expect(bars()[0]).toEqual(['A', 30]);

    statsUpdated.next({
      data: {
        questionnairePrioritizationRoundStatsUpdated: roundStats([30, 90, 10]),
      },
    });
    fixture.detectChanges();

    expect(bars()).toEqual([
      ['B', 90],
      ['A', 30],
      ['C', 10],
    ]);
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
