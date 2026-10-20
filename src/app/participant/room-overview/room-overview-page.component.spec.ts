import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Room } from '@app/core/models/room';
import { UserRole } from '@app/core/models/user-roles.enum';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { RoomSettingsService } from '@app/core/services/http/room-settings.service';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { FocusModeService } from '@app/participant/_services/focus-mode.service';
import {
  PublishedQuestionnairesByRoomIdGql,
  QnasByRoomIdGql,
  QnaState,
  QuestionnairesChangedGql,
  RoomByShortIdGql,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { NEVER, Subject, of } from 'rxjs';
import { RoomOverviewPageComponent } from './room-overview-page.component';

describe('RoomOverviewPageComponent (participant)', () => {
  let fixture: ComponentFixture<RoomOverviewPageComponent>;
  let component: RoomOverviewPageComponent;
  let publishedQuestionnaires: jasmine.SpyObj<PublishedQuestionnairesByRoomIdGql>;
  let settingsUpdates$: Subject<{ surveyEnabled?: boolean }>;

  function setUp(qnaState?: QnaState) {
    // Covers what the page derives; the feature cards have their own specs.
    TestBed.overrideComponent(RoomOverviewPageComponent, {
      set: { template: '', imports: [] },
    });
    publishedQuestionnaires = jasmine.createSpyObj(
      'PublishedQuestionnairesByRoomIdGql',
      ['watch']
    );
    publishedQuestionnaires.watch.and.returnValue({
      valueChanges: of({
        loading: false,
        data: { publishedQuestionnairesByRoomId: [{ id: 'q-1' }, null] },
      }),
      refetch: () => Promise.resolve({}),
    } as never);
    const qnasByRoomId = jasmine.createSpyObj('QnasByRoomIdGql', ['watch']);
    qnasByRoomId.watch.and.returnValue({
      valueChanges: of({
        dataState: 'complete',
        data: {
          qnasByRoomId: {
            edges: qnaState ? [{ node: { state: qnaState } }] : [],
          },
        },
      }),
    });
    const questionnairesChanged = jasmine.createSpyObj(
      'QuestionnairesChangedGql',
      ['subscribe']
    );
    questionnairesChanged.subscribe.and.returnValue(NEVER);
    const roomByShortId = jasmine.createSpyObj('RoomByShortIdGql', ['fetch']);
    roomByShortId.fetch.and.returnValue(
      of({ data: { roomByShortId: { id: 'room-1', name: 'Room' } } })
    );
    settingsUpdates$ = new Subject();
    const roomSettingsService = jasmine.createSpyObj('RoomSettingsService', [
      'getByRoomId',
      'getRoomSettingsStream',
    ]);
    roomSettingsService.getByRoomId.and.returnValue(
      of({ id: 'settings-1', surveyEnabled: false })
    );
    roomSettingsService.getRoomSettingsStream.and.returnValue(settingsUpdates$);
    const focusModeService = jasmine.createSpyObj('FocusModeService', [
      'getFocusModeEnabled',
    ]);
    focusModeService.getFocusModeEnabled.and.returnValue(of(false));

    configureTestModule(
      [getTranslocoModule(), RoomOverviewPageComponent],
      [
        {
          provide: PublishedQuestionnairesByRoomIdGql,
          useValue: publishedQuestionnaires,
        },
        { provide: QnasByRoomIdGql, useValue: qnasByRoomId },
        { provide: QuestionnairesChangedGql, useValue: questionnairesChanged },
        { provide: RoomByShortIdGql, useValue: roomByShortId },
        { provide: RoomSettingsService, useValue: roomSettingsService },
        { provide: FocusModeService, useValue: focusModeService },
        { provide: ContentGroupService, useValue: {} },
        { provide: RoomStatsService, useValue: {} },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(RoomOverviewPageComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('room', new Room());
    fixture.componentRef.setInput('roomId', 'room-1');
    fixture.componentRef.setInput('shortId', '12345678');
    fixture.componentRef.setInput('viewRole', UserRole.PARTICIPANT);
    fixture.detectChanges();
  }

  it('lists only the published questionnaires', () => {
    setUp();

    expect(publishedQuestionnaires.watch).toHaveBeenCalledWith({
      variables: { roomId: 'room-1' },
    });
    expect(component.questionnaires().map((q) => q.id)).toEqual(['q-1']);
  });

  it('offers the Q&A while it is running', () => {
    setUp(QnaState.Started);

    expect(component.commentsEnabled()).toBeTrue();
  });

  it('hides the Q&A once it has been stopped', () => {
    setUp(QnaState.Stopped);

    expect(component.commentsEnabled()).toBeFalse();
  });

  it('follows the live feedback being switched on and off', () => {
    setUp();
    expect(component.feedbackEnabled()).toBeFalse();

    settingsUpdates$.next({ surveyEnabled: true });
    expect(component.feedbackEnabled()).toBeTrue();

    settingsUpdates$.next({ surveyEnabled: false });
    expect(component.feedbackEnabled()).toBeFalse();
  });

  it('shows the room name once the room has been loaded', () => {
    setUp();

    expect(component.isLoading()).toBeFalse();
    expect(component.name()).toBe('Room');
  });
});
