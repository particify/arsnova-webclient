import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveFeedbackPageComponent } from './live-feedback-page.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
  ActivatedRouteStub,
  JsonTranslationLoader,
  MockAnnounceService,
  MockGlobalStorageService,
} from '@testing/test-helpers';
import { of } from 'rxjs';
import { Message } from '@stomp/stompjs';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { AuthProvider } from '@app/core/models/auth-provider';
import { Room } from '@app/core/models/room';
import { UserRole } from '@app/core/models/user-roles.enum';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { RoomService } from '@app/core/services/http/room.service';
import { WsFeedbackService } from '@app/core/services/websockets/ws-feedback.service';
import { FeedbackService } from '@app/core/services/http/feedback.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { LiveFeedbackType } from '@app/core/models/live-feedback-type.enum';
import { MatIconHarness } from '@angular/material/icon/testing';

describe('LiveFeedbackPageComponent', () => {
  let component: LiveFeedbackPageComponent;
  let fixture: ComponentFixture<LiveFeedbackPageComponent>;

  const mockRoomService = jasmine.createSpyObj('RoomService', ['getRoom']);

  const mockWsFeedbackService = jasmine.createSpyObj('WsFeedbackService', [
    'send',
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

  const mockAuthenticationService = jasmine.createSpyObj([
    'getCurrentAuthentication',
  ]);
  const auth = new ClientAuthentication(
    'userId',
    'a@b.cd',
    AuthProvider.ARSNOVA,
    'token'
  );
  mockAuthenticationService.getCurrentAuthentication.and.returnValue(of(auth));

  const room = new Room();
  room.id = 'roomId';
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

  const mockHotkeyService = jasmine.createSpyObj([
    'registerHotkey',
    'unregisterHotkey',
  ]);

  let loader: HarnessLoader;
  let answerButton1: MatButtonHarness;
  let answerButton2: MatButtonHarness;
  let answerButton3: MatButtonHarness;
  let answerButton4: MatButtonHarness;

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
          provide: RoomService,
          useValue: mockRoomService,
        },
        {
          provide: HotkeyService,
          useValue: mockHotkeyService,
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
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
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

  it('should display 4 answer buttons', async () => {
    answerButton1 = await loader.getHarness(
      MatButtonHarness.with({ selector: '#survey-button-0' })
    );
    answerButton2 = await loader.getHarness(
      MatButtonHarness.with({ selector: '#survey-button-1' })
    );
    answerButton3 = await loader.getHarness(
      MatButtonHarness.with({ selector: '#survey-button-2' })
    );
    answerButton4 = await loader.getHarness(
      MatButtonHarness.with({ selector: '#survey-button-3' })
    );
    expect(answerButton1).not.toBeNull('Answer button 1 should exist');
    expect(answerButton2).not.toBeNull('Answer button 2 should exist');
    expect(answerButton3).not.toBeNull('Answer button 3 should exist');
    expect(answerButton4).not.toBeNull('Answer button 4 should exist');
  });

  it('should send answer when button clicked', async () => {
    answerButton1 = await loader.getHarness(
      MatButtonHarness.with({ selector: '#survey-button-0' })
    );
    await answerButton1.click();
    expect(mockWsFeedbackService.send).toHaveBeenCalledWith(
      'userId',
      0,
      'roomId'
    );
  });

  it('should use answer labels if type is survey', async () => {
    component.type = LiveFeedbackType.SURVEY;
    fixture.detectChanges();
    answerButton1 = await loader.getHarness(
      MatButtonHarness.with({ selector: '#survey-button-0' })
    );
    const text = await answerButton1.getText();
    expect(text).toBe('A');
  });

  it('should use icons as answer labels if type is feedback', async () => {
    component.type = LiveFeedbackType.FEEDBACK;
    fixture.detectChanges();
    answerButton1 = await loader.getHarness(
      MatButtonHarness.with({ selector: '#survey-button-0' })
    );
    const icons = await answerButton1.getAllHarnesses(MatIconHarness);
    const iconName = await icons[0].getName();
    expect(iconName).toBe('sentiment_very_satisfied');
  });
});
