import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { of } from 'rxjs';
import { CommentService } from '@app/core/services/http/comment.service';
import { Comment } from '@app/core/models/comment';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { WsCommentService } from '@app/core/services/websockets/ws-comment.service';
import { CommentSettingsService } from '@app/core/services/http/comment-settings.service';
import { VoteService } from '@app/core/services/http/vote.service';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { AuthProvider } from '@app/core/models/auth-provider';
import { CommentsPageComponent } from '@app/standalone/comments-presentation/comments-page.component';
import { RoutingService } from '@app/core/services/util/routing.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { Room } from '@app/core/models/room';
import { CommentSettings } from '@app/core/models/comment-settings';
import { UserRole } from '@app/core/models/user-roles.enum';

class MockCommentService {
  getAckComments() {
    return of([
      new Comment('roomId', 'creatorId', 'First comment'),
      new Comment('roomId', 'creatorId', 'Second comment'),
      new Comment('roomId', 'creatorId', 'Third comment'),
      new Comment('roomId', 'creatorId', 'Fourth comment'),
    ]);
  }
  highlight() {
    return of();
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
class MockFocusModeService {
  updateCommentState() {}
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
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<CommentsPageComponent>;

export const Presentation: Story = {
  args: {
    room: new Room(),
    commentSettings: new CommentSettings('roomId', true, false, false, false),
    viewRole: UserRole.EDITOR,
    outlinedCards: false,
  },
};
