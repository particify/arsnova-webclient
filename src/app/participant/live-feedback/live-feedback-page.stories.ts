import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { EventEmitter } from '@angular/core';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { AuthProvider } from '@app/core/models/auth-provider';
import { FeedbackService } from '@app/core/services/http/feedback.service';
import { WsFeedbackService } from '@app/core/services/websockets/ws-feedback.service';
import { LiveFeedbackPageComponent } from '@app/participant/live-feedback/live-feedback-page.component';
import { RoomService } from '@app/core/services/http/room.service';
import { LiveFeedbackType } from '@app/core/models/live-feedback-type.enum';
import { Message } from '@stomp/stompjs';
import { Room } from '@app/core/models/room';

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

export default {
  component: LiveFeedbackPageComponent,
  title: 'LiveFeedbackPage',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [LiveFeedbackPageComponent],
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
  ],
} as Meta;

type Story = StoryObj<LiveFeedbackPageComponent>;

const room = new Room();
room.settings = { feedbackLocked: false };

export const Participant: Story = {
  args: {
    room: room,
    showCard: true,
  },
};
