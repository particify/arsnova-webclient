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
import { ActivatedRoute } from '@angular/router';
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
import { MatButtonHarness } from '@angular/material/button/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { LiveFeedbackType } from '@app/core/models/live-feedback-type.enum';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { TrackingService } from '@app/core/services/util/tracking.service';
import { By } from '@angular/platform-browser';

describe('LiveFeedbackPageComponent', () => {
  let component: LiveFeedbackPageComponent;
  let fixture: ComponentFixture<LiveFeedbackPageComponent>;

  const mockRoomService = jasmine.createSpyObj('RoomService', [
    'getRoom',
    'changeFeedbackType',
    'changeFeedbackLock',
  ]);
  mockRoomService.changeFeedbackType
    .withArgs('roomId', LiveFeedbackType.FEEDBACK)
    .and.returnValue(LiveFeedbackType.SURVEY);
  mockRoomService.changeFeedbackType
    .withArgs('roomId', LiveFeedbackType.SURVEY)
    .and.returnValue(LiveFeedbackType.FEEDBACK);

  const mockWsFeedbackService = jasmine.createSpyObj('WsFeedbackService', [
    'reset',
  ]);

  const mockFeedbackService = jasmine.createSpyObj([
    'startSub',
    'get',
    'getType',
    'getAnswerSum',
    'getBarData',
  ]);
  mockFeedbackService.messageEvent = new EventEmitter<Message>();
  mockFeedbackService.get.and.returnValue(of([0, 0, 0, 0]));
  mockFeedbackService.getType.and.returnValue(LiveFeedbackType.FEEDBACK);

  const room = new Room();
  room.id = 'roomId';
  room.settings = {};
  const data = {
    room: room,
  };
  const activatedRouteStub = new ActivatedRouteStub(null, data, null);

  const mockRemoteService = jasmine.createSpyObj(['updateFeedbackStateChange']);

  const mockHotkeyService = jasmine.createSpyObj('HotkeyService', [
    'registerHotkey',
    'unregisterHotkey',
  ]);

  const mockTrackingService = jasmine.createSpyObj('TrackingService', [
    'addEvent',
  ]);

  let loader: HarnessLoader;
  let changeTypeButton: MatButtonHarness;
  let toggleFeedbackButton: MatButtonHarness;

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
        {
          provide: HotkeyService,
          useValue: mockHotkeyService,
        },
        {
          provide: TrackingService,
          useValue: mockTrackingService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(LiveFeedbackPageComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display both buttons if feedback is not started yet', async () => {
    component.isClosed = true;
    fixture.detectChanges();
    changeTypeButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#switch-button' })
    );
    toggleFeedbackButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#toggle-button' })
    );
    expect(changeTypeButton).not.toBeNull('Change type button should exist');
    expect(toggleFeedbackButton).not.toBeNull(
      'Toggle feedback button should exist'
    );
  });

  it('should hide change type button if feedback is started', () => {
    component.isClosed = false;
    fixture.detectChanges();
    const changeTypeButtonElement = fixture.debugElement.query(
      By.css('#switch-button')
    );
    expect(changeTypeButtonElement).toBeNull();
  });

  it('should show answer count if feedback is started', () => {
    component.isClosed = false;
    fixture.detectChanges();
    const changeTypeButtonElement = fixture.debugElement.query(
      By.css('#answer-count')
    );
    expect(changeTypeButtonElement).not.toBeNull();
  });

  it('should call service function if change type button has been clicked', async () => {
    component.isClosed = true;
    component.type = LiveFeedbackType.FEEDBACK;
    fixture.detectChanges();
    changeTypeButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#switch-button' })
    );
    await changeTypeButton.click();
    expect(mockRoomService.changeFeedbackType).toHaveBeenCalled();
  });

  it('should call service function if change type button has been clicked and reset if closed', async () => {
    component.isClosed = true;
    component.type = LiveFeedbackType.FEEDBACK;
    fixture.detectChanges();
    toggleFeedbackButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#toggle-button' })
    );
    await toggleFeedbackButton.click();
    expect(mockRoomService.changeFeedbackLock).toHaveBeenCalled();
    expect(mockWsFeedbackService.reset).toHaveBeenCalled();
  });
});
