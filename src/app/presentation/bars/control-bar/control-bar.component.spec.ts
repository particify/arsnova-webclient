import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ControlBarComponent } from './control-bar.component';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
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
import { ContentService } from '@core/services/http/content.service';
import { ContentGroupService } from '@core/services/http/content-group.service';
import { AnnounceService } from '@core/services/util/announce.service';
import { SpyLocation } from '@angular/common/testing';
import { Room } from '@core/models/room';
import { NO_ERRORS_SCHEMA, EventEmitter } from '@angular/core';
import { SplitShortIdPipe } from '@core/pipes/split-short-id.pipe';
import { FeedbackService } from '@core/services/http/feedback.service';
import { Message } from '@stomp/stompjs';
import { RoutingService } from '@core/services/util/routing.service';
import { ApiConfigService } from '@core/services/http/api-config.service';
import { HotkeyService } from '@core/services/util/hotkey.service';
import { DialogService } from '@core/services/util/dialog.service';
import { RoomStatsService } from '@core/services/http/room-stats.service';
import { ContentGroup } from '@core/models/content-group';
import { RoomService } from '@core/services/http/room.service';
import { RemoteService } from '@core/services/util/remote.service';
import { CommentSettingsService } from '@core/services/http/comment-settings.service';
import { ContentPublishService } from '@core/services/util/content-publish.service';

describe('ControlBarComponent', () => {
  let component: ControlBarComponent;
  let fixture: ComponentFixture<ControlBarComponent>;

  const mockContentService = jasmine.createSpyObj(['']);

  const mockRoomStatsService = jasmine.createSpyObj(['getStats']);
  mockRoomStatsService.getStats.and.returnValue(of({}));

  const mockApiConfigService = jasmine.createSpyObj(['getApiConfig$']);
  const config = {
    ui: {
      links: {
        join: {
          url: 'joinUrl',
        },
      },
    },
  };
  mockApiConfigService.getApiConfig$.and.returnValue(of(config));

  const mockHotkeyService = jasmine.createSpyObj([
    'registerHotkey',
    'unregisterHotkey',
  ]);

  const mockFeedbackService = jasmine.createSpyObj(['startSub']);
  mockFeedbackService.messageEvent = new EventEmitter<Message>();

  const mockContentGroupService = jasmine.createSpyObj([
    'isIndexPublished',
    'patchContentGroup',
    'getById',
  ]);
  mockContentGroupService.getById.and.returnValue(of(new ContentGroup()));

  const mockDialogService = jasmine.createSpyObj([
    'openPublishGroupDialog',
    'openDeleteDialog',
  ]);

  const snapshot = new ActivatedRouteSnapshot();
  snapshot.params = {
    seriesName: 'Quiz',
  };

  const room = new Room();
  room.settings = {};
  const data = {
    room: room,
  };
  const activatedRouteStub = new ActivatedRouteStub(null, data, snapshot);

  const splitShortIdPipe = new SplitShortIdPipe();

  const mockRoutingService = jasmine.createSpyObj([
    'getRoleString',
    'getRouteChanges',
  ]);
  mockRoutingService.getRouteChanges.and.returnValue(of(snapshot));

  const body = {
    UserCountChanged: {
      userCount: 42,
    },
  };
  const message = {
    body: JSON.stringify(body),
  };

  const summaries = [
    {
      stats: {
        roomUserCount: 24,
      },
    },
  ];

  const mockRoomService = jasmine.createSpyObj([
    'getCurrentRoomsMessageStream',
    'getRoomSummaries',
  ]);
  mockRoomService.getCurrentRoomsMessageStream.and.returnValue(of(message));
  mockRoomService.getRoomSummaries.and.returnValue(of(summaries));

  const mockRemoteService = jasmine.createSpyObj(['getFeedbackState']);

  const mockCommentSettingsService = jasmine.createSpyObj([
    'getSettingsStream',
  ]);
  mockCommentSettingsService.getSettingsStream.and.returnValue(of({}));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ControlBarComponent, SplitShortIdPipe],
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
          provide: RoomStatsService,
          useValue: mockRoomStatsService,
        },
        {
          provide: FeedbackService,
          useValue: mockFeedbackService,
        },
        {
          provide: ContentService,
          useValue: mockContentService,
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
          provide: RoutingService,
          useValue: mockRoutingService,
        },
        {
          provide: ApiConfigService,
          useValue: mockApiConfigService,
        },
        {
          provide: HotkeyService,
          useValue: mockHotkeyService,
        },
        {
          provide: DialogService,
          useValue: mockDialogService,
        },
        {
          provide: RoomService,
          useValue: mockRoomService,
        },
        {
          provide: RemoteService,
          useValue: mockRemoteService,
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
    fixture = TestBed.createComponent(ControlBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
