import { signal, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { NotificationService } from '@app/core/services/util/notification.service';
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
  StartQuestionnaireContentGql,
  StopQuestionnaireContentGql,
  UserUiSettings,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { NEVER, of } from 'rxjs';
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
    contentsGql.watch.and.returnValue({
      valueChanges: of({
        loading: false,
        data: {
          questionnaireContentsByQuestionnaireId: {
            edges: contents.map((node) => ({ node })),
          },
        },
      }),
    });
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

  describe('marking the started round', () => {
    function startWithRound(closed: boolean) {
      setUp();
      component.startContent();
      const cache = jasmine.createSpyObj('ApolloCache', ['identify', 'modify']);
      cache.identify.and.callFake(
        (o: { __typename: string; id: string }) => `${o.__typename}:${o.id}`
      );
      const mutate = gql.get(StartQuestionnaireContentGql)!;
      const { update } = mutate.calls.mostRecent().args[0];
      update(cache, {
        data: {
          startQuestionnaireContent: {
            id: 'q-1',
            activeRound: { id: 'r-1', roundNo: 1, closed },
          },
        },
      });
      return cache.modify;
    }

    it('marks the opened round as started, so the content does not wait again once left', () => {
      const modify = startWithRound(false);

      const { id, fields } = modify.calls.mostRecent().args[0];
      expect(id).toBe('Round:r-1');
      expect(fields.started(false)).toBeTrue();
    });

    it('leaves a round alone which did not open', () => {
      expect(startWithRound(true)).not.toHaveBeenCalled();
    });
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
});
