import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ControlBarComponent } from './control-bar.component';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import { NotificationService } from '@app/core/services/util/notification.service';
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
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { EventService } from '@app/core/services/util/event.service';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { SpyLocation } from '@angular/common/testing';
import { Room } from '@app/core/models/room';
import { NO_ERRORS_SCHEMA, EventEmitter } from '@angular/core';
import { SplitShortIdPipe } from '@app/core/pipes/split-short-id.pipe';
import { FeedbackService } from '@app/core/services/http/feedback.service';
import { Message } from '@stomp/stompjs';
import { RoutingService } from '@app/core/services/util/routing.service';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { ContentGroup } from '@app/core/models/content-group';
import { RoomService } from '@app/core/services/http/room.service';
import { CommentSettingsService } from '@app/core/services/http/comment-settings.service';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { PresentationService } from '@app/core/services/util/presentation.service';

describe('ControlBarComponent', () => {
  let component: ControlBarComponent;
  let fixture: ComponentFixture<ControlBarComponent>;

  const mockContentService = jasmine.createSpyObj('ContentService', [
    'getAnswersDeleted',
  ]);
  mockContentService.getAnswersDeleted.and.returnValue(of({}));

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

  const mockPresentationService = jasmine.createSpyObj('PresentationService', [
    'getFeedbackStarted',
  ]);

  const mockCommentSettingsService = jasmine.createSpyObj([
    'getSettingsStream',
  ]);
  mockCommentSettingsService.getSettingsStream.and.returnValue(of({}));

  const mockPresentationService = jasmine.createSpyObj('PresentationService', [
    'getContentState',
    'getCommentState',
    'getMultipleRoundState',
    'getCommentZoomChanges',
    'getContentGroupChanges',
  ]);

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
          provide: PresentationService,
          useValue: mockPresentationService,
        },
        {
          provide: CommentSettingsService,
          useValue: mockCommentSettingsService,
        },
        {
          provide: ContentPublishService,
          useClass: ContentPublishService,
        },
        {
          provide: PresentationService,
          useValue: mockPresentationService,
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
