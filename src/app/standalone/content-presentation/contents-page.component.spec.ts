import { failedOperation } from '@testing/graphql-fixtures';
import { signal, Type } from '@angular/core';
import { InMemoryCache } from '@apollo/client';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from '@app/core/services/util/dialog.service';
import { EventService } from '@app/core/services/util/event.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { ContentPresentationService } from '@app/presentation/content-presentation.service';
import {
  Content,
  ContentType,
  PublishQuestionnaireUpToContentGql,
  Questionnaire,
  QuestionnaireByIdGql,
  QuestionnaireContentUpdatedGql,
  QuestionnaireContentsByQuestionnaireIdGql,
  QuestionnairePublishingMode,
  StartQuestionnaireContentDocument,
  StartQuestionnaireContentGql,
  StopQuestionnaireContentGql,
  UserUiSettings,
} from '@gql/generated/graphql';
import { ServerTimeService } from '@app/core/services/util/server-time.service';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { BehaviorSubject, NEVER, of } from 'rxjs';
import { ContentsPageComponent } from './contents-page.component';

describe('ContentsPageComponent', () => {
  let fixture: ComponentFixture<ContentsPageComponent>;
  let component: ContentsPageComponent;
  let gql: Map<Type<unknown>, jasmine.Spy>;
  let contentUpdated: jasmine.SpyObj<QuestionnaireContentUpdatedGql>;

  const contents = ['c-0', 'c-1', 'c-2'].map(
    (id, position) =>
      ({ id, position, formatData: { format: ContentType.Choice } }) as Content
  );

  let contents$: BehaviorSubject<unknown>;

  function contentsResult(loading: boolean) {
    return {
      loading,
      data: {
        questionnaireContentsByQuestionnaireId: {
          edges: contents.map((node) => ({ node })),
        },
      },
    };
  }

  function questionnaire(overrides: Partial<Questionnaire> = {}) {
    return {
      id: 'q-1',
      name: 'Quiz',
      published: true,
      publishingMode: QuestionnairePublishingMode.Live,
      publishedUpToContent: { id: 'c-0', position: 0 },
      ...overrides,
    } as Questionnaire;
  }

  function mutationSpy(token: Type<unknown>) {
    const spy = jasmine.createSpyObj(token.name, ['mutate']);
    spy.mutate.and.returnValue(of({ data: {} }));
    gql.set(token, spy.mutate);
    return { provide: token, useValue: spy };
  }

  function variables(token: Type<unknown>) {
    return gql.get(token)!.calls.mostRecent().args[0].variables;
  }

  function setUp(q = questionnaire()) {
    // Navigation and publishing are tested here; the stepper has its own specs.
    TestBed.overrideComponent(ContentsPageComponent, {
      set: { template: '', imports: [] },
    });
    gql = new Map();
    const questionnaireById = jasmine.createSpyObj('QuestionnaireByIdGql', [
      'watch',
    ]);
    questionnaireById.watch.and.returnValue({
      valueChanges: of({ data: { questionnaireById: q } }),
    });
    const contentsGql = jasmine.createSpyObj('ContentsGql', ['watch']);
    contents$ = new BehaviorSubject<unknown>(contentsResult(false));
    contentsGql.watch.and.returnValue({ valueChanges: contents$ });
    contentUpdated = jasmine.createSpyObj('QuestionnaireContentUpdatedGql', [
      'subscribe',
    ]);
    contentUpdated.subscribe.and.returnValue(of({ data: undefined }));
    const presentationService = jasmine.createSpyObj('PresentationService', [
      'getScale',
      'getStepState',
      'updateContentState',
      'updateLeaderboardDisplayed',
    ]);

    configureTestModule(
      [getTranslocoModule(), ContentsPageComponent],
      [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParams: {} } },
        },
        { provide: QuestionnaireByIdGql, useValue: questionnaireById },
        {
          provide: QuestionnaireContentsByQuestionnaireIdGql,
          useValue: contentsGql,
        },
        { provide: QuestionnaireContentUpdatedGql, useValue: contentUpdated },
        { provide: PresentationService, useValue: presentationService },
        {
          provide: FocusModeService,
          useValue: jasmine.createSpyObj('FocusModeService', [
            'updateContentState',
          ]),
        },
        {
          provide: GlobalStorageService,
          useValue: jasmine.createSpyObj('GlobalStorageService', [
            'getItem',
            'setItem',
          ]),
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', [
            'showAdvanced',
          ]),
        },
        mutationSpy(PublishQuestionnaireUpToContentGql),
        mutationSpy(StartQuestionnaireContentGql),
        mutationSpy(StopQuestionnaireContentGql),
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(ContentsPageComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('questionnaireId', 'q-1');
    fixture.componentRef.setInput('settings', {} as UserUiSettings);
    fixture.componentRef.setInput('language', 'en');
    fixture.detectChanges();
  }

  it('starts the content on display', () => {
    setUp();
    component.updateURL(1);

    component.startContent();

    expect(variables(StartQuestionnaireContentGql)).toEqual({
      contentId: 'c-1',
    });
  });

  it('reports a content that failed to start', () => {
    setUp();
    gql.get(StartQuestionnaireContentGql)!.and.returnValue(failedOperation());

    component.startContent();

    expect(
      TestBed.inject(NotificationService).showAdvanced
    ).toHaveBeenCalledOnceWith(
      jasmine.any(String),
      AdvancedSnackBarTypes.FAILED
    );
  });

  describe('the started round', () => {
    it('leaves the started flag to the mutation result rather than patching the cache', () => {
      setUp();

      component.startContent();

      const mutate = gql.get(StartQuestionnaireContentGql)!;
      expect(mutate.calls.mostRecent().args[0].update).toBeUndefined();
    });

    it('marks the opened round as started from the start response, so the content does not wait again once left', () => {
      const cache = new InMemoryCache();

      cache.write({
        dataId: 'ROOT_MUTATION',
        query: StartQuestionnaireContentDocument,
        variables: { contentId: 'c-1' },
        result: {
          startQuestionnaireContent: {
            __typename: 'Questionnaire',
            id: 'q-1',
            activeRound: {
              __typename: 'Round',
              id: 'r-1',
              roundNo: 1,
              closed: false,
              started: true,
            },
          },
        },
      });

      expect(cache.extract()['Round:r-1']?.['started']).toBeTrue();
    });
  });

  it('keeps the contents on screen while they are reloaded', () => {
    setUp();
    expect(component.loading()).toBeFalse();

    // A refetch reports its progress along with the contents it has.
    contents$.next(contentsResult(true));
    TestBed.tick();

    expect(component.loading()).toBeFalse();
    expect(component.contents().length).toBe(3);
  });

  it('shows the loading state until the contents have arrived', () => {
    setUp();

    contents$.next({ loading: true, data: undefined });
    TestBed.tick();

    expect(component.loading()).toBeTrue();
  });

  it('stops the running content of the questionnaire', () => {
    setUp();

    component.stopContent();

    expect(variables(StopQuestionnaireContentGql)).toEqual({
      questionnaireId: 'q-1',
    });
  });

  it('subscribes to the content updates of the questionnaire', () => {
    setUp();

    expect(contentUpdated.subscribe).toHaveBeenCalledOnceWith({
      variables: { questionnaireId: 'q-1' },
    });
  });

  it('publishes up to the content on display', () => {
    setUp();
    component.updateURL(2);
    gql.get(PublishQuestionnaireUpToContentGql)!.calls.reset();

    component.publishCurrentContent();

    expect(variables(PublishQuestionnaireUpToContentGql)).toEqual({
      questionnaireId: 'q-1',
      contentId: 'c-2',
    });
  });

  it('publishes a content of a live questionnaire once it is presented', () => {
    setUp();

    component.updateURL(1);

    expect(variables(PublishQuestionnaireUpToContentGql)).toEqual({
      questionnaireId: 'q-1',
      contentId: 'c-1',
    });
  });

  it('does not publish a content again that is already published', () => {
    setUp(
      questionnaire({
        publishedUpToContent: { id: 'c-2', position: 2 } as Content,
      })
    );

    component.updateURL(1);

    expect(gql.get(PublishQuestionnaireUpToContentGql)).not.toHaveBeenCalled();
  });

  it('leaves the publishing range alone outside live mode', () => {
    setUp(questionnaire({ publishingMode: QuestionnairePublishingMode.UpTo }));

    component.updateURL(1);

    expect(gql.get(PublishQuestionnaireUpToContentGql)).not.toHaveBeenCalled();
  });

  describe('countdown', () => {
    const now = new Date('2026-10-01T12:00:00Z');
    const round = (answeringEndTime?: string, answerable = true) => ({
      id: 'round-1',
      contentId: 'c-0',
      closed: false,
      answerable,
      answeringEndTime,
    });

    beforeEach(() => {
      jasmine.clock().install();
      jasmine.clock().mockDate(now);
    });

    afterEach(() => jasmine.clock().uninstall());

    it('counts down to the deadline of the presented content', () => {
      const deadline = '2026-10-01T12:00:30Z';
      contents[0].activeRound = round(deadline) as Content['activeRound'];
      setUp();

      expect(component.endDate()).toEqual(new Date(deadline));
      delete contents[0].activeRound;
    });

    it('knows a running round is not over yet', () => {
      setUp(
        questionnaire({
          activeRound: round('2026-10-01T12:00:30Z'),
        } as never)
      );

      expect(component.roundOver()).toBeFalse();
    });

    it('knows a round past its deadline is over', () => {
      setUp(
        questionnaire({
          activeRound: round('2026-10-01T11:59:59Z'),
        } as never)
      );

      expect(component.roundOver()).toBeTrue();
    });

    it('judges the deadline by server time, not by a skewed local clock', () => {
      // The local clock runs a minute ahead of the server.
      const serverTime = ServerTimeService.prototype;
      spyOnProperty(serverTime, 'averageOffset').and.returnValue(-60_000);
      setUp(
        questionnaire({
          activeRound: round('2026-10-01T11:59:30Z'),
        } as never)
      );

      expect(component.roundOver()).toBeFalse();
    });

    it('never considers a round over outside live mode', () => {
      setUp(
        questionnaire({
          publishingMode: QuestionnairePublishingMode.UpTo,
          activeRound: round('2026-10-01T11:59:59Z', false),
        } as never)
      );

      expect(component.roundOver()).toBeFalse();
    });
  });
});

describe('ContentsPageComponent (last visited questionnaire)', () => {
  let fixture: ComponentFixture<ContentsPageComponent>;
  let storage: Map<symbol, unknown>;

  function spyProvider(token: Type<unknown>, methods: string[]) {
    return {
      provide: token,
      useValue: jasmine.createSpyObj(token.name, methods),
    };
  }

  beforeEach(() => {
    // The stepper and the rest of the template are irrelevant here.
    TestBed.overrideComponent(ContentsPageComponent, {
      set: { template: '', imports: [] },
    });
    storage = new Map();
    const globalStorageService = jasmine.createSpyObj('GlobalStorageService', [
      'getItem',
      'setItem',
      'removeItem',
    ]);
    globalStorageService.getItem.and.callFake((key: symbol) =>
      storage.get(key)
    );
    globalStorageService.setItem.and.callFake((key: symbol, value: unknown) =>
      storage.set(key, value)
    );
    const questionnaireById = jasmine.createSpyObj('QuestionnaireByIdGql', [
      'watch',
    ]);
    questionnaireById.watch.and.returnValue({ valueChanges: NEVER });
    const contentUpdated = jasmine.createSpyObj(
      'QuestionnaireContentUpdatedGql',
      ['subscribe']
    );
    contentUpdated.subscribe.and.returnValue(NEVER);
    const contentPresentationService = jasmine.createSpyObj(
      'ContentPresentationService',
      ['setQuestionnaireId', 'setCurrentContentIndex'],
      {
        contents: signal([]),
        loadingContents: signal(false),
        currentContentIndex: signal(0),
        currentContent: signal(undefined),
      }
    );

    configureTestModule(
      [getTranslocoModule(), ContentsPageComponent],
      [
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } },
        { provide: GlobalStorageService, useValue: globalStorageService },
        { provide: QuestionnaireByIdGql, useValue: questionnaireById },
        { provide: QuestionnaireContentUpdatedGql, useValue: contentUpdated },
        {
          provide: ContentPresentationService,
          useValue: contentPresentationService,
        },
        {
          provide: PresentationService,
          useValue: { scale: signal(undefined) },
        },
        spyProvider(DialogService, ['openPublishGroupDialog']),
        spyProvider(FocusModeService, ['updateContentState']),
        spyProvider(NotificationService, ['showAdvanced']),
        spyProvider(Router, ['navigate']),
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(ContentsPageComponent);
    fixture.componentRef.setInput('settings', {} as UserUiSettings);
    fixture.componentRef.setInput('language', 'en');
  });

  function present(questionnaireId: string) {
    fixture.componentRef.setInput('questionnaireId', questionnaireId);
    fixture.detectChanges();
  }

  it('remembers the presented questionnaire', () => {
    present('q-1');

    expect(storage.get(STORAGE_KEYS.LAST_GROUP)).toBe('q-1');
  });

  it('remembers the questionnaire presented next over the previous one', () => {
    present('q-1');

    present('q-2');

    expect(storage.get(STORAGE_KEYS.LAST_GROUP)).toBe('q-2');
  });

  it('prefers the questionnaire of the route over a remembered one', () => {
    storage.set(STORAGE_KEYS.LAST_GROUP, 'q-1');

    present('q-2');

    expect(storage.get(STORAGE_KEYS.LAST_GROUP)).toBe('q-2');
  });

  it('stops following the control bar visibility once destroyed', () => {
    const eventService = TestBed.inject(EventService);
    present('q-1');
    eventService.broadcast('ControlBarVisible', false);
    expect(fixture.componentInstance.hideControlBar()).toBeTrue();

    fixture.destroy();
    eventService.broadcast('ControlBarVisible', true);

    expect(fixture.componentInstance.hideControlBar()).toBeTrue();
  });
});
