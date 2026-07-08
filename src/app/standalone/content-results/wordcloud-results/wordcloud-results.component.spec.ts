import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DialogService } from '@app/core/services/util/dialog.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { ThemeService } from '@app/core/theme/theme.service';
import { VisualizationType } from '@app/standalone/content-results/visualization/visualization-type';
import {
  BanQuestionnaireWordcloudContentKeywordGql,
  QuestionnaireWordcloudRoundStatsByRoundIdGql,
  QuestionnaireWordcloudRoundStatsUpdatedGql,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { NEVER, Observable, of } from 'rxjs';
import { WordcloudResultsComponent } from './wordcloud-results.component';

describe('WordcloudResultsComponent', () => {
  let fixture: ComponentFixture<WordcloudResultsComponent>;
  let component: WordcloudResultsComponent;
  let roundStats: jasmine.SpyObj<QuestionnaireWordcloudRoundStatsByRoundIdGql>;
  let banKeyword: jasmine.SpyObj<BanQuestionnaireWordcloudContentKeywordGql>;
  let dialogService: jasmine.SpyObj<DialogService>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  function statsResult(words: string[], counts: number[]) {
    return {
      dataState: 'complete',
      data: {
        questionnaireWordcloudRoundStatsByRoundId: { words, counts },
      },
    };
  }

  function setUp(
    inputs: Record<string, unknown> = {},
    dialogResult: unknown = true
  ) {
    // The visualizations are covered by their own components.
    TestBed.overrideComponent(WordcloudResultsComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
    });
    roundStats = jasmine.createSpyObj(
      'QuestionnaireWordcloudRoundStatsByRoundIdGql',
      ['watch']
    );
    roundStats.watch.and.returnValue({
      valueChanges: of(statsResult(['Angular', 'Kotlin'], [3, 1])),
    } as never);
    banKeyword = jasmine.createSpyObj(
      'BanQuestionnaireWordcloudContentKeywordGql',
      ['mutate']
    );
    banKeyword.mutate.and.returnValue(of({}) as never);
    dialogService = jasmine.createSpyObj('DialogService', ['openDeleteDialog']);
    dialogService.openDeleteDialog.and.returnValue({
      afterClosed: () => of(dialogResult),
    } as never);
    notificationService = jasmine.createSpyObj('NotificationService', [
      'showAdvanced',
    ]);
    const themeService = jasmine.createSpyObj('ThemeService', [
      'getAltTextColors',
    ]);
    themeService.getAltTextColors.and.returnValue(['red', 'blue']);

    configureTestModule(
      [getTranslocoModule(), WordcloudResultsComponent],
      [
        {
          provide: QuestionnaireWordcloudRoundStatsByRoundIdGql,
          useValue: roundStats,
        },
        {
          provide: QuestionnaireWordcloudRoundStatsUpdatedGql,
          useValue: { subscribe: () => NEVER },
        },
        {
          provide: BanQuestionnaireWordcloudContentKeywordGql,
          useValue: banKeyword,
        },
        { provide: DialogService, useValue: dialogService },
        { provide: NotificationService, useValue: notificationService },
        { provide: ThemeService, useValue: themeService },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(WordcloudResultsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('contentId', 'content-1');
    fixture.componentRef.setInput('roundId', 'round-1');
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  }

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  it('turns the round stats into wordcloud data', () => {
    setUp();

    expect(roundStats.watch).toHaveBeenCalledWith({
      variables: { roundId: 'round-1' },
    });
    expect(component.visualizationData()).toEqual({
      labels: ['Angular', 'Kotlin'],
      datasets: [{ values: [3, 1], colors: ['red', 'blue'] }],
    });
  });

  it('pairs each word with its count for the list views', () => {
    setUp();

    expect(component.listData()).toEqual([
      { answer: 'Angular', count: 3 },
      { answer: 'Kotlin', count: 1 },
    ]);
  });

  it('loads the stats of another round', () => {
    setUp();

    fixture.componentRef.setInput('roundId', 'round-2');
    fixture.detectChanges();

    expect(roundStats.watch).toHaveBeenCalledWith({
      variables: { roundId: 'round-2' },
    });
  });

  it('renders the chosen visualization', () => {
    setUp();
    expect(query('app-wordcloud')).not.toBeNull();

    fixture.componentRef.setInput('visualizationType', VisualizationType.TABLE);
    fixture.detectChanges();
    expect(query('app-wordcloud')).toBeNull();
    expect(query('app-answer-list')).not.toBeNull();

    fixture.componentRef.setInput('visualizationType', VisualizationType.GRID);
    fixture.detectChanges();
    expect(query('app-answer-grid-list')).not.toBeNull();
  });

  it('offers banning keywords in the table only where answers may be moderated', () => {
    setUp({ visualizationType: VisualizationType.TABLE });
    const answerList = () =>
      fixture.debugElement.query(By.css('app-answer-list'));
    expect(answerList().properties['isModerator']).toBeFalse();

    fixture.componentRef.setInput('allowAnswerModeration', true);
    fixture.detectChanges();
    expect(answerList().properties['isModerator']).toBeTrue();
  });

  it('renders nothing while the results are hidden', () => {
    setUp({ resultsVisible: false });

    expect(fixture.nativeElement.children.length).toBe(0);
  });

  it('bans a keyword of the content once confirmed', () => {
    setUp();

    component.banAnswer('Kotlin');

    const [, , keyword, , confirmAction] =
      dialogService.openDeleteDialog.calls.mostRecent().args;
    expect(keyword).toBe('Kotlin');
    (confirmAction as () => Observable<unknown>)().subscribe();
    expect(banKeyword.mutate).toHaveBeenCalledWith({
      variables: { contentId: 'content-1', keyword: 'Kotlin' },
    });
    expect(notificationService.showAdvanced).toHaveBeenCalled();
  });

  it('does not report a ban that was cancelled', () => {
    setUp({}, false);

    component.banAnswer('Kotlin');

    expect(notificationService.showAdvanced).not.toHaveBeenCalled();
  });
});
