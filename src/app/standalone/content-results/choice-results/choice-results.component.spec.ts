import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { ThemeService } from '@app/core/theme/theme.service';
import {
  ChoiceContentFormatData,
  ContentType,
  QuestionnaireChoiceRoundStatsByRoundIdGql,
  QuestionnaireChoiceRoundStatsUpdatedGql,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
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
      roundClosed?: boolean;
    } = {}
  ) {
    TestBed.overrideComponent(ChoiceResultsComponent, {
      set: { template: '' },
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
      [ChoiceResultsComponent],
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
    fixture.componentRef.setInput('roundId', 'round-1');
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

  it('loads the stats of a closed round without listening to updates', () => {
    setUp({ options }, { roundClosed: true });

    expect(roundStats.watch).toHaveBeenCalledWith({
      variables: { roundId: 'round-1' },
    });
    expect(roundStatsUpdated.subscribe).not.toHaveBeenCalled();
  });

  it('keeps listening to a round closed while it is shown', () => {
    setUp({ options });

    fixture.componentRef.setInput('roundClosed', true);
    fixture.detectChanges();
    emitUpdate([2, 2, 3]);

    expect(roundStatsUpdated.subscribe).toHaveBeenCalledTimes(1);
    expect(component.selectionCounts()).toEqual([2, 2, 3]);
  });

  it('shows the loaded stats and then each update', () => {
    setUp({ options });

    emitStats([1, 2, 3]);
    expect(component.selectionCounts()).toEqual([1, 2, 3]);

    emitUpdate([2, 2, 3]);
    expect(component.selectionCounts()).toEqual([2, 2, 3]);
  });

  it('still reflects a refetch of the query after an update', () => {
    setUp({ options });
    emitUpdate([2, 2, 3]);

    emitStats([0, 0, 0]);

    expect(component.selectionCounts()).toEqual([0, 0, 0]);
  });

  it('keeps the last stats when the updates fail', () => {
    spyOn(console, 'error');
    setUp({ options });
    emitStats([1, 2, 3]);

    updates$.error(new Error('Subscription lost'));

    expect(component.selectionCounts()).toEqual([1, 2, 3]);
    expect(console.error).toHaveBeenCalled();
  });

  it('switches both sources to another round', () => {
    setUp({ options });

    fixture.componentRef.setInput('roundId', 'round-2');
    fixture.detectChanges();

    expect(roundStats.watch).toHaveBeenCalledWith({
      variables: { roundId: 'round-2' },
    });
    expect(roundStatsUpdated.subscribe).toHaveBeenCalledWith({
      variables: { roundId: 'round-2' },
    });
  });
});
