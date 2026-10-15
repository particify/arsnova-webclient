import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatMenuHarness } from '@angular/material/menu/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LiveFeedbackType } from '@app/core/models/live-feedback-type.enum';
import { Room } from '@app/core/models/room';
import { UserRole } from '@app/core/models/user-roles.enum';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { RoomSettingsService } from '@app/core/services/http/room-settings.service';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { RoomService } from '@app/core/services/http/room.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { FocusEvent } from '@app/core/models/events/remote/focus-event';
import {
  PublishedQuestionnairesByRoomIdGql,
  QnaStateChangedGql,
  QuestionnairesByRoomIdGql,
  QuestionnairePublishingMode,
  QuestionnairesChangedGql,
  QuestionnaireSummaryFragment,
  QuestionnaireType,
  RoomStatsByIdGql,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { NEVER, Subject, of } from 'rxjs';
import { NavBarComponent } from './nav-bar.component';

describe('NavBarComponent', () => {
  let fixture: ComponentFixture<NavBarComponent>;
  let loader: HarnessLoader;
  let router: Router;
  let questionnairesByRoomId: jasmine.SpyObj<QuestionnairesByRoomIdGql>;
  let publishedQuestionnairesByRoomId: jasmine.SpyObj<PublishedQuestionnairesByRoomIdGql>;
  let roomSettingsService: jasmine.SpyObj<RoomSettingsService>;
  let focusModeService: jasmine.SpyObj<FocusModeService>;
  let route: { snapshot: { params: object; firstChild?: unknown } };

  const quiz = {
    id: 'q-1',
    name: 'Quiz',
    type: QuestionnaireType.Quiz,
  } as QuestionnaireSummaryFragment;
  const survey = {
    id: 'q-2',
    name: 'Survey',
    type: QuestionnaireType.Survey,
  } as QuestionnaireSummaryFragment;

  function questionnairesQuery(field: string) {
    const gql = jasmine.createSpyObj(field, ['watch']);
    gql.watch.and.returnValue({
      valueChanges: of({ loading: false, data: { [field]: [] } }),
      refetch: () => Promise.resolve({}),
    });
    return gql;
  }

  function subscriptionGql(name: string) {
    const gql = jasmine.createSpyObj(name, ['subscribe']);
    gql.subscribe.and.returnValue(NEVER);
    return gql;
  }

  function returnQuestionnaires(
    gql: jasmine.SpyObj<{ watch: unknown }>,
    field: string,
    questionnaires: QuestionnaireSummaryFragment[]
  ) {
    (gql.watch as jasmine.Spy).and.returnValue({
      valueChanges: of({ loading: false, data: { [field]: questionnaires } }),
      refetch: () => Promise.resolve({}),
    });
  }

  beforeEach(() => {
    questionnairesByRoomId = questionnairesQuery('questionnairesByRoomId');
    publishedQuestionnairesByRoomId = questionnairesQuery(
      'publishedQuestionnairesByRoomId'
    );
    const roomStatsById = jasmine.createSpyObj('RoomStatsByIdGql', ['watch']);
    roomStatsById.watch.and.returnValue({
      valueChanges: of({
        data: { roomById: { stats: { activeMemberCount: 42 } } },
      }),
    });
    roomSettingsService = jasmine.createSpyObj('RoomSettingsService', [
      'getRoomSettingsStream',
    ]);
    roomSettingsService.getRoomSettingsStream.and.returnValue(NEVER);
    focusModeService = jasmine.createSpyObj('FocusModeService', [
      'getState',
      'getFocusModeEnabled',
    ]);
    focusModeService.getState.and.returnValue(NEVER);
    focusModeService.getFocusModeEnabled.and.returnValue(of(false));
    route = { snapshot: { params: {} } };

    configureTestModule(
      [
        getTranslocoModule(),
        RouterTestingModule.withRoutes([]),
        NavBarComponent,
      ],
      [
        provideNoopAnimations(),
        { provide: ActivatedRoute, useValue: route },
        {
          provide: QuestionnairesByRoomIdGql,
          useValue: questionnairesByRoomId,
        },
        {
          provide: PublishedQuestionnairesByRoomIdGql,
          useValue: publishedQuestionnairesByRoomId,
        },
        {
          provide: QuestionnairesChangedGql,
          useValue: subscriptionGql('QuestionnairesChangedGql'),
        },
        {
          provide: QnaStateChangedGql,
          useValue: subscriptionGql('QnaStateChangedGql'),
        },
        { provide: RoomStatsByIdGql, useValue: roomStatsById },
        { provide: RoomSettingsService, useValue: roomSettingsService },
        { provide: ContentGroupService, useValue: {} },
        { provide: RoomService, useValue: {} },
        { provide: RoomStatsService, useValue: {} },
      ]
    );
    // The component provides this service itself.
    TestBed.overrideProvider(FocusModeService, { useValue: focusModeService });
    viewport.set('desktop');
    router = TestBed.inject(Router);
  });

  afterEach(() => viewport.reset());

  function setUp(
    viewRole: UserRole,
    options: {
      surveyEnabled?: boolean;
      qnaEnabled?: boolean;
      userRole?: UserRole;
    } = {}
  ) {
    fixture = TestBed.createComponent(NavBarComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    const room = new Room();
    room.id = 'room-1';
    room.shortId = '12345678';
    fixture.componentRef.setInput('roomId', 'room-1');
    fixture.componentRef.setInput('room', room);
    fixture.componentRef.setInput('userRole', options.userRole ?? viewRole);
    fixture.componentRef.setInput('viewRole', viewRole);
    fixture.componentRef.setInput('qnaEnabled', !!options.qnaEnabled);
    fixture.componentRef.setInput('roomSettings', {
      id: 'settings-1',
      roomId: 'room-1',
      surveyEnabled: !!options.surveyEnabled,
      surveyType: LiveFeedbackType.FEEDBACK,
    });
    fixture.detectChanges();
  }

  function button(id: string) {
    return loader.getHarness(MatButtonHarness.with({ selector: `#${id}` }));
  }

  function streamQuestionnaires(
    gql: jasmine.SpyObj<{ watch: unknown }>,
    field: string
  ) {
    const results$ = new Subject<unknown>();
    (gql.watch as jasmine.Spy).and.returnValue({
      valueChanges: results$,
      refetch: () => Promise.resolve({}),
    });
    return (questionnaires: QuestionnaireSummaryFragment[]) => {
      results$.next({ loading: false, data: { [field]: questionnaires } });
      fixture.detectChanges();
    };
  }

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  /** Nests the questionnaire route below the room's, as the routing does. */
  function routeToQuestionnaire(questionnaireId: string) {
    route.snapshot.firstChild = {
      params: {},
      firstChild: { params: { questionnaireId }, firstChild: null },
    };
  }

  function activeQuestionnaireId() {
    return fixture.componentInstance.activeQuestionnaire()?.id;
  }

  it('has navigation buttons for the room overview and the Q&A', async () => {
    setUp(UserRole.PARTICIPANT, { qnaEnabled: true });

    expect(await button('overview-button')).toBeTruthy();
    expect(await button('comments-button')).toBeTruthy();
  });

  it('hides disabled live feedback from participants', () => {
    setUp(UserRole.PARTICIPANT);

    expect(query('#feedback-button')).toBeNull();
  });

  it('offers disabled live feedback to the owner', async () => {
    setUp(UserRole.OWNER);

    expect(await button('feedback-button')).toBeTruthy();
  });

  it('has no questionnaire button without questionnaires', () => {
    setUp(UserRole.OWNER);

    expect(query('#questionnaire-button')).toBeNull();
  });

  it('lists all questionnaires for the owner', async () => {
    returnQuestionnaires(questionnairesByRoomId, 'questionnairesByRoomId', [
      quiz,
    ]);
    setUp(UserRole.OWNER);

    expect(questionnairesByRoomId.watch).toHaveBeenCalledWith({
      variables: { roomId: 'room-1' },
    });
    expect(publishedQuestionnairesByRoomId.watch).not.toHaveBeenCalled();
    expect(await button('questionnaire-button')).toBeTruthy();
  });

  it('lists only published questionnaires for participants', async () => {
    returnQuestionnaires(
      publishedQuestionnairesByRoomId,
      'publishedQuestionnairesByRoomId',
      [quiz]
    );
    setUp(UserRole.PARTICIPANT);

    expect(questionnairesByRoomId.watch).not.toHaveBeenCalled();
    expect(await button('questionnaire-button')).toBeTruthy();
  });

  it('shows the user count to the owner on desktop', () => {
    setUp(UserRole.OWNER);

    const userCounter = query('#user-count-container');
    expect(userCounter).not.toBeNull();
    expect(getComputedStyle(userCounter!).display).not.toBe('none');
    expect(userCounter!.textContent).toContain('42');
  });

  it('hides the user count on mobile', () => {
    viewport.set('mobile');
    setUp(UserRole.OWNER);

    expect(getComputedStyle(query('#user-count-container')!).display).toBe(
      'none'
    );
  });

  it('shows no user count to participants', () => {
    setUp(UserRole.PARTICIPANT);

    expect(query('#user-count-container')).toBeNull();
  });

  it('navigates to the room overview', async () => {
    spyOn(router, 'navigate').and.resolveTo(true);
    setUp(UserRole.OWNER);

    await (await button('overview-button')).click();

    expect(router.navigate).toHaveBeenCalledWith(['edit', '12345678']);
  });

  it('navigates to the Q&A', async () => {
    spyOn(router, 'navigate').and.resolveTo(true);
    setUp(UserRole.OWNER);

    await (await button('comments-button')).click();

    expect(router.navigate).toHaveBeenCalledWith([
      'edit',
      '12345678',
      'comments',
    ]);
  });

  it('navigates to the live feedback', async () => {
    spyOn(router, 'navigate').and.resolveTo(true);
    setUp(UserRole.OWNER);

    await (await button('feedback-button')).click();

    expect(router.navigate).toHaveBeenCalledWith([
      'edit',
      '12345678',
      'feedback',
    ]);
  });

  it('navigates straight to the only questionnaire', async () => {
    spyOn(router, 'navigate').and.resolveTo(true);
    returnQuestionnaires(questionnairesByRoomId, 'questionnairesByRoomId', [
      quiz,
    ]);
    setUp(UserRole.OWNER);

    await (await button('questionnaire-button')).click();

    expect(router.navigate).toHaveBeenCalledWith([
      'edit',
      '12345678',
      'questionnaire',
      'q-1',
    ]);
  });

  it('lets the owner choose between several questionnaires', async () => {
    spyOn(router, 'navigate').and.resolveTo(true);
    returnQuestionnaires(questionnairesByRoomId, 'questionnairesByRoomId', [
      quiz,
      survey,
    ]);
    setUp(UserRole.OWNER);

    await (await button('questionnaire-button')).click();
    const menu = await loader.getHarness(
      MatMenuHarness.with({ selector: '#questionnaire-button' })
    );
    expect(await menu.isOpen()).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();

    const [item] = await menu.getItems({ selector: '#Survey-series-button' });
    await item.click();

    expect(router.navigate).toHaveBeenCalledWith([
      'edit',
      '12345678',
      'questionnaire',
      'q-2',
    ]);
  });

  it('marks the focused feature for the owner', () => {
    focusModeService.getFocusModeEnabled.and.returnValue(of(true));
    focusModeService.getState.and.returnValue(
      of({ feature: 'COMMENTS' } as FocusEvent)
    );
    setUp(UserRole.OWNER);

    expect(query('#comments-button .focus-indicator')).not.toBeNull();
    expect(query('#overview-button .focus-indicator')).toBeNull();
  });

  it('removes the questionnaire button once the last questionnaire is gone', () => {
    const emit = streamQuestionnaires(
      questionnairesByRoomId,
      'questionnairesByRoomId'
    );
    setUp(UserRole.OWNER);
    emit([quiz]);
    expect(query('#questionnaire-button')).not.toBeNull();

    emit([]);

    expect(query('#questionnaire-button')).toBeNull();
  });

  it('flags a newly published questionnaire for participants', () => {
    const emit = streamQuestionnaires(
      publishedQuestionnairesByRoomId,
      'publishedQuestionnairesByRoomId'
    );
    setUp(UserRole.PARTICIPANT);
    emit([quiz]);
    expect(query('#questionnaire-badge.show-news')).toBeNull();

    emit([quiz, survey]);

    expect(query('#questionnaire-badge.show-news')).not.toBeNull();
  });

  it('keeps the room preview of a creator quiet', () => {
    const emit = streamQuestionnaires(
      publishedQuestionnairesByRoomId,
      'publishedQuestionnairesByRoomId'
    );
    setUp(UserRole.PARTICIPANT, { userRole: UserRole.OWNER });
    emit([quiz]);

    emit([quiz, survey]);

    expect(query('#questionnaire-badge.show-news')).toBeNull();
  });

  /** A range-published questionnaire releasing up to `position`. */
  function releasedUpTo(position: number, contentCount = 5) {
    return {
      ...quiz,
      publishingMode: QuestionnairePublishingMode.UpTo,
      publishedUpToContent: { id: `c-${position}`, position },
      contentCount,
    };
  }

  it('flags new released contents of a known questionnaire for participants', () => {
    const emit = streamQuestionnaires(
      publishedQuestionnairesByRoomId,
      'publishedQuestionnairesByRoomId'
    );
    setUp(UserRole.PARTICIPANT);
    emit([releasedUpTo(1)]);
    expect(query('#questionnaire-badge.show-news')).toBeNull();

    emit([releasedUpTo(2)]);

    expect(query('#questionnaire-badge.show-news')).not.toBeNull();
  });

  it('flags new contents of a fully published questionnaire for participants', () => {
    const emit = streamQuestionnaires(
      publishedQuestionnairesByRoomId,
      'publishedQuestionnairesByRoomId'
    );
    const all = { ...quiz, publishingMode: QuestionnairePublishingMode.All };
    setUp(UserRole.PARTICIPANT);
    emit([{ ...all, contentCount: 2 }]);

    emit([{ ...all, contentCount: 3 }]);

    expect(query('#questionnaire-badge.show-news')).not.toBeNull();
  });

  it('stays quiet when a known questionnaire gets an unreleased content', () => {
    const emit = streamQuestionnaires(
      publishedQuestionnairesByRoomId,
      'publishedQuestionnairesByRoomId'
    );
    setUp(UserRole.PARTICIPANT);
    emit([releasedUpTo(1, 3)]);

    emit([releasedUpTo(1, 4)]);

    expect(query('#questionnaire-badge.show-news')).toBeNull();
  });

  it('stays quiet when a known questionnaire releases fewer contents', () => {
    const emit = streamQuestionnaires(
      publishedQuestionnairesByRoomId,
      'publishedQuestionnairesByRoomId'
    );
    setUp(UserRole.PARTICIPANT);
    emit([releasedUpTo(2)]);

    emit([releasedUpTo(1)]);

    expect(query('#questionnaire-badge.show-news')).toBeNull();
  });

  it('activates the questionnaire of the child route', () => {
    const emit = streamQuestionnaires(
      questionnairesByRoomId,
      'questionnairesByRoomId'
    );
    routeToQuestionnaire('q-2');
    setUp(UserRole.OWNER);

    emit([quiz, survey]);

    expect(activeQuestionnaireId()).toBe('q-2');
  });

  it('keeps the active questionnaire when the list is refetched', () => {
    const emit = streamQuestionnaires(
      questionnairesByRoomId,
      'questionnairesByRoomId'
    );
    setUp(UserRole.OWNER);
    emit([quiz, survey]);
    fixture.componentInstance.activeQuestionnaire.set(survey);

    emit([{ ...quiz }, { ...survey }]);

    expect(activeQuestionnaireId()).toBe('q-2');
  });

  it('activates the last visited questionnaire', () => {
    const emit = streamQuestionnaires(
      questionnairesByRoomId,
      'questionnairesByRoomId'
    );
    setUp(UserRole.OWNER);
    TestBed.inject(GlobalStorageService).setItem(
      STORAGE_KEYS.LAST_GROUP,
      'q-2'
    );

    emit([quiz, survey]);

    expect(activeQuestionnaireId()).toBe('q-2');
  });

  it('ignores a last visited questionnaire that is not an ID of the room', () => {
    const emit = streamQuestionnaires(
      questionnairesByRoomId,
      'questionnairesByRoomId'
    );
    TestBed.inject(GlobalStorageService).setItem(
      STORAGE_KEYS.LAST_GROUP,
      'Survey'
    );
    setUp(UserRole.OWNER);

    emit([quiz, survey]);

    expect(activeQuestionnaireId()).toBe('q-1');
  });

  it('leaves the last visited questionnaire alone when the list is refetched', () => {
    const emit = streamQuestionnaires(
      questionnairesByRoomId,
      'questionnairesByRoomId'
    );
    setUp(UserRole.OWNER);
    const storage = TestBed.inject(GlobalStorageService);
    storage.setItem(STORAGE_KEYS.LAST_GROUP, 'q-2');

    emit([quiz, survey]);

    expect(storage.getItem(STORAGE_KEYS.LAST_GROUP)).toBe('q-2');
  });
});
