import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveFeedbackPageComponent } from './live-feedback-page.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
  ActivatedRouteStub,
  JsonTranslationLoader,
  MockAnnounceService,
  MockGlobalStorageService,
  MockNotificationService,
} from '@testing/test-helpers';
import { of } from 'rxjs';
import { Message } from '@stomp/stompjs';
import { Room } from '@app/core/models/room';
import { UserRole } from '@app/core/models/user-roles.enum';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { RoomService } from '@app/core/services/http/room.service';
import { WsFeedbackService } from '@app/core/services/websockets/ws-feedback.service';
import { FeedbackService } from '@app/core/services/http/feedback.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { RemoteService } from '@app/core/services/util/remote.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { CoreModule } from '@app/core/core.module';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { HotkeyService } from '@app/core/services/util/hotkey.service';

describe('LiveFeedbackPageComponent', () => {
  let component: LiveFeedbackPageComponent;
  let fixture: ComponentFixture<LiveFeedbackPageComponent>;

  const mockRoomService = jasmine.createSpyObj('RoomService', [
    'getRoom',
    'changeFeedbackType',
    'changeFeedbackLock',
  ]);

  const mockWsFeedbackService = jasmine.createSpyObj('WsFeedbackService', [
    'reset',
  ]);

  const mockFeedbackService = jasmine.createSpyObj('FeedbackService', [
    'startSub',
    'get',
  ]);
  mockFeedbackService.messageEvent = new EventEmitter<Message>();
  mockFeedbackService.get.and.returnValue(of([0, 0, 0, 0]));

  const room = new Room();
  room.settings = {};
  const data = {
    room: room,
    viewRole: UserRole.PARTICIPANT,
  };
  const snapshot = new ActivatedRouteSnapshot();
  snapshot.data = {
    isPresentation: false,
  };
  const activatedRouteStub = new ActivatedRouteStub(null, data, snapshot);

  const mockRemoteService = jasmine.createSpyObj(['updateFeedbackStateChange']);

  const mockHotkeyService = jasmine.createSpyObj([
    'registerHotkey',
    'unregisterHotkey',
  ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LiveFeedbackPageComponent],
      imports: [
        CoreModule,
        LoadingIndicatorComponent,
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
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: HotkeyService,
          useValue: mockHotkeyService,
        },

        {
          provide: RoomService,
          useValue: mockRoomService,
        },
        {
          provide: WsFeedbackService,
          useValue: mockWsFeedbackService,
        },
        {
          provide: FeedbackService,
          useValue: mockFeedbackService,
        },
        {
          provide: AnnounceService,
          useClass: MockAnnounceService,
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
          provide: RemoteService,
          useValue: mockRemoteService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LiveFeedbackPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
