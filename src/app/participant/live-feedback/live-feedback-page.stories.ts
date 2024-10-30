import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';

import { importProvidersFrom, EventEmitter } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { AuthProvider } from '@app/core/models/auth-provider';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { TrackingService } from '@app/core/services/util/tracking.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LanguageService } from '@app/core/services/util/language.service';
import { FeedbackService } from '@app/core/services/http/feedback.service';
import { WsFeedbackService } from '@app/core/services/websockets/ws-feedback.service';
import { LiveFeedbackPageComponent } from '@app/participant/live-feedback/live-feedback-page.component';
import { RoomService } from '@app/core/services/http/room.service';
import { LiveFeedbackType } from '@app/core/models/live-feedback-type.enum';
import { Message } from '@stomp/stompjs';

class MockFeedbackService {
  messageEvent = new EventEmitter<Message>();

  getType(): LiveFeedbackType {
    return LiveFeedbackType.FEEDBACK;
  }

  startSub() {}

  get() {
    return of([42, 24, 13, 7]);
  }

  getAnswerSum() {
    return 86;
  }

  getBarData(data: number[], sum: number): number[] {
    return data.map((d) => (d / sum) * 100);
  }
}

class MockService {}
class MockGlobalStorageService {
  getItem() {}
  setItem() {}
}
class MockAuthenticationService {
  getCurrentAuthentication() {
    return of(
      new ClientAuthentication(
        'userId',
        'loginid',
        AuthProvider.ARSNOVA,
        'token'
      )
    );
  }
}

class MockWsFeedbackService {}

class MockHotkeyService {
  registerHotkey() {}
}

class MockLangService {
  langEmitter = new EventEmitter<string>();
  ensureValidLang(lang: string): string {
    return lang;
  }
}

export default {
  component: LiveFeedbackPageComponent,
  title: 'LiveFeedbackPage',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [LiveFeedbackPageComponent, BrowserAnimationsModule],
      providers: [
        {
          provide: FeedbackService,
          useClass: MockFeedbackService,
        },
        {
          provide: RoomService,
          useClass: MockService,
        },
        {
          provide: AuthenticationService,
          useClass: MockAuthenticationService,
        },
        {
          provide: WsFeedbackService,
          useClass: MockWsFeedbackService,
        },
        {
          provide: NotificationService,
          useClass: MockService,
        },
        {
          provide: AnnounceService,
          useClass: MockService,
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
        {
          provide: HotkeyService,
          useClass: MockHotkeyService,
        },
        {
          provide: TrackingService,
          useClass: MockService,
        },
        {
          provide: LanguageService,
          useClass: MockLangService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({
              room: { id: 'roomId', settings: {} },
              commentSettings: {
                directSend: true,
                fileUploadEnabled: false,
                disabled: false,
                readonly: false,
              },
            }),
            snapshot: {
              data: {
                room: { id: 'roomId', settings: {} },
                commentSettings: {
                  directSend: true,
                  fileUploadEnabled: false,
                  disabled: false,
                  readonly: false,
                },
              },
            },
          },
        },
      ],
    }),
    applicationConfig({
      providers: [
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<LiveFeedbackPageComponent>;

export const Participant: Story = {};
