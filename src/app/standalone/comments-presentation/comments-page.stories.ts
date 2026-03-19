import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { of } from 'rxjs';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { WsCommentService } from '@app/core/services/websockets/ws-comment.service';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { AuthenticatedUser } from '@app/core/models/authenticated-user';
import { CommentsPageComponent } from '@app/standalone/comments-presentation/comments-page.component';
import { RoutingService } from '@app/core/services/util/routing.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { Room } from '@app/core/models/room';
import { UserRole } from '@app/core/models/user-roles.enum';
import { RoomSettingsService } from '@app/core/services/http/room-settings.service';
import { LiveFeedbackType } from '@app/core/models/live-feedback-type.enum';

class MockService {}

class MockAuthenticationService {
  getCurrentAuthentication() {
    return of(new AuthenticatedUser('userId', true, 'displayId'));
  }
}
class MockFocusModeService {
  updateCommentState() {}
}

class MockWsCommentService {
  getCommentStream() {
    return of({ body: '{ "payload": {} }' });
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
  component: CommentsPageComponent,
  title: 'CommentsPage',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [CommentsPageComponent],
      providers: [
        {
          provide: AuthenticationService,
          useClass: MockAuthenticationService,
        },
        {
          provide: WsCommentService,
          useClass: MockWsCommentService,
        },
        {
          provide: FocusModeService,
          useClass: MockFocusModeService,
        },
        {
          provide: RoutingService,
          useClass: MockService,
        },
        PresentationService,
        {
          provide: ContentService,
          useClass: MockService,
        },
        {
          provide: ContentGroupService,
          useClass: MockService,
        },
        {
          provide: RoomSettingsService,
          useClass: MockRoomSettingsService,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<CommentsPageComponent>;

export const Presentation: Story = {
  args: {
    room: new Room(),
    viewRole: UserRole.EDITOR,
    outlinedCards: false,
  },
};
