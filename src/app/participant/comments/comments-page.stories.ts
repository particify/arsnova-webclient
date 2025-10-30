import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { of } from 'rxjs';
import { CommentsPageComponent } from '@app/participant/comments/comments-page.component';
import { CommentService } from '@app/core/services/http/comment.service';
import { Comment } from '@app/core/models/comment';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { WsCommentService } from '@app/core/services/websockets/ws-comment.service';
import { CommentSettingsService } from '@app/core/services/http/comment-settings.service';
import { VoteService } from '@app/core/services/http/vote.service';
import { FocusModeService } from '@app/participant/_services/focus-mode.service';
import { AuthenticatedUser } from '@app/core/models/authenticated-user';
import { CommentFocusState } from '@app/core/models/events/remote/comment-focus-state';
import { TrackingService } from '@app/core/services/util/tracking.service';
import { Room } from '@app/core/models/room';
import { CommentSettings } from '@app/core/models/comment-settings';
import { UserRole } from '@app/core/models/user-roles.enum';
import { RoomSettingsService } from '@app/core/services/http/room-settings.service';
import { LiveFeedbackType } from '@app/core/models/live-feedback-type.enum';

class MockCommentService {
  getAckComments() {
    return of([
      new Comment('roomId', 'creatorId', 'First comment'),
      new Comment('roomId', 'creatorId', 'Second comment'),
      new Comment('roomId', 'creatorId', 'Third comment'),
      new Comment('roomId', 'creatorId', 'Fourth comment'),
    ]);
  }

  filterCommentsByTimePeriod(comments: Comment[]) {
    return comments;
  }
  sortComments(comments: Comment[]) {
    return comments;
  }
}

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

class MockWsCommentService {
  getCommentStream() {
    return of({ body: '{ "payload": {} }' });
  }
}

class MockCommentSettingsService {
  getSettingsStream() {
    return of({});
  }
}

class MockRoomSettingsService {
  getByRoomId() {
    return of({
      surveyEnabled: true,
      surveyType: LiveFeedbackType.FEEDBACK,
      focusModeEnabled: false,
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
          provide: CommentService,
          useClass: MockCommentService,
        },
        {
          provide: AuthenticationService,
          useClass: MockAuthenticationService,
        },
        {
          provide: WsCommentService,
          useClass: MockWsCommentService,
        },
        {
          provide: CommentSettingsService,
          useClass: MockCommentSettingsService,
        },
        {
          provide: VoteService,
          useClass: MockService,
        },
        {
          provide: FocusModeService,
          useClass: MockFocusModeService,
        },
        {
          provide: TrackingService,
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

export const Participant: Story = {
  args: {
    room: new Room(),
    commentSettings: new CommentSettings('roomId', true, false, false, false),
    viewRole: UserRole.PARTICIPANT,
  },
};
