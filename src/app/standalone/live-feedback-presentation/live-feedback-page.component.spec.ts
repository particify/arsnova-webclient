import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveFeedbackPageComponent } from './live-feedback-page.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import {
  MockAnnounceService,
  MockEventService,
  MockGlobalStorageService,
  MockNotificationService,
} from '@testing/test-helpers';
import { of } from 'rxjs';
import { Message } from '@stomp/stompjs';
import { Room } from '@app/core/models/room';
import { RoomService } from '@app/core/services/http/room.service';
import { WsFeedbackService } from '@app/core/services/websockets/ws-feedback.service';
import { FeedbackService } from '@app/core/services/http/feedback.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { NotificationService } from '@app/core/services/util/notification.service';
import { CoreModule } from '@app/core/core.module';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { EventService } from '@app/core/services/util/event.service';

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
    'getType',
  ]);
  mockFeedbackService.messageEvent = new EventEmitter<Message>();
  mockFeedbackService.get.and.returnValue(of([0, 0, 0, 0]));

  const mockFocusModeService = jasmine.createSpyObj(['updateFeedbackState']);

  const mockHotkeyService = jasmine.createSpyObj([
    'registerHotkey',
    'unregisterHotkey',
  ]);

  const mockPresentationService = jasmine.createSpyObj('PresentationService', [
    'getFeedbackStarted',
  ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CoreModule,
        LoadingIndicatorComponent,
        getTranslocoModule(),
        LiveFeedbackPageComponent,
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
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
        {
          provide: FocusModeService,
          useValue: mockFocusModeService,
        },
        {
          provide: PresentationService,
          useValue: mockPresentationService,
        },
        {
          provide: EventService,
          useClass: MockEventService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LiveFeedbackPageComponent);
    component = fixture.componentInstance;
    component.room = new Room();
    component.room.settings = { feedbackLocked: true };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
