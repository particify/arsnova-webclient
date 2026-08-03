import { Type } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  tick,
} from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { ContentCarouselService } from '@app/core/services/util/content-carousel.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { FocusModeService } from '@app/participant/_services/focus-mode.service';
import {
  AnswerResultState,
  Content,
  ContentType,
  Questionnaire,
  QuestionnaireByIdGql,
  QuestionnaireContentAnswerResultsByQuestionnaireIdGql,
  QuestionnaireContentUpdatedGql,
  QuestionnairePublishedContentsByQuestionnaireIdGql,
  QuestionnairePublishingMode,
  QuestionnaireType,
  QuestionnaireUpdatedGql,
  UserUiSettings,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { BehaviorSubject, NEVER, Subject, map, of } from 'rxjs';
import { QuestionnairePageComponent } from './questionnaire-page.component';

// Any result other than unanswered counts as answered.
const Answered = AnswerResultState.Neutral;
const Unanswered = AnswerResultState.Unanswered;

describe('QuestionnairePageComponent (live sync)', () => {
  let fixture: ComponentFixture<QuestionnairePageComponent>;
  let component: QuestionnairePageComponent;
  let questionnaire$: BehaviorSubject<Questionnaire>;
  let contentsGql: jasmine.SpyObj<{ watch: unknown }>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let snackBarAction$: Subject<void>;
  let router: Router;

  const contents = ['c-0', 'c-1', 'c-2'].map(
    (id, position) =>
      ({ id, position, formatData: { format: ContentType.Choice } }) as Content
  );

  function questionnaire(overrides: Partial<Questionnaire> = {}) {
    return {
      id: 'q-1',
      published: true,
      publishingMode: QuestionnairePublishingMode.Live,
      publishedUpToContent: { id: 'c-0', position: 0 },
      contentCount: contents.length,
      ...overrides,
    } as Questionnaire;
  }

  function activeRound(contentId: string, closed = false) {
    return { id: `round-${contentId}`, contentId, closed };
  }

  function spyProvider(token: Type<unknown>, methods: string[]) {
    return {
      provide: token,
      useValue: jasmine.createSpyObj(token.name, methods),
    };
  }

  function setUp(
    initial: Questionnaire,
    results: AnswerResultState[] = contents.map(
      () => AnswerResultState.Unanswered
    ),
    contentId?: string
  ) {
    // The page's child components are irrelevant to the sync logic here.
    TestBed.overrideComponent(QuestionnairePageComponent, {
      set: { template: '', imports: [] },
    });
    questionnaire$ = new BehaviorSubject(initial);
    const questionnaireById = jasmine.createSpyObj('QuestionnaireByIdGql', [
      'watch',
    ]);
    questionnaireById.watch.and.returnValue({
      valueChanges: questionnaire$.pipe(
        map((q) => ({ data: { questionnaireById: q } }))
      ),
    });
    contentsGql = jasmine.createSpyObj('ContentsGql', ['watch']);
    (contentsGql.watch as jasmine.Spy).and.returnValue({
      valueChanges: of({
        dataState: 'complete',
        data: {
          questionnairePublishedContentsByQuestionnaireId: {
            edges: contents.map((node) => ({ node })),
          },
        },
      }),
    });
    const answerResultsGql = jasmine.createSpyObj('AnswerResultsGql', [
      'watch',
    ]);
    answerResultsGql.watch.and.returnValue({
      valueChanges: of({
        dataState: 'complete',
        data: {
          questionnaireContentAnswerResultsByQuestionnaireId: results.map(
            (result, i) => ({ contentId: contents[i].id, result })
          ),
        },
      }),
    });
    const subscriptionGql = (name: string) => {
      const gql = jasmine.createSpyObj(name, ['subscribe']);
      gql.subscribe.and.returnValue(NEVER);
      return gql;
    };
    const focusModeService = jasmine.createSpyObj('FocusModeService', [
      'getFocusModeEnabled',
      'getContentState',
    ]);
    focusModeService.getFocusModeEnabled.and.returnValue(of(false));
    focusModeService.getContentState.and.returnValue(NEVER);
    const authenticationService = jasmine.createSpyObj(
      'AuthenticationService',
      ['getCurrentAuthentication']
    );
    authenticationService.getCurrentAuthentication.and.returnValue(
      of({ userId: 'user-1' })
    );
    snackBarAction$ = new Subject();
    notificationService = jasmine.createSpyObj('NotificationService', ['show']);
    notificationService.show.and.returnValue({
      onAction: () => snackBarAction$,
    } as never);

    configureTestModule(
      [getTranslocoModule(), QuestionnairePageComponent],
      [
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } },
        { provide: FocusModeService, useValue: focusModeService },
        { provide: QuestionnaireByIdGql, useValue: questionnaireById },
        {
          provide: QuestionnairePublishedContentsByQuestionnaireIdGql,
          useValue: contentsGql,
        },
        {
          provide: QuestionnaireContentAnswerResultsByQuestionnaireIdGql,
          useValue: answerResultsGql,
        },
        {
          provide: QuestionnaireUpdatedGql,
          useValue: subscriptionGql('QuestionnaireUpdatedGql'),
        },
        {
          provide: QuestionnaireContentUpdatedGql,
          useValue: subscriptionGql('QuestionnaireContentUpdatedGql'),
        },
        { provide: AuthenticationService, useValue: authenticationService },
        { provide: NotificationService, useValue: notificationService },
        spyProvider(AnnounceService, ['announce']),
        spyProvider(ContentCarouselService, ['isLastContentAnswered']),
      ]
    ).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(QuestionnairePageComponent);
    component = fixture.componentInstance;
    // A stepper is required for following the live content; its own
    // behaviour is covered by its spec.
    (component as unknown as { stepper: () => object }).stepper = () => ({});
    fixture.componentRef.setInput('questionnaireId', 'q-1');
    fixture.componentRef.setInput('shortId', '12345678');
    fixture.componentRef.setInput('roomId', 'room-1');
    fixture.componentRef.setInput('settings', {} as UserUiSettings);
    fixture.componentRef.setInput('language', 'en');
    fixture.componentRef.setInput('contentId', contentId);
    spyOn(component, 'initStepper').and.callFake((index: number) => {
      component.currentStep = index;
      component.started = true;
    });
    spyOn(component, 'goToContent');
    fixture.detectChanges();
  }

  function update(q: Questionnaire) {
    questionnaire$.next(q);
    fixture.detectChanges();
  }

  it('enters a live questionnaire at the running content', () => {
    setUp(questionnaire({ activeRound: activeRound('c-1') } as never));

    expect(component.initStepper).toHaveBeenCalledWith(1);
    expect(router.navigate).toHaveBeenCalledWith(
      ['p', '12345678', 'questionnaire', 'q-1', 'c-1'],
      { replaceUrl: true }
    );
  });

  it('follows the content started next', () => {
    setUp(
      questionnaire({ activeRound: activeRound('c-0') } as never),
      undefined,
      'c-0'
    );

    update(
      questionnaire({
        activeRound: activeRound('c-2'),
        publishedUpToContent: { id: 'c-2', position: 2 },
      } as never)
    );

    expect(component.goToContent).toHaveBeenCalledWith(2);
  });

  it('stays on the content when the running round is closed', () => {
    setUp(
      questionnaire({ activeRound: activeRound('c-0') } as never),
      undefined,
      'c-0'
    );

    update(questionnaire({ activeRound: activeRound('c-0', true) } as never));

    expect(component.goToContent).not.toHaveBeenCalled();
  });

  it('reloads the published contents when the published range changes', () => {
    setUp(questionnaire({ activeRound: activeRound('c-0') } as never));
    const loads = (contentsGql.watch as jasmine.Spy).calls.count();

    update(
      questionnaire({
        activeRound: activeRound('c-0'),
        publishedUpToContent: { id: 'c-1', position: 1 },
      } as never)
    );

    expect((contentsGql.watch as jasmine.Spy).calls.count()).toBe(loads + 1);
  });

  it('reloads the contents once the correct answers are published', () => {
    setUp(questionnaire({ activeRound: activeRound('c-0') } as never));
    const loads = (contentsGql.watch as jasmine.Spy).calls.count();

    update(
      questionnaire({
        activeRound: activeRound('c-0'),
        correctOptionsPublished: true,
      } as never)
    );

    expect((contentsGql.watch as jasmine.Spy).calls.count()).toBe(loads + 1);
  });

  it('does not reload the contents for an unrelated change', () => {
    setUp(questionnaire({ activeRound: activeRound('c-0') } as never));
    const loads = (contentsGql.watch as jasmine.Spy).calls.count();

    update(
      questionnaire({
        activeRound: activeRound('c-0'),
        name: 'Renamed',
      } as never)
    );

    expect((contentsGql.watch as jasmine.Spy).calls.count()).toBe(loads);
  });

  it('offers a released content of a range-published questionnaire', () => {
    const upTo = (id: string, position: number) =>
      questionnaire({
        publishingMode: QuestionnairePublishingMode.UpTo,
        publishedUpToContent: { id, position },
      } as never);
    setUp(upTo('c-0', 0), [
      AnswerResultState.Neutral,
      AnswerResultState.Neutral,
      AnswerResultState.Neutral,
    ]);
    component.started = true;

    update(upTo('c-1', 1));
    expect(notificationService.show).toHaveBeenCalled();
    expect(component.goToContent).not.toHaveBeenCalled();

    snackBarAction$.next();

    expect(component.goToContent).toHaveBeenCalledWith(1);
  });
});

describe('QuestionnairePageComponent (auto-advance)', () => {
  let fixture: ComponentFixture<QuestionnairePageComponent>;
  let component: QuestionnairePageComponent;
  let results$: BehaviorSubject<unknown>;

  const contents = ['c-0', 'c-1', 'c-2', 'c-3', 'c-4'].map(
    (id, position) =>
      ({ id, position, formatData: { format: ContentType.Choice } }) as Content
  );

  function resultsResponse(results: AnswerResultState[]) {
    return {
      dataState: 'complete',
      data: {
        questionnaireContentAnswerResultsByQuestionnaireId: results.map(
          (result, i) => ({ contentId: contents[i].id, result })
        ),
      },
    };
  }

  function spyProvider(token: Type<unknown>, methods: string[]) {
    return {
      provide: token,
      useValue: jasmine.createSpyObj(token.name, methods),
    };
  }

  function setUp(results: AnswerResultState[]) {
    // The page's child components are irrelevant to where answering leads.
    TestBed.overrideComponent(QuestionnairePageComponent, {
      set: { template: '', imports: [] },
    });
    const questionnaireById = jasmine.createSpyObj('QuestionnaireByIdGql', [
      'watch',
    ]);
    questionnaireById.watch.and.returnValue({
      valueChanges: of({
        data: {
          questionnaireById: {
            id: 'q-1',
            type: QuestionnaireType.Survey,
            published: true,
            publishingMode: QuestionnairePublishingMode.All,
            contentCount: contents.length,
          } as Questionnaire,
        },
      }),
    });
    const subscriptionGql = (name: string) => {
      const gql = jasmine.createSpyObj(name, ['subscribe']);
      gql.subscribe.and.returnValue(NEVER);
      return gql;
    };
    const contentsGql = jasmine.createSpyObj('ContentsGql', ['watch']);
    contentsGql.watch.and.returnValue({
      valueChanges: of({
        dataState: 'complete',
        data: {
          questionnairePublishedContentsByQuestionnaireId: {
            edges: contents.map((node) => ({ node })),
          },
        },
      }),
    });
    results$ = new BehaviorSubject<unknown>(resultsResponse(results));
    const answerResultsGql = jasmine.createSpyObj('AnswerResultsGql', [
      'watch',
    ]);
    answerResultsGql.watch.and.returnValue({ valueChanges: results$ });
    const focusModeService = jasmine.createSpyObj('FocusModeService', [
      'getFocusModeEnabled',
      'getContentState',
    ]);
    focusModeService.getFocusModeEnabled.and.returnValue(of(false));
    focusModeService.getContentState.and.returnValue(NEVER);
    const authenticationService = jasmine.createSpyObj(
      'AuthenticationService',
      ['getCurrentAuthentication']
    );
    authenticationService.getCurrentAuthentication.and.returnValue(
      of({ userId: 'user-1' })
    );
    const contentCarouselService = jasmine.createSpyObj(
      'ContentCarouselService',
      ['isLastContentAnswered']
    );
    contentCarouselService.isLastContentAnswered.and.returnValue(false);

    configureTestModule(
      [getTranslocoModule(), QuestionnairePageComponent],
      [
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } },
        { provide: AuthenticationService, useValue: authenticationService },
        { provide: ContentCarouselService, useValue: contentCarouselService },
        { provide: FocusModeService, useValue: focusModeService },
        { provide: QuestionnaireByIdGql, useValue: questionnaireById },
        {
          provide: QuestionnairePublishedContentsByQuestionnaireIdGql,
          useValue: contentsGql,
        },
        {
          provide: QuestionnaireContentAnswerResultsByQuestionnaireIdGql,
          useValue: answerResultsGql,
        },
        {
          provide: QuestionnaireUpdatedGql,
          useValue: subscriptionGql('QuestionnaireUpdatedGql'),
        },
        {
          provide: QuestionnaireContentUpdatedGql,
          useValue: subscriptionGql('QuestionnaireContentUpdatedGql'),
        },
        spyProvider(AnnounceService, ['announce']),
        spyProvider(NotificationService, ['show']),
        spyProvider(Router, ['navigate']),
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(QuestionnairePageComponent);
    component = fixture.componentInstance;
    spyOn(component, 'goToContent');
    spyOn(component, 'goToOverview');
    fixture.componentRef.setInput('questionnaireId', 'q-1');
    fixture.componentRef.setInput('shortId', '12345678');
    fixture.componentRef.setInput('roomId', 'room-1');
    fixture.componentRef.setInput('settings', {} as UserUiSettings);
    fixture.componentRef.setInput('language', 'en');
    fixture.detectChanges();
    // Starting the stepper is deferred.
    tick();
  }

  function answer(results: AnswerResultState[]) {
    results$.next(resultsResponse(results));
    fixture.detectChanges();
    tick(1000);
  }

  it('advances to the next content after answering one before an answered last one', fakeAsync(() => {
    setUp([Unanswered, Unanswered, Unanswered, Unanswered, Answered]);

    answer([Answered, Unanswered, Unanswered, Unanswered, Answered]);

    expect(component.goToContent).toHaveBeenCalledOnceWith(1);
    expect(component.goToOverview).not.toHaveBeenCalled();
    flush();
  }));

  it('skips contents that have already been answered', fakeAsync(() => {
    setUp([Unanswered, Answered, Unanswered, Unanswered, Answered]);

    answer([Answered, Answered, Unanswered, Unanswered, Answered]);

    expect(component.goToContent).toHaveBeenCalledOnceWith(2);
    expect(component.goToOverview).not.toHaveBeenCalled();
    flush();
  }));

  it('opens the overview once no unanswered content follows', fakeAsync(() => {
    setUp([Answered, Answered, Answered, Unanswered, Answered]);

    answer([Answered, Answered, Answered, Answered, Answered]);

    expect(component.goToOverview).toHaveBeenCalledTimes(1);
    expect(component.goToContent).not.toHaveBeenCalled();
    flush();
  }));
});
