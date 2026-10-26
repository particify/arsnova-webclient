import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
} from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LiveFeedbackType } from '@app/core/models/live-feedback-type.enum';
import { Room } from '@app/core/models/room';
import { UserRole } from '@app/core/models/user-roles.enum';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { RoomSettingsService } from '@app/core/services/http/room-settings.service';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { RoomService } from '@app/core/services/http/room.service';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { ContentResultsService } from '@app/standalone/content-results/content-results.service';
import {
  PublishedQuestionnairesByRoomIdGql,
  QnaStateChangedGql,
  QuestionnairesByRoomIdGql,
  QuestionnairesChangedGql,
  QuestionnaireSummaryFragment,
  QuestionnaireType,
  RoomStatsByIdGql,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { BehaviorSubject, NEVER, map, of } from 'rxjs';
import { ControlBarComponent } from './control-bar.component';

describe('ControlBarComponent', () => {
  let fixture: ComponentFixture<ControlBarComponent>;
  let hotkeyService: jasmine.SpyObj<HotkeyService>;
  let contentResultsService: ContentResultsService;
  // The listed questionnaires, as the cache hands them out after each change.
  let questionnaires$: BehaviorSubject<QuestionnaireSummaryFragment[]>;

  const quiz = {
    id: 'q-1',
    name: 'Quiz',
    type: QuestionnaireType.Quiz,
    leaderboardEnabled: true,
  } as QuestionnaireSummaryFragment;

  function questionnairesQuery(field: string) {
    const gql = jasmine.createSpyObj(field, ['watch']);
    gql.watch.and.returnValue({
      valueChanges: questionnaires$.pipe(
        map((questionnaires) => ({
          loading: false,
          data: { [field]: questionnaires },
        }))
      ),
      refetch: () => Promise.resolve({}),
    });
    return gql;
  }

  function subscriptionGql(name: string) {
    const gql = jasmine.createSpyObj(name, ['subscribe']);
    gql.subscribe.and.returnValue(NEVER);
    return gql;
  }

  beforeEach(() => {
    // The bar's own template is irrelevant to the initialisation under test.
    TestBed.overrideComponent(ControlBarComponent, { set: { template: '' } });
    const roomStatsById = jasmine.createSpyObj('RoomStatsByIdGql', ['watch']);
    roomStatsById.watch.and.returnValue({
      valueChanges: of({ data: { roomById: { stats: {} } } }),
    });
    const focusModeService = jasmine.createSpyObj('FocusModeService', [
      'getState',
      'getFocusModeEnabled',
    ]);
    focusModeService.getState.and.returnValue(NEVER);
    focusModeService.getFocusModeEnabled.and.returnValue(of(false));
    const presentationService = jasmine.createSpyObj('PresentationService', [
      'getCommentState',
      'getCommentZoomChanges',
      'getContentState',
      'getFeedbackStarted',
      'getLeaderboardDisplayed',
    ]);
    for (const method of Object.keys(presentationService)) {
      presentationService[method].and.returnValue(NEVER);
    }
    questionnaires$ = new BehaviorSubject([quiz]);

    configureTestModule(
      [
        getTranslocoModule(),
        RouterTestingModule.withRoutes([]),
        ControlBarComponent,
      ],
      [
        provideNoopAnimations(),
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } },
        {
          provide: QuestionnairesByRoomIdGql,
          useValue: questionnairesQuery('questionnairesByRoomId'),
        },
        {
          provide: PublishedQuestionnairesByRoomIdGql,
          useValue: questionnairesQuery('publishedQuestionnairesByRoomId'),
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
        { provide: PresentationService, useValue: presentationService },
        { provide: RoomSettingsService, useValue: {} },
        { provide: ContentGroupService, useValue: {} },
        { provide: RoomService, useValue: {} },
        { provide: RoomStatsService, useValue: {} },
      ]
    );
    TestBed.overrideProvider(FocusModeService, { useValue: focusModeService });
    hotkeyService = TestBed.inject(
      HotkeyService
    ) as jasmine.SpyObj<HotkeyService>;
    contentResultsService = TestBed.inject(ContentResultsService);

    fixture = TestBed.createComponent(ControlBarComponent);
    const room = new Room();
    room.id = 'room-1';
    room.shortId = '12345678';
    fixture.componentRef.setInput('roomId', 'room-1');
    fixture.componentRef.setInput('room', room);
    fixture.componentRef.setInput('userRole', UserRole.OWNER);
    fixture.componentRef.setInput('viewRole', UserRole.OWNER);
    fixture.componentRef.setInput('roomSettings', {
      id: 'settings-1',
      roomId: 'room-1',
      surveyEnabled: false,
      surveyType: LiveFeedbackType.FEEDBACK,
    });
  });

  it('registers its hotkeys once, however often results visibility changes', fakeAsync(() => {
    fixture.detectChanges();
    const registrations = hotkeyService.registerHotkey.calls.count();
    expect(registrations).toBeGreaterThan(0);

    contentResultsService.setResultsVisible(true);
    fixture.detectChanges();
    contentResultsService.setResultsVisible(false);
    fixture.detectChanges();
    contentResultsService.setResultsVisible(true);
    fixture.detectChanges();
    flush();

    expect(hotkeyService.registerHotkey).toHaveBeenCalledTimes(registrations);
    fixture.destroy();
  }));

  it('removes the highlights once the results are hidden again', fakeAsync(() => {
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.evaluateContentState();
    const item = (name: string) =>
      component.groupItems.find((i) => i.name === name);
    expect(item('correct')).toBeDefined();

    contentResultsService.setResultsVisible(true);
    contentResultsService.setCorrectResultsVisible(true);
    fixture.detectChanges();
    flush();
    expect(item('results')?.highlighted).toBeTrue();
    expect(item('correct')?.highlighted).toBeTrue();

    contentResultsService.setResultsVisible(false);
    contentResultsService.setCorrectResultsVisible(false);
    fixture.detectChanges();
    flush();
    expect(item('results')?.highlighted).toBeFalse();
    expect(item('correct')?.highlighted).toBeFalse();
    fixture.destroy();
  }));

  describe('leaderboard control', () => {
    function offersLeaderboard(): boolean {
      return fixture.componentInstance.groupItems.some(
        (item) => item.name === 'leaderboard'
      );
    }

    function listQuestionnaires(leaderboardEnabled: boolean) {
      questionnaires$.next([{ ...quiz, leaderboardEnabled }]);
      fixture.detectChanges();
    }

    it('offers the leaderboard of a questionnaire that has it enabled', fakeAsync(() => {
      fixture.detectChanges();
      flush();
      // The active questionnaire is only picked once the list has loaded.
      fixture.detectChanges();

      expect(offersLeaderboard()).toBeTrue();
      fixture.destroy();
    }));

    it('follows the leaderboard being switched off and on again', fakeAsync(() => {
      fixture.detectChanges();
      flush();
      fixture.detectChanges();

      listQuestionnaires(false);
      expect(offersLeaderboard()).toBeFalse();

      listQuestionnaires(true);
      expect(offersLeaderboard()).toBeTrue();
      fixture.destroy();
    }));
  });
});
