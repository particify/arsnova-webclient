import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { Observable, of } from 'rxjs';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { AuthProvider } from '@app/core/models/auth-provider';
import { RoomService } from '@app/core/services/http/room.service';
import { RoomOverviewPageComponent } from '@app/participant/room-overview/room-overview-page.component';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { CommentService } from '@app/core/services/http/comment.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { CommentSettingsService } from '@app/core/services/http/comment-settings.service';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { FocusModeService } from '@app/participant/_services/focus-mode.service';
import { CommentFocusState } from '@app/core/models/events/remote/comment-focus-state';
import { RoomStats } from '@app/core/models/room-stats';
import {
  ContentGroup,
  GroupType,
  PublishingMode,
} from '@app/core/models/content-group';
import { Room } from '@app/core/models/room';
import { UserRole } from '@app/core/models/user-roles.enum';
import { CommentSettings } from '@app/core/models/comment-settings';
import { LiveFeedbackType } from '@app/core/models/live-feedback-type.enum';
import { RoomSettingsService } from '@app/core/services/http/room-settings.service';

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

class MockRoomStatsService {
  getStats() {
    return of(
      new RoomStats(
        [
          {
            id: 'contentGroup1',
            groupName: 'Mixed series',
            contentCount: 5,
            groupType: GroupType.MIXED,
            published: true,
          },
        ],
        42,
        33,
        12,
        42
      )
    );
  }
}

class MockCommentService {
  countByRoomId() {
    return of(42);
  }
  getUpdatedCommentCountWithMessage(count: number) {
    return count;
  }
}

class MockContentGroupService {
  private typeIcons: Map<GroupType, string> = new Map<GroupType, string>([
    [GroupType.MIXED, 'dashboard'],
    [GroupType.QUIZ, 'sports_esports'],
    [GroupType.SURVEY, 'tune'],
    [GroupType.FLASHCARDS, 'school'],
  ]);
  getTypeIcons() {
    return this.typeIcons;
  }
  getByIds(): Observable<ContentGroup[]> {
    return of([
      new ContentGroup(
        'roomId1',
        'Mixed series',
        ['content1', 'content2', 'content3', 'content4', 'content5'],
        true,
        true,
        true,
        PublishingMode.ALL,
        0,
        GroupType.MIXED,
        false
      ),
    ]);
  }
  sortContentGroupsByName(): ContentGroup[] {
    return [
      new ContentGroup(
        'roomId1',
        'Mixed series',
        ['content1', 'content2', 'content3', 'content4', 'content5'],
        true,
        true,
        true,
        PublishingMode.ALL,
        0,
        GroupType.MIXED,
        false
      ),
    ];
  }
}

class MockCommentSettingsService {
  getSettingsStream() {
    return of({});
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
      focusModeEnabled: false,
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
          provide: RoomStatsService,
          useClass: MockRoomStatsService,
        },
        {
          provide: CommentService,
          useClass: MockCommentService,
        },
        {
          provide: ContentGroupService,
          useClass: MockContentGroupService,
        },
        {
          provide: CommentSettingsService,
          useClass: MockCommentSettingsService,
        },
        {
          provide: ContentPublishService,
          useClass: MockService,
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
    room: room,
    viewRole: UserRole.PARTICIPANT,
    commentSettings: new CommentSettings(),
  },
};
