import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ParticipantOverviewComponent } from './participant-overview.component';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
  JsonTranslationLoader,
  MockNotificationService,
  ActivatedRouteStub,
  MockGlobalStorageService,
  MockRouter,
  MockEventService,
  MockAnnounceService
} from '@arsnova/testing/test-helpers';
import { of } from 'rxjs';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { EventService } from '@arsnova/app/services/util/event.service';
import { ContentGroupService } from '@arsnova/app/services/http/content-group.service';
import { AnnounceService } from '@arsnova/app/services/util/announce.service';
import { MockLocationStrategy } from '@angular/common/testing';
import { AuthenticationService } from '@arsnova/app/services/http/authentication.service';
import { Room } from '@arsnova/app/models/room';
import { NO_ERRORS_SCHEMA, EventEmitter } from '@angular/core';
import { UserRole } from '@arsnova/app/models/user-roles.enum';
import { SplitShortIdPipe } from '@arsnova/app/pipes/split-short-id.pipe';
import { RoomService } from '@arsnova/app/services/http/room.service';
import { MockLangService } from '@arsnova/testing/test-helpers';
import { RoomStatsService } from '@arsnova/app/services/http/room-stats.service';
import { LanguageService } from '@arsnova/app/services/util/language.service';
import { WsCommentService } from '@arsnova/app/services/websockets/ws-comment.service';
import { CommentService } from '@arsnova/app/services/http/comment.service';
import { FeedbackService } from '@arsnova/app/services/http/feedback.service';
import { Message } from '@stomp/stompjs';
import { A11yIntroPipe } from '@arsnova/app/pipes/a11y-intro.pipe';


describe('ParticipantOverviewComponent', () => {
  let component: ParticipantOverviewComponent;
  let fixture: ComponentFixture<ParticipantOverviewComponent>;

  const mockRoomService = jasmine.createSpyObj(['getCurrentRoomsMessageStream', 'getRoomSummaries', 'deleteRoom']);

  const mockRoomStatsService = jasmine.createSpyObj(['getStats']);
  mockRoomStatsService.getStats.and.returnValue(of({}));

  const mockWsCommentService = jasmine.createSpyObj(['getCommentStream']);
  const message = {
    body: '{ "payload": {} }'
  };
  mockWsCommentService.getCommentStream.and.returnValue(of(message));

  const mockCommentService = jasmine.createSpyObj(['countByRoomId']);
  mockCommentService.countByRoomId.and.returnValue(of({}));

  const mockFeedbackService = jasmine.createSpyObj(['startSub']);
  mockFeedbackService.messageEvent = new EventEmitter<Message>();

  const mockContentGroupService = jasmine.createSpyObj(['getByRoomIdAndName', 'getById', 'filterPublishedIds']);
  mockContentGroupService.getByRoomIdAndName.and.returnValue(of({}));
  mockContentGroupService.filterPublishedIds.and.returnValue([]);

  const mockAuthenticationService = jasmine.createSpyObj(['getCurrentAuthentication']);

  const room = new Room();
  room.settings = {};
  const data = {
    room: room,
    userRole: UserRole.PARTICIPANT,
    viewRole: UserRole.PARTICIPANT
  }

  const activatedRouteStub = new ActivatedRouteStub(null, data);

  const splitShortIdPipe = new SplitShortIdPipe();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ParticipantOverviewComponent,
        A11yIntroPipe,
        SplitShortIdPipe
       ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader
          },
          isolate: true
        })
      ],
      providers: [
        {
          provide: RoomService,
          useValue: mockRoomService
        },
        {
          provide: RoomStatsService,
          useValue: mockRoomStatsService
        },
        {
          provide: LanguageService,
          useClass: MockLangService
        },
        {
          provide: WsCommentService,
          useValue: mockWsCommentService
        },
        {
          provide: CommentService,
          useValue: mockCommentService
        },
        {
          provide: FeedbackService,
          useValue: mockFeedbackService
        },
        {
          provide: ContentGroupService,
          useValue: mockContentGroupService
        },
        {
          provide: AnnounceService,
          useClass: MockAnnounceService
        },
        {
          provide: Location,
          useClass: MockLocationStrategy
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService
        },
        {
          provide: Router,
          useClass: MockRouter
        },
        {
          provide: EventService,
          useClass: MockEventService
        },
        {
          provide: SplitShortIdPipe,
          useValue: splitShortIdPipe
        }
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
    .compileComponents();
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
