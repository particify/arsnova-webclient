import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { ContentCarouselService } from '@app/core/services/util/content-carousel.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { ThemeService } from '@app/core/theme/theme.service';
import {
  AnswerResultState,
  Content,
  ContentAnswerResult,
  ContentType,
  Questionnaire,
  QuestionnaireAnswerResultsByQuestionnaireIdGql,
  QuestionnaireType,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { MockRouter } from '@testing/test-helpers';
import { of, throwError } from 'rxjs';
import { SeriesOverviewComponent } from './series-overview.component';

describe('SeriesOverviewComponent', () => {
  let fixture: ComponentFixture<SeriesOverviewComponent>;
  let component: SeriesOverviewComponent;
  let router: MockRouter;

  const contents = ['c-1', 'c-2', 'c-3'].map(
    (id) =>
      ({
        id,
        bodyRendered: `<p>${id}</p>`,
        formatData: { format: ContentType.Choice },
      }) as Content
  );

  interface SetUpOptions {
    questionnaire?: Partial<Questionnaire>;
    results?: AnswerResultState[];
    score?: { achievedScore: number; maxScore: number };
    isPureInfoSeries?: boolean;
    finished?: boolean;
    lastContentAnswered?: boolean;
  }

  function setUp(options: SetUpOptions = {}) {
    const results = options.results ?? [
      AnswerResultState.Correct,
      AnswerResultState.Unanswered,
      AnswerResultState.Unanswered,
    ];
    const answerResults = jasmine.createSpyObj(
      'QuestionnaireAnswerResultsByQuestionnaireIdGql',
      ['watch']
    );
    answerResults.watch.and.returnValue({
      valueChanges: of({
        loading: false,
        data: {
          questionnaireAnswerResultsByQuestionnaireId: {
            achievedScore: 0,
            maxScore: 0,
            ...options.score,
          },
        },
      }),
    });
    const routingService = jasmine.createSpyObj('RoutingService', [
      'getRoleRoute',
      'getShortId',
    ]);
    routingService.getRoleRoute.and.returnValue('p');
    routingService.getShortId.and.returnValue('12345678');
    const themeService = jasmine.createSpyObj('ThemeService', [
      'getColor',
      'getPrimaryColor',
    ]);
    const contentCarouselService = jasmine.createSpyObj(
      'ContentCarouselService',
      ['isLastContentAnswered', 'setLastContentAnswered']
    );
    contentCarouselService.isLastContentAnswered.and.returnValue(
      !!options.lastContentAnswered
    );
    const answerService = jasmine.createSpyObj('ContentAnswerService', [
      'getAnswerResultIcon',
    ]);
    answerService.getAnswerResultIcon.and.returnValue('check');

    configureTestModule(
      [getTranslocoModule(), SeriesOverviewComponent],
      [
        { provide: Router, useClass: MockRouter },
        {
          provide: QuestionnaireAnswerResultsByQuestionnaireIdGql,
          useValue: answerResults,
        },
        { provide: RoutingService, useValue: routingService },
        { provide: ThemeService, useValue: themeService },
        { provide: ContentCarouselService, useValue: contentCarouselService },
        { provide: ContentAnswerService, useValue: answerService },
        { provide: FormattingService, useValue: { postString: () => of('') } },
      ]
    ).compileComponents();

    router = TestBed.inject(Router) as unknown as MockRouter;
    fixture = TestBed.createComponent(SeriesOverviewComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('questionnaire', {
      id: 'q-1',
      name: 'Slides',
      type: QuestionnaireType.Mixed,
      leaderboardEnabled: false,
      ...options.questionnaire,
    } as Questionnaire);
    fixture.componentRef.setInput('contents', contents);
    fixture.componentRef.setInput(
      'answerResults',
      results.map(
        (result, i) =>
          ({ contentId: contents[i].id, result }) as ContentAnswerResult
      )
    );
    fixture.componentRef.setInput('roomId', 'room-1');
    fixture.componentRef.setInput('finished', !!options.finished);
    fixture.componentRef.setInput(
      'isPureInfoSeries',
      !!options.isPureInfoSeries
    );
    fixture.detectChanges();
  }

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  it('counts every content that is no longer unanswered as progress', () => {
    setUp({
      results: [
        AnswerResultState.Correct,
        AnswerResultState.Abstained,
        AnswerResultState.Unanswered,
      ],
    });

    expect(component.getProgressDataText()).toBe('2 / 3');
    expect(query('#progress-info-chart')).not.toBeNull();
  });

  it('shows the score once the correct answers have been published', () => {
    setUp({
      questionnaire: { correctOptionsPublished: true },
      score: { achievedScore: 10, maxScore: 30 },
    });

    expect(component.score()).toBe(33);
    expect(query('#correct-info-chart')).not.toBeNull();
  });

  it('hides the score until the correct answers have been published', () => {
    setUp({ score: { achievedScore: 10, maxScore: 30 } });

    expect(component.hasScore()).toBeFalse();
    expect(query('#correct-info-chart')).toBeNull();
  });

  it('keeps the last score when refetching the results fails', () => {
    setUp({
      questionnaire: { correctOptionsPublished: true },
      score: { achievedScore: 10, maxScore: 30 },
    });
    spyOn(console, 'error');
    const answerResults = TestBed.inject(
      QuestionnaireAnswerResultsByQuestionnaireIdGql
    );
    (answerResults.watch as jasmine.Spy).and.returnValue({
      valueChanges: throwError(() => new Error('Query failed')),
    });

    fixture.componentRef.setInput('questionnaire', {
      id: 'q-1',
      type: QuestionnaireType.Mixed,
      correctOptionsPublished: false,
    } as Questionnaire);
    fixture.detectChanges();

    expect(() => component.score()).not.toThrow();
    expect(component.score()).toBe(33);
    expect(console.error).toHaveBeenCalled();
  });

  it('shows no charts for a series of slides only', () => {
    setUp({ isPureInfoSeries: true });

    expect(query('#progress-info-chart')).toBeNull();
    expect(query('.header-text')?.textContent?.trim()).toBe('Slides');
  });

  it('invites to continue an unfinished series', () => {
    setUp();

    expect(query('.header-text')?.textContent?.trim()).toBe(
      'participant.content.continue-where-you-stopped'
    );
  });

  it('thanks for the participation in a finished series', () => {
    setUp({ finished: true });

    expect(query('.header-text')?.textContent?.trim()).toBe(
      'participant.content.thanks-for-participation'
    );
  });

  it('continues with the first unanswered content', () => {
    setUp();

    component.goToFirstUnanswered();

    expect(router.navigate).toHaveBeenCalledWith([
      'p',
      '12345678',
      'questionnaire',
      'q-1',
      'c-2',
    ]);
  });

  it('shows quiz answers as merely answered until the correct answers are published', () => {
    setUp();
    expect(component.hasAnsweredState(AnswerResultState.Correct)).toBeTrue();

    fixture.componentRef.setInput('questionnaire', {
      id: 'q-1',
      correctOptionsPublished: true,
    } as Questionnaire);

    expect(component.hasAnsweredState(AnswerResultState.Correct)).toBeFalse();
    expect(component.hasAnsweredState(AnswerResultState.Neutral)).toBeTrue();
  });

  it('shows no spinner while there are no results yet', () => {
    setUp({ results: [], lastContentAnswered: true });

    expect(component.isLoadingLastContent()).toBeFalse();
  });

  it('shows a spinner for the last content while its answer is processed', () => {
    setUp({ lastContentAnswered: true });

    const items = fixture.nativeElement.querySelectorAll(
      'mat-action-list > button'
    );
    expect(items[2].querySelector('app-loading-indicator')).not.toBeNull();
    expect(items[2].querySelector('mat-icon')).toBeNull();
    expect(items[1].querySelector('app-loading-indicator')).toBeNull();
  });

  describe('score', () => {
    function scoreQueries() {
      return (
        TestBed.inject(QuestionnaireAnswerResultsByQuestionnaireIdGql)
          .watch as jasmine.Spy
      ).calls;
    }

    function update(changes: Partial<Questionnaire>) {
      fixture.componentRef.setInput('questionnaire', {
        id: 'q-1',
        name: 'Slides',
        type: QuestionnaireType.Mixed,
        leaderboardEnabled: false,
        ...changes,
      } as Questionnaire);
      fixture.detectChanges();
    }

    it('fetches the score anew once the correct answers are published', () => {
      setUp();
      const fetches = scoreQueries().count();

      update({ correctOptionsPublished: true });

      expect(scoreQueries().count()).toBe(fetches + 1);
      expect(scoreQueries().mostRecent().args[0]).toEqual({
        variables: { questionnaireId: 'q-1' },
        fetchPolicy: 'network-only',
      });
    });

    it('keeps the score for other changes of the questionnaire', () => {
      setUp();
      const fetches = scoreQueries().count();

      update({ name: 'Renamed' });

      expect(scoreQueries().count()).toBe(fetches);
    });
  });
});
