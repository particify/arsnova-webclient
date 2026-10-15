import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { ThemeService } from '@app/core/theme/theme.service';
import {
  ChoiceContentFormatData,
  ContentType,
  QuestionnaireChoiceRoundStatsByRoundIdGql,
  QuestionnaireChoiceRoundStatsUpdatedGql,
  Round,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { Subject } from 'rxjs';
import { ChoiceResultsComponent } from './choice-results.component';

describe('ChoiceResultsComponent', () => {
  let fixture: ComponentFixture<ChoiceResultsComponent>;
  let component: ChoiceResultsComponent;
  let roundStats: jasmine.SpyObj<QuestionnaireChoiceRoundStatsByRoundIdGql>;
  let roundStatsUpdated: jasmine.SpyObj<QuestionnaireChoiceRoundStatsUpdatedGql>;
  let stats$: Subject<unknown>;
  let updates$: Subject<unknown>;

  const options = [{ label: 'A' }, { label: 'B' }, { label: 'C' }];

  function setUp(
    formatData: Partial<ChoiceContentFormatData>,
    inputs: {
      hasCorrectAnswer?: boolean;
      showCorrect?: boolean;
      roundIds?: string[];
      answerCount?: number;
      activeRoundId?: string;
      isPresentation?: boolean;
    } = {},
    render = false
  ) {
    // Rendering leaves out the child components, which have their own specs.
    TestBed.overrideComponent(ChoiceResultsComponent, {
      set: render
        ? { imports: [], schemas: [NO_ERRORS_SCHEMA] }
        : { template: '' },
    });
    stats$ = new Subject();
    updates$ = new Subject();
    roundStats = jasmine.createSpyObj(
      'QuestionnaireChoiceRoundStatsByRoundIdGql',
      ['watch']
    );
    // Writes land in the query like in Apollo's cache: as a new result.
    roundStats.watch.and.returnValue({
      valueChanges: stats$,
      updateQuery: (mapFn: () => unknown) =>
        stats$.next({ dataState: 'complete', data: mapFn() }),
    } as never);
    roundStatsUpdated = jasmine.createSpyObj(
      'QuestionnaireChoiceRoundStatsUpdatedGql',
      ['subscribe']
    );
    roundStatsUpdated.subscribe.and.returnValue(updates$ as never);
    const themeService = jasmine.createSpyObj('ThemeService', [
      'getBarColors',
      'getColor',
    ]);
    themeService.getBarColors.and.returnValue(['bar-1', 'bar-2']);
    themeService.getColor.and.callFake((name: string) => name);

    configureTestModule(
      [getTranslocoModule(), ChoiceResultsComponent],
      [
        {
          provide: QuestionnaireChoiceRoundStatsByRoundIdGql,
          useValue: roundStats,
        },
        {
          provide: QuestionnaireChoiceRoundStatsUpdatedGql,
          useValue: roundStatsUpdated,
        },
        {
          provide: ThemeService,
          useValue: themeService,
        },
        {
          provide: PresentationService,
          useValue: { scale: () => 1 },
        },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(ChoiceResultsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('roundIds', ['round-1']);
    fixture.componentRef.setInput('rounds', [
      { id: 'round-1', roundNo: 1 },
      { id: 'round-2', roundNo: 2 },
    ] as Round[]);
    fixture.componentRef.setInput('formatData', {
      format: ContentType.Choice,
      options: [],
      ...formatData,
    });
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  }

  it('passes both the raw and the rendered label to the answer list', () => {
    setUp({ options: [{ label: '**A**', labelRendered: '<p><b>A</b></p>' }] });

    expect(component.answerItems()[0]).toEqual(
      jasmine.objectContaining({
        label: '**A**',
        labelRendered: '<p><b>A</b></p>',
      })
    );
  });

  function barColors() {
    return component.visualizationData().datasets[0].colors;
  }

  it('cycles the palette while the correct answer is hidden', () => {
    setUp({ options, correctOptionIndexes: [0] }, { hasCorrectAnswer: true });

    expect(barColors()).toEqual(['bar-1', 'bar-2', 'bar-1']);
  });

  it('keeps the palette colour of a single correct option on reveal', () => {
    setUp(
      { options, correctOptionIndexes: [1] },
      { hasCorrectAnswer: true, showCorrect: true }
    );

    expect(barColors()).toEqual(['grey', 'bar-2', 'grey']);
  });

  it('turns several correct options green on reveal', () => {
    setUp(
      { options, correctOptionIndexes: [0, 2] },
      { hasCorrectAnswer: true, showCorrect: true }
    );

    expect(barColors()).toEqual(['green', 'grey', 'green']);
  });

  it('does not recolour a content without a correct answer', () => {
    setUp({ options }, { showCorrect: true });

    expect(barColors()).toEqual(['bar-1', 'bar-2', 'bar-1']);
  });

  it('applies the reveal colours to both compared rounds', () => {
    setUp(
      { options, correctOptionIndexes: [1] },
      {
        hasCorrectAnswer: true,
        showCorrect: true,
        roundIds: ['round-1', 'round-2'],
      }
    );

    expect(
      component.visualizationData().datasets.map((dataset) => dataset.colors)
    ).toEqual([
      ['grey', 'bar-2', 'grey'],
      ['grey', 'bar-2', 'grey'],
    ]);
  });

  function counts() {
    return component.visualizationData().datasets[0].values;
  }

  function emitStats(selectionCounts: number[]) {
    stats$.next({
      dataState: 'complete',
      data: { questionnaireChoiceRoundStatsByRoundId: { selectionCounts } },
    });
  }

  function emitUpdate(selectionCounts: number[]) {
    updates$.next({
      data: { questionnaireChoiceRoundStatsUpdated: { selectionCounts } },
    });
  }

  it('loads the stats of the round and listens to their updates', () => {
    setUp({ options });

    expect(roundStats.watch).toHaveBeenCalledWith({
      variables: { roundId: 'round-1' },
    });
    expect(roundStatsUpdated.subscribe).toHaveBeenCalledWith({
      variables: { roundId: 'round-1' },
    });
  });

  it('shows the loaded stats and then each update', () => {
    setUp({ options });

    emitStats([1, 2, 3]);
    expect(counts()).toEqual([1, 2, 3]);

    emitUpdate([2, 2, 3]);
    expect(counts()).toEqual([2, 2, 3]);
  });

  it('still reflects a refetch of the query after an update', () => {
    setUp({ options });
    emitUpdate([2, 2, 3]);

    emitStats([0, 0, 0]);

    expect(counts()).toEqual([0, 0, 0]);
  });

  it('keeps the last stats when the updates fail', () => {
    spyOn(console, 'error');
    setUp({ options });
    emitStats([1, 2, 3]);

    updates$.error(new Error('Subscription lost'));

    expect(counts()).toEqual([1, 2, 3]);
    expect(console.error).toHaveBeenCalled();
  });

  it('switches both sources to another round', () => {
    setUp({ options });

    fixture.componentRef.setInput('roundIds', ['round-2']);
    fixture.detectChanges();

    expect(roundStats.watch).toHaveBeenCalledWith({
      variables: { roundId: 'round-2' },
    });
    expect(roundStatsUpdated.subscribe).toHaveBeenCalledWith({
      variables: { roundId: 'round-2' },
    });
  });

  describe('respondents', () => {
    const counted = { answerCount: 4, activeRoundId: 'round-2' };

    it('relates the shares of the active round to its respondents', () => {
      setUp({ options }, { ...counted, roundIds: ['round-2'] });

      expect(component.respondentCount()).toBe(4);
    });

    it('falls back to shares of selections for compared rounds', () => {
      setUp({ options }, { ...counted, roundIds: ['round-1', 'round-2'] });

      expect(component.respondentCount()).toBeUndefined();
    });

    it('falls back to shares of selections for an earlier round', () => {
      setUp({ options }, { ...counted, roundIds: ['round-1'] });

      expect(component.respondentCount()).toBeUndefined();
    });
  });

  describe('share of correct answers', () => {
    const presented = {
      hasCorrectAnswer: true,
      isPresentation: true,
      answerCount: 4,
      activeRoundId: 'round-2',
    };

    function correctShare(): Element | null {
      return fixture.nativeElement.querySelector('app-correct-answer-results');
    }

    it('is shown for the active round', () => {
      setUp({ options }, { ...presented, roundIds: ['round-2'] }, true);

      expect(correctShare()).not.toBeNull();
    });

    it('is hidden for compared rounds, as it is only known for the active one', () => {
      setUp(
        { options },
        { ...presented, roundIds: ['round-1', 'round-2'] },
        true
      );

      expect(correctShare()).toBeNull();
    });

    it('is hidden for an earlier round, as it is only known for the active one', () => {
      setUp({ options }, { ...presented, roundIds: ['round-1'] }, true);

      expect(correctShare()).toBeNull();
    });
  });
});
