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
import { NEVER, of } from 'rxjs';
import { ControlBarComponent } from './control-bar.component';

describe('ControlBarComponent', () => {
  let fixture: ComponentFixture<ControlBarComponent>;
  let hotkeyService: jasmine.SpyObj<HotkeyService>;
  let contentResultsService: ContentResultsService;

  const quiz = {
    id: 'q-1',
    name: 'Quiz',
    type: QuestionnaireType.Quiz,
  } as QuestionnaireSummaryFragment;

  function questionnairesQuery(field: string) {
    const gql = jasmine.createSpyObj(field, ['watch']);
    gql.watch.and.returnValue({
      valueChanges: of({ loading: false, data: { [field]: [quiz] } }),
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
});
