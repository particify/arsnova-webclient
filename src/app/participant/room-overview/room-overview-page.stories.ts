import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';

import { importProvidersFrom, EventEmitter } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { Observable, of } from 'rxjs';
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
import { RoomService } from '@app/core/services/http/room.service';
import { RoomOverviewPageComponent } from '@app/participant/room-overview/room-overview-page.component';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { CommentService } from '@app/core/services/http/comment.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { EventService } from '@app/core/services/util/event.service';
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
import { ENVIRONMENT } from '@environments/environment-token';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { ApiConfig } from '@app/core/models/api-config';
import { Room } from '@app/core/models/room';
import { UserRole } from '@app/core/models/user-roles.enum';
import { CommentSettings } from '@app/core/models/comment-settings';

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

class MockHotkeyService {
  registerHotkey() {}
}

class MockLangService {
  langEmitter = new EventEmitter<string>();
  ensureValidLang(lang: string): string {
    return lang;
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

class MockEventService {
  on() {
    return of({});
  }
}

class MockApiConfigService {
  getApiConfig$() {
    return of(new ApiConfig([], {}, {}));
  }
}

export default {
  component: RoomOverviewPageComponent,
  title: 'RoomOverviewPage',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [RoomOverviewPageComponent, BrowserAnimationsModule],
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
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: ContentPublishService,
          useClass: MockService,
        },
        {
          provide: FocusModeService,
          useClass: MockFocusModeService,
        },
      ],
    }),
    applicationConfig({
      providers: [
        {
          provide: ApiConfigService,
          useClass: MockApiConfigService,
        },
        {
          provide: ENVIRONMENT,
          useValue: { features: [] },
        },
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
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
room.settings = { feedbackLocked: false };

export const Participant: Story = {
  args: {
    room: room,
    viewRole: UserRole.PARTICIPANT,
    commentSettings: new CommentSettings(),
  },
};
