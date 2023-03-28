import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SurveyPageComponent } from './survey-page.component';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { NotificationService } from '@core/services/util/notification.service';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import {
  JsonTranslationLoader,
  MockNotificationService,
  ActivatedRouteStub,
  MockGlobalStorageService,
  MockEventService,
  MockAnnounceService,
} from '@testing/test-helpers';
import { of } from 'rxjs';
import { GlobalStorageService } from '@core/services/util/global-storage.service';
import { EventService } from '@core/services/util/event.service';
import { AnnounceService } from '@core/services/util/announce.service';
import { AuthenticationService } from '@core/services/http/authentication.service';
import { Room } from '@core/models/room';
import { NO_ERRORS_SCHEMA, EventEmitter } from '@angular/core';
import { UserRole } from '@core/models/user-roles.enum';
import { RoomService } from '@core/services/http/room.service';
import { MockLangService } from '@testing/test-helpers';
import { LanguageService } from '@core/services/util/language.service';
import { FeedbackService } from '@core/services/http/feedback.service';
import { Message } from '@stomp/stompjs';
import { WsFeedbackService } from '@core/services/websockets/ws-feedback.service';
import { HotkeyService } from '@core/services/util/hotkey.service';
import { ClientAuthentication } from '@core/models/client-authentication';
import { AuthProvider } from '@core/models/auth-provider';
import { A11yIntroPipe } from '@core/pipes/a11y-intro.pipe';
import { RemoteService } from '@core/services/util/remote.service';

describe('SurveyPageComponent', () => {
  let component: SurveyPageComponent;
  let fixture: ComponentFixture<SurveyPageComponent>;

  const mockRoomService = jasmine.createSpyObj([
    'getRoom',
    'changeFeedbackType',
    'changeFeedbackLocked',
  ]);

  const mockRoomStatsService = jasmine.createSpyObj(['getStats']);
  mockRoomStatsService.getStats.and.returnValue(of({}));

  const mockWsFeedbackService = jasmine.createSpyObj(['send', 'reset']);

  const mockHotkeyService = jasmine.createSpyObj([
    'registerHotkey',
    'unregisterHotkey',
  ]);

  const mockFeedbackService = jasmine.createSpyObj(['startSub', 'get']);
  mockFeedbackService.messageEvent = new EventEmitter<Message>();
  mockFeedbackService.get.and.returnValue(of([0, 0, 0, 0]));

  const mockAuthenticationService = jasmine.createSpyObj([
    'getCurrentAuthentication',
  ]);
  const auth = new ClientAuthentication(
    '1234',
    'a@b.cd',
    AuthProvider.ARSNOVA,
    'token'
  );
  mockAuthenticationService.getCurrentAuthentication.and.returnValue(of(auth));

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
  let translateService: TranslateService;
  const mockA11yIntroPipe = new A11yIntroPipe(translateService);

  const mockRemoteService = jasmine.createSpyObj(['getCommentState']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SurveyPageComponent, A11yIntroPipe],
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
          provide: HotkeyService,
          useValue: mockHotkeyService,
        },
        {
          provide: LanguageService,
          useClass: MockLangService,
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
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: A11yIntroPipe,
          useValue: mockA11yIntroPipe,
        },
        {
          provide: RemoteService,
          useValue: mockRemoteService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
