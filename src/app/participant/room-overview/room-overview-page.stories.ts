import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { of } from 'rxjs';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { AuthenticatedUser } from '@app/core/models/authenticated-user';
import { RoomService } from '@app/core/services/http/room.service';
import { RoomOverviewPageComponent } from '@app/participant/room-overview/room-overview-page.component';
import { FocusModeService } from '@app/participant/_services/focus-mode.service';
import { CommentFocusState } from '@app/core/models/events/remote/comment-focus-state';
import { Room } from '@app/core/models/room';
import { UserRole } from '@app/core/models/user-roles.enum';
import { LiveFeedbackType } from '@app/core/models/live-feedback-type.enum';
import { RoomSettingsService } from '@app/core/services/http/room-settings.service';

class MockService {}

class MockAuthenticationService {
  getCurrentAuthentication() {
    return of(new AuthenticatedUser('userId', true, 'displayId'));
  }
}

class MockFocusModeService {
  getFocusModeEnabled() {
    return of(false);
  }
  getCommentState() {
    return of(new CommentFocusState('commentId'));
  }
}

class MockRoomSettingsService {
  getByRoomId() {
    return of({
      surveyEnabled: true,
      surveyType: LiveFeedbackType.FEEDBACK,
      commentThresholdEnabled: false,
    });
  }
}

export default {
  component: RoomOverviewPageComponent,
  title: 'RoomOverviewPage',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [RoomOverviewPageComponent],
      providers: [
        {
          provide: RoomService,
          useClass: MockService,
        },
        {
          provide: AuthenticationService,
          useClass: MockAuthenticationService,
        },
        {
          provide: FocusModeService,
          useClass: MockFocusModeService,
        },
        {
          provide: RoomSettingsService,
          useClass: MockRoomSettingsService,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<RoomOverviewPageComponent>;

const room = new Room(
  'ownerId',
  '12345678',
  '',
  'My awesome room',
  'This is my awesome room description.'
);

export const Participant: Story = {
  args: {
    roomId: 'roomId',
    shortId: '12345678',
    legacyRoom: room,
    viewRole: UserRole.PARTICIPANT,
  },
};
