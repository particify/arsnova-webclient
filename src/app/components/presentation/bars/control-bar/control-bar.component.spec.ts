import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ControlBarComponent } from './control-bar.component';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
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
import { ContentService } from '@arsnova/app/services/http/content.service';
import { ContentGroupService } from '@arsnova/app/services/http/content-group.service';
import { AnnounceService } from '@arsnova/app/services/util/announce.service';
import { MockLocationStrategy } from '@angular/common/testing';
import { Room } from '@arsnova/app/models/room';
import { EventEmitter } from '@angular/core';
import { SplitShortIdPipe } from '@arsnova/app/pipes/split-short-id.pipe';
import { FeedbackService } from '@arsnova/app/services/http/feedback.service';
import { Message } from '@stomp/stompjs';
import { RoutingService } from '@arsnova/app/services/util/routing.service';
import { ApiConfigService } from '@arsnova/app/services/http/api-config.service';
import { HotkeyService } from '@arsnova/app/services/util/hotkey.service';
import { DialogService } from '@arsnova/app/services/util/dialog.service';
import { RoomStatsService } from '@arsnova/app/services/http/room-stats.service';
import { ContentGroup } from '@arsnova/app/models/content-group';

describe('ControlBarComponent', () => {
  let component: ControlBarComponent;
  let fixture: ComponentFixture<ControlBarComponent>;

  const mockContentService = jasmine.createSpyObj(['findContentsWithoutGroup']);

  const mockRoomStatsService = jasmine.createSpyObj(['getStats']);
  mockRoomStatsService.getStats.and.returnValue(of({}));

  const mockApiConfigService = jasmine.createSpyObj(['getApiConfig$']);
  const config = {
    ui: {
      links: {
        join: {
          url: 'joinUrl'
        }
      }
    }
  }
  mockApiConfigService.getApiConfig$.and.returnValue(of(config));

  const mockHotkeyService = jasmine.createSpyObj(['registerHotkey', 'unregisterHotkey']);

  const mockFeedbackService = jasmine.createSpyObj(['startSub']);
  mockFeedbackService.messageEvent = new EventEmitter<Message>();

  const mockContentGroupService = jasmine.createSpyObj(['isIndexPublished', 'patchContentGroup', 'getById']);
  mockContentGroupService.getById.and.returnValue(of(new ContentGroup()));

  const mockDialogService = jasmine.createSpyObj(['openPublishGroupDialog', 'openDeleteDialog']);

  const snapshot = new ActivatedRouteSnapshot();
  snapshot.params = {
    seriesName: 'Quiz'
  }

  const room = new Room();
  room.settings = {};
  const data = {
    room: room
  }
  const activatedRouteStub = new ActivatedRouteStub(null, data, snapshot);

  const splitShortIdPipe = new SplitShortIdPipe();

  const mockRoutingService = jasmine.createSpyObj(['getRoleString', 'getRouteChanges']);
  mockRoutingService.getRouteChanges.and.returnValue(of(snapshot));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ControlBarComponent,
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
          provide: RoomStatsService,
          useValue: mockRoomStatsService
        },
        {
          provide: FeedbackService,
          useValue: mockFeedbackService
        },
        {
          provide: ContentService,
          useValue: mockContentService
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
        },
        {
          provide: RoutingService,
          useValue: mockRoutingService
        },
        {
          provide: ApiConfigService,
          useValue: mockApiConfigService
        },
        {
          provide: HotkeyService,
          useValue: mockHotkeyService
        },
        {
          provide: DialogService,
          useValue: mockDialogService
        }
      ]
    })
    .compileComponents();
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
