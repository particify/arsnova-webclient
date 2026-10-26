import { Type } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  tick,
} from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentFocusState } from '@app/core/models/events/remote/content-focus-state';
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
  CreatorQuestionnaireContentUpdatedGql,
  QuestionnairePublishedContentsByQuestionnaireIdGql,
  QuestionnairePublishingMode,
  QuestionnaireType,
  QuestionnaireUpdatedGql,
  RoomUserAliasByRoomIdGql,
  UserUiSettings,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import {
  BehaviorSubject,
  NEVER,
  Observable,
  Subject,
  map,
  of,
  throwError,
} from 'rxjs';
import { QuestionnairePageComponent } from './questionnaire-page.component';

// Any result other than unanswered counts as answered.
const Answered = AnswerResultState.Neutral;
const Unanswered = AnswerResultState.Unanswered;

describe('QuestionnairePageComponent', () => {
  let fixture: ComponentFixture<QuestionnairePageComponent>;
  let component: QuestionnairePageComponent;
  let focusModeEnabled$: BehaviorSubject<boolean>;
  let contentState$: Subject<ContentFocusState>;
  let contents$: Subject<unknown>;

  const contents = ['c-1', 'c-2', 'c-3'].map(
    (id, position) => ({ id, position }) as Content
  );

  function questionnaireResult(id: string) {
    return {
      data: {
        questionnaireById: {
          id,
          published: true,
          publishingMode: QuestionnairePublishingMode.All,
          contentCount: contents.length,
        },
      },
    };
  }

  function spyProvider(token: Type<unknown>, methods: string[]) {
    return {
      provide: token,
      useValue: jasmine.createSpyObj(token.name, methods),
    };
  }

  let contentUpdated: jasmine.SpyObj<QuestionnaireContentUpdatedGql>;
  let creatorContentUpdated: jasmine.SpyObj<CreatorQuestionnaireContentUpdatedGql>;

  function setUp(focusModeEnabled = true) {
    // The page's child components are irrelevant to the focus logic here.
    TestBed.overrideComponent(QuestionnairePageComponent, {
      set: { template: '', imports: [] },
    });
    focusModeEnabled$ = new BehaviorSubject(focusModeEnabled);
    contentState$ = new Subject();
    contents$ = new Subject();
    const focusModeService = jasmine.createSpyObj('FocusModeService', [
      'getFocusModeEnabled',
      'getContentState',
    ]);
    focusModeService.getFocusModeEnabled.and.returnValue(focusModeEnabled$);
    focusModeService.getContentState.and.returnValue(contentState$);
    const questionnaireById = jasmine.createSpyObj('QuestionnaireByIdGql', [
      'watch',
    ]);
    questionnaireById.watch.and.callFake(
      ({ variables }: { variables: { id: string } }) => ({
        valueChanges: of(questionnaireResult(variables.id)),
      })
    );
    const contentsGql = jasmine.createSpyObj('ContentsGql', ['watch']);
    contentsGql.watch.and.returnValue({ valueChanges: contents$ });
    const answerResultsGql = jasmine.createSpyObj('AnswerResultsGql', [
      'watch',
    ]);
    answerResultsGql.watch.and.returnValue({ valueChanges: NEVER });
    const subscriptionGql = (name: string) => {
      const gql = jasmine.createSpyObj(name, ['subscribe']);
      gql.subscribe.and.returnValue(NEVER);
      return gql;
    };
    const authenticationService = jasmine.createSpyObj(
      'AuthenticationService',
      ['getCurrentAuthentication']
    );
    authenticationService.getCurrentAuthentication.and.returnValue(
      of({ userId: 'user-1' })
    );

    contentUpdated = subscriptionGql('QuestionnaireContentUpdatedGql');
    creatorContentUpdated = subscriptionGql(
      'CreatorQuestionnaireContentUpdatedGql'
    );
    configureTestModule(
      [getTranslocoModule(), QuestionnairePageComponent],
      [
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
          useValue: contentUpdated,
        },
        {
          provide: CreatorQuestionnaireContentUpdatedGql,
          useValue: creatorContentUpdated,
        },
        { provide: AuthenticationService, useValue: authenticationService },
        spyProvider(AnnounceService, ['announce']),
        spyProvider(ContentCarouselService, ['isLastContentAnswered']),
        spyProvider(NotificationService, ['show']),
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(QuestionnairePageComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('questionnaireId', 'q-1');
    fixture.componentRef.setInput('shortId', '12345678');
    fixture.componentRef.setInput('roomId', 'room-1');
    fixture.componentRef.setInput('settings', {} as UserUiSettings);
    fixture.componentRef.setInput('language', 'en');
    spyOn(component, 'initStepper');
    spyOn(component, 'goToContent');
    fixture.detectChanges();
  }

  function emitContents() {
    contents$.next({
      dataState: 'complete',
      data: {
        questionnairePublishedContentsByQuestionnaireId: {
          edges: contents.map((node) => ({ node })),
        },
      },
    });
    fixture.detectChanges();
  }

  function focusOn(questionnaireId: string, contentId: string) {
    contentState$.next(
      new ContentFocusState(contentId, 0, questionnaireId, 'Questionnaire')
    );
    fixture.detectChanges();
  }

  it('enters the stepper at the focused content', () => {
    setUp();
    emitContents();

    focusOn('q-1', 'c-3');

    expect(component.initStepper).toHaveBeenCalledWith(2);
    expect(component.goToContent).not.toHaveBeenCalled();
  });

  it('follows a focus change once the stepper has started', () => {
    setUp();
    emitContents();
    component.started = true;
    component.currentStep = 0;

    focusOn('q-1', 'c-2');

    expect(component.goToContent).toHaveBeenCalledWith(1);
  });

  it('follows a focus change that arrived before the contents', () => {
    setUp();
    focusOn('q-1', 'c-3');
    expect(component.initStepper).not.toHaveBeenCalled();

    emitContents();

    expect(component.initStepper).toHaveBeenCalledWith(2);
  });

  it('ignores the focus on another questionnaire', () => {
    setUp();
    emitContents();

    focusOn('q-2', 'c-3');

    expect(component.initStepper).not.toHaveBeenCalled();
    expect(component.goToContent).not.toHaveBeenCalled();
  });

  it('ignores content focus while focus mode is disabled', () => {
    setUp(false);
    emitContents();

    focusOn('q-1', 'c-3');

    expect(component.initStepper).not.toHaveBeenCalled();
    expect(component.goToContent).not.toHaveBeenCalled();
  });

  it('starts over when the reused page switches to another questionnaire', () => {
    setUp(false);
    component.started = true;

    fixture.componentRef.setInput('questionnaireId', 'q-2');
    fixture.detectChanges();

    expect(component.started).toBeFalse();
  });

  it('follows the answer counts through the content updates for everyone', () => {
    setUp();

    expect(contentUpdated.subscribe).toHaveBeenCalledOnceWith({
      variables: { questionnaireId: 'q-1' },
    });
    expect(creatorContentUpdated.subscribe).not.toHaveBeenCalled();
  });
});

describe('QuestionnairePageComponent (live sync)', () => {
  let fixture: ComponentFixture<QuestionnairePageComponent>;
  let component: QuestionnairePageComponent;
  let questionnaire$: BehaviorSubject<Questionnaire>;
  let contentsGql: jasmine.SpyObj<{ watch: unknown }>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let snackBarAction$: Subject<void>;
  let router: Router;
  let aliasGql: jasmine.SpyObj<{ watch: unknown }>;

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

  function contentsResponse(listed = contents) {
    return {
      dataState: 'complete',
      data: {
        questionnairePublishedContentsByQuestionnaireId: {
          edges: listed.map((node) => ({ node })),
        },
      },
    };
  }

  function setUp(
    initial: Questionnaire,
    results: AnswerResultState[] = contents.map(
      () => AnswerResultState.Unanswered
    ),
    contentId?: string,
    options: {
      contents$?: Observable<unknown>;
      enterForReal?: boolean;
      questionnaireChanges$?: Observable<unknown>;
      answerResults$?: Observable<unknown>;
      focusState$?: Observable<unknown>;
    } = {}
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
      valueChanges:
        options.questionnaireChanges$ ??
        questionnaire$.pipe(map((q) => ({ data: { questionnaireById: q } }))),
    });
    contentsGql = jasmine.createSpyObj('ContentsGql', ['watch']);
    (contentsGql.watch as jasmine.Spy).and.returnValue({
      valueChanges: options.contents$ ?? of(contentsResponse()),
    });
    const answerResultsGql = jasmine.createSpyObj('AnswerResultsGql', [
      'watch',
    ]);
    const resultsResponse = {
      dataState: 'complete',
      data: {
        questionnaireContentAnswerResultsByQuestionnaireId: results.map(
          (result, i) => ({ contentId: contents[i].id, result })
        ),
      },
    };
    answerResultsGql.watch.and.returnValue({
      valueChanges: options.answerResults$ ?? of(resultsResponse),
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
    focusModeService.getFocusModeEnabled.and.returnValue(
      of(!!options.focusState$)
    );
    focusModeService.getContentState.and.returnValue(
      options.focusState$ ?? NEVER
    );
    const authenticationService = jasmine.createSpyObj(
      'AuthenticationService',
      ['getCurrentAuthentication']
    );
    authenticationService.getCurrentAuthentication.and.returnValue(
      of({ userId: 'user-1' })
    );
    aliasGql = jasmine.createSpyObj('RoomUserAliasByRoomIdGql', ['watch']);
    (aliasGql.watch as jasmine.Spy).and.returnValue({
      valueChanges: of({
        dataState: 'complete',
        data: {
          roomUserAliasByRoomId: {
            __typename: 'RoomUserAlias',
            id: null,
            alias: 'Brave Otter',
            seed: 42,
          },
        },
      }),
    });
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
        { provide: RoomUserAliasByRoomIdGql, useValue: aliasGql },
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
    (component as unknown as { stepper: () => object }).stepper = () => ({
      init: () => {},
    });
    fixture.componentRef.setInput('questionnaireId', 'q-1');
    fixture.componentRef.setInput('shortId', '12345678');
    fixture.componentRef.setInput('roomId', 'room-1');
    fixture.componentRef.setInput('settings', {} as UserUiSettings);
    fixture.componentRef.setInput('language', 'en');
    fixture.componentRef.setInput('contentId', contentId);
    if (options.enterForReal) {
      spyOn(component, 'initStepper').and.callThrough();
    } else {
      spyOn(component, 'initStepper').and.callFake((index: number) => {
        component.currentStep = index;
        component.started = true;
      });
    }
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

  it('pulls a participant who navigated away back to a restarted round', () => {
    setUp(
      questionnaire({ activeRound: activeRound('c-0') } as never),
      undefined,
      'c-0'
    );
    component.currentStep = 2;

    update(questionnaire({ activeRound: activeRound('c-0', true) } as never));
    expect(component.goToContent).not.toHaveBeenCalled();

    update(questionnaire({ activeRound: activeRound('c-0') } as never));
    expect(component.goToContent).toHaveBeenCalledOnceWith(0);
  });

  it('enters a late joiner at the running content when the contents load last', fakeAsync(() => {
    const contents$ = new Subject<unknown>();
    setUp(
      questionnaire({ activeRound: activeRound('c-1') } as never),
      undefined,
      'c-0',
      { contents$, enterForReal: true }
    );
    tick();

    contents$.next(contentsResponse());
    fixture.detectChanges();
    tick();

    expect(router.navigate).toHaveBeenCalledWith(
      ['p', '12345678', 'questionnaire', 'q-1', 'c-1'],
      { replaceUrl: true }
    );
    flush();
    expect(component.currentStep).toBe(1);
  }));

  it('leaves a participant who navigated away alone while the round runs', () => {
    setUp(
      questionnaire({ activeRound: activeRound('c-0') } as never),
      undefined,
      'c-0'
    );
    component.currentStep = 2;

    update(
      questionnaire({
        activeRound: activeRound('c-0'),
        name: 'Renamed',
      } as never)
    );

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

  it('keeps the stepper for a focused content until the contents list it', () => {
    const contents$ = new BehaviorSubject<unknown>(
      contentsResponse(contents.slice(0, 2))
    );
    const focusState$ = new Subject<unknown>();
    setUp(
      questionnaire({
        publishedUpToContent: { id: 'c-1', position: 1 },
      } as never),
      undefined,
      'c-1',
      { contents$, focusState$ }
    );
    expect(component.currentIndex()).toBe(1);

    // The focus mode navigates before the released contents arrive.
    fixture.componentRef.setInput('contentId', 'c-2');
    focusState$.next({ contentGroupId: 'q-1', contentId: 'c-2' });
    update(
      questionnaire({
        publishedUpToContent: { id: 'c-2', position: 2 },
      } as never)
    );
    expect(component.currentIndex()).toBe(1);
    expect(component.goToContent).not.toHaveBeenCalled();

    contents$.next(contentsResponse());
    fixture.detectChanges();

    expect(component.currentIndex()).toBe(2);
    expect(component.goToContent).toHaveBeenCalledWith(2);
  });

  it('shows the series overview when routed to a content not listed on entry', () => {
    setUp(questionnaire(), undefined, 'c-unknown');

    expect(component.currentIndex()).toBe(-1);
  });

  it('stays readable when the questionnaire query fails', () => {
    spyOn(console, 'error');
    setUp(questionnaire(), undefined, undefined, {
      questionnaireChanges$: throwError(() => new Error('Query failed')),
    });

    expect(() => component.questionnaire()).not.toThrow();
    expect(component.questionnaire()).toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });

  it('stays readable when the contents and answer results queries fail', () => {
    spyOn(console, 'error');
    const failure = throwError(() => new Error('Query failed'));
    setUp(questionnaire(), undefined, undefined, {
      contents$: failure,
      answerResults$: failure,
    });

    expect(() => component.contents()).not.toThrow();
    expect(() => component.answerResults()).not.toThrow();
    expect(component.loadingContents()).toBeTrue();
    expect(console.error).toHaveBeenCalledTimes(2);
  });

  it('enters with fewer answer results than contents', () => {
    setUp(questionnaire({ publishingMode: QuestionnairePublishingMode.All }), [
      Answered,
    ]);

    expect(component['getFirstUnansweredContentIndex']()).toBeUndefined();
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

  describe('room user alias', () => {
    it('looks up no alias without a leaderboard', () => {
      setUp(questionnaire());
      expect(aliasGql.watch).not.toHaveBeenCalled();
      expect(component.alias()).toBeUndefined();
    });

    it('offers the alias of the room once the leaderboard is enabled', () => {
      setUp(questionnaire());
      update(questionnaire({ leaderboardEnabled: true }));
      expect(aliasGql.watch).toHaveBeenCalledOnceWith({
        variables: { roomId: 'room-1' },
      });
      expect(component.alias()).toEqual(
        jasmine.objectContaining({ id: null, alias: 'Brave Otter', seed: 42 })
      );
    });

    it('does not look the alias up again for an unrelated change', () => {
      setUp(questionnaire({ leaderboardEnabled: true }));
      update(
        questionnaire({
          leaderboardEnabled: true,
          publishedUpToContent: { id: 'c-1', position: 1 },
        } as never)
      );
      expect(aliasGql.watch).toHaveBeenCalledTimes(1);
    });

    it('stays readable when the alias query fails', () => {
      setUp(questionnaire());
      spyOn(console, 'error');
      (aliasGql.watch as jasmine.Spy).and.returnValue({
        valueChanges: new Observable((subscriber) =>
          subscriber.error(new Error('Query failed'))
        ),
      });

      update(questionnaire({ leaderboardEnabled: true }));

      expect(() => component.alias()).not.toThrow();
      expect(component.alias()).toBeUndefined();
      expect(console.error).toHaveBeenCalled();
    });
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
