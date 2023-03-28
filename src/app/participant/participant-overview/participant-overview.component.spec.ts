import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ParticipantOverviewComponent } from './participant-overview.component';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '@core/services/util/notification.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
  JsonTranslationLoader,
  MockNotificationService,
  ActivatedRouteStub,
  MockGlobalStorageService,
  MockRouter,
  MockEventService,
  MockAnnounceService,
} from '@testing/test-helpers';
import { of } from 'rxjs';
import { GlobalStorageService } from '@core/services/util/global-storage.service';
import { EventService } from '@core/services/util/event.service';
import { ContentGroupService } from '@core/services/http/content-group.service';
import { AnnounceService } from '@core/services/util/announce.service';
import { SpyLocation } from '@angular/common/testing';
import { AuthenticationService } from '@core/services/http/authentication.service';
import { Room } from '@core/models/room';
import { NO_ERRORS_SCHEMA, EventEmitter } from '@angular/core';
import { UserRole } from '@core/models/user-roles.enum';
import { SplitShortIdPipe } from '@core/pipes/split-short-id.pipe';
import { RoomService } from '@core/services/http/room.service';
import { MockLangService } from '@testing/test-helpers';
import { RoomStatsService } from '@core/services/http/room-stats.service';
import { LanguageService } from '@core/services/util/language.service';
import { WsCommentService } from '@core/services/websockets/ws-comment.service';
import { CommentService } from '@core/services/http/comment.service';
import { FeedbackService } from '@core/services/http/feedback.service';
import { Message } from '@stomp/stompjs';
import { A11yIntroPipe } from '@core/pipes/a11y-intro.pipe';
import { CommentSettingsService } from '@core/services/http/comment-settings.service';
import { ContentPublishService } from '@core/services/util/content-publish.service';

describe('ParticipantOverviewComponent', () => {
  let component: ParticipantOverviewComponent;
  let fixture: ComponentFixture<ParticipantOverviewComponent>;

  const mockRoomService = jasmine.createSpyObj([
    'getCurrentRoomsMessageStream',
    'getRoomSummaries',
    'deleteRoom',
  ]);

  const mockRoomStatsService = jasmine.createSpyObj(['getStats']);
  mockRoomStatsService.getStats.and.returnValue(of({}));

  const mockWsCommentService = jasmine.createSpyObj(['getCommentStream']);
  const message = {
    body: '{ "payload": {} }',
  };
  mockWsCommentService.getCommentStream.and.returnValue(of(message));

  const mockCommentService = jasmine.createSpyObj(['countByRoomId']);
  mockCommentService.countByRoomId.and.returnValue(of({}));

  const mockFeedbackService = jasmine.createSpyObj(['startSub']);
  mockFeedbackService.messageEvent = new EventEmitter<Message>();

  const mockContentGroupService = jasmine.createSpyObj([
    'getByRoomIdAndName',
    'getById',
    'filterPublishedIds',
  ]);
  mockContentGroupService.getByRoomIdAndName.and.returnValue(of({}));
  mockContentGroupService.filterPublishedIds.and.returnValue([]);

  const mockAuthenticationService = jasmine.createSpyObj([
    'getCurrentAuthentication',
  ]);

  const room = new Room();
  room.settings = {};
  const data = {
    room: room,
    userRole: UserRole.PARTICIPANT,
    viewRole: UserRole.PARTICIPANT,
  };

  const mockCommentSettingsService = jasmine.createSpyObj([
    'getSettingsStream',
  ]);

  mockCommentSettingsService.getSettingsStream.and.returnValue(of({}));

  const activatedRouteStub = new ActivatedRouteStub(null, data);

  const splitShortIdPipe = new SplitShortIdPipe();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ParticipantOverviewComponent,
        A11yIntroPipe,
        SplitShortIdPipe,
      ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
      ],
      providers: [
        {
          provide: RoomService,
          useValue: mockRoomService,
        },
        {
          provide: RoomStatsService,
          useValue: mockRoomStatsService,
        },
        {
          provide: LanguageService,
          useClass: MockLangService,
        },
        {
          provide: WsCommentService,
          useValue: mockWsCommentService,
        },
        {
          provide: CommentService,
          useValue: mockCommentService,
        },
        {
          provide: FeedbackService,
          useValue: mockFeedbackService,
        },
        {
          provide: ContentGroupService,
          useValue: mockContentGroupService,
        },
        {
          provide: AnnounceService,
          useClass: MockAnnounceService,
        },
        {
          provide: Location,
          useClass: SpyLocation,
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: SplitShortIdPipe,
          useValue: splitShortIdPipe,
        },
        {
          provide: CommentSettingsService,
          useValue: mockCommentSettingsService,
        },
        {
          provide: ContentPublishService,
          useClass: ContentPublishService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticipantOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
