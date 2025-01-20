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
import { CommentService } from '@app/core/services/http/comment.service';
import { Comment } from '@app/core/models/comment';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { WsCommentService } from '@app/core/services/websockets/ws-comment.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { CommentSettingsService } from '@app/core/services/http/comment-settings.service';
import { VoteService } from '@app/core/services/http/vote.service';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { AuthProvider } from '@app/core/models/auth-provider';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { TrackingService } from '@app/core/services/util/tracking.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DialogService } from '@app/core/services/util/dialog.service';
import { LanguageService } from '@app/core/services/util/language.service';
import { CommentsPageComponent } from '@app/standalone/comments-presentation/comments-page.component';
import { RoutingService } from '@app/core/services/util/routing.service';
import { EventService } from '@app/core/services/util/event.service';
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
  component: CommentsPageComponent,
  title: 'CommentsPage',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [CommentsPageComponent, BrowserAnimationsModule],
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
          provide: HotkeyService,
          useClass: MockHotkeyService,
        },
        {
          provide: TrackingService,
          useClass: MockService,
        },
        {
          provide: DialogService,
          useClass: MockService,
        },
        {
          provide: LanguageService,
          useClass: MockLangService,
        },
        {
          provide: RoutingService,
          useClass: MockService,
        },
        {
          provide: EventService,
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
    applicationConfig({
      providers: [
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
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
