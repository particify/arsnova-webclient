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
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { AuthProvider } from '@app/core/models/auth-provider';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { TrackingService } from '@app/core/services/util/tracking.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LanguageService } from '@app/core/services/util/language.service';
import { RoomService } from '@app/core/services/http/room.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { EventService } from '@app/core/services/util/event.service';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import {
  ContentGroup,
  GroupType,
  PublishingMode,
} from '@app/core/models/content-group';
import { RoutingService } from '@app/core/services/util/routing.service';
import { ENVIRONMENT } from '@environments/environment-token';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { ApiConfig } from '@app/core/models/api-config';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { ThemeService } from '@app/core/theme/theme.service';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { Content } from '@app/core/models/content';
import { ContentType } from '@app/core/models/content-type.enum';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentFocusState } from '@app/core/models/events/remote/content-focus-state';
import { ContentState } from '@app/core/models/content-state';
import { ContentChoice } from '@app/core/models/content-choice';
import { AnswerOption } from '@app/core/models/answer-option';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { ContentScale } from '@app/core/models/content-scale';
import { LikertScaleTemplate } from '@app/core/models/likert-scale-template.enum';
import { ContentWordcloud } from '@app/core/models/content-wordcloud';
import { ContentsPageComponent } from '@app/standalone/content-presentation/contents-page.component';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { UserService } from '@app/core/services/http/user.service';
import { UserSettings } from '@app/core/models/user-settings';
import { DialogService } from '@app/core/services/util/dialog.service';
import { MaterialCssVarsService } from 'angular-material-css-vars';
import { RoundStatistics } from '@app/core/models/round-statistics';
import { AnswerStatistics } from '@app/core/models/answer-statistics';

class MockService {}
class MockGlobalStorageService {
  getItem(key: symbol) {
    if (key === STORAGE_KEYS.USER) {
      return 'loginId';
    }
  }
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

class MockContentGroupService {
  getByRoomIdAndName() {
    return of(
      new ContentGroup(
        'roomId',
        'My mixed series',
        ['content1', 'content2', 'content3', 'content4', 'content5'],
        true,
        true,
        true,
        PublishingMode.ALL,
        0,
        GroupType.MIXED,
        false
      )
    );
  }

  getAttributions() {
    return of([]);
  }
}

class MockFocusModeService {
  getFocusModeEnabled() {
    return of(false);
  }
  getContentState() {
    return of(
      new ContentFocusState('content1', 0, 'groupId', 'My mixed series')
    );
  }
  updateContentState() {}
}

class MockEventService {
  on() {
    return of({});
  }
}

class MockRoutingService {
  getRoomJoinUrl() {
    return 'join-url';
  }

  getRouteChanges() {
    return of({});
  }
}

class MockApiConfigService {
  getApiConfig$() {
    return of(new ApiConfig([], {}, {}));
  }
}

class MockFormattingService {}

class MockContentService {
  private contents: Content[] = [
    new ContentChoice(
      'roomId',
      'subject',
      'Content 2',
      [],
      [
        new AnswerOption('Answer 1'),
        new AnswerOption('Answer 2'),
        new AnswerOption('Answer 3'),
        new AnswerOption('Answer 4'),
      ],
      [1],
      false,
      ContentType.CHOICE
    ),
    new ContentScale(LikertScaleTemplate.AGREEMENT, 5),
    new ContentWordcloud(
      'roomId',
      'subject',
      'Content 4',
      [],
      ContentType.WORDCLOUD,
      3
    ),
  ];

  getContentsByIds() {
    this.contents[0].id = 'content1';
    this.contents[1].id = 'content2';
    this.contents[2].id = 'content3';
    this.contents[0].renderedBody = '<p>Content 1</p>';
    this.contents[1].renderedBody = '<p>Content 2</p>';
    this.contents[2].renderedBody = '<p>Content 3</p>';
    this.contents[0].state = new ContentState(1, undefined, true);
    this.contents[1].state = new ContentState(1, undefined, true);
    this.contents[2].state = new ContentState(1, undefined, true);
    return of(this.contents);
  }

  getSupportedContents() {
    this.contents[0].id = 'content1';
    this.contents[1].id = 'content2';
    this.contents[2].id = 'content3';
    this.contents[0].renderedBody = '<p>Content 1</p>';
    this.contents[1].renderedBody = '<p>Content 2</p>';
    this.contents[2].renderedBody = '<p>Content 3</p>';
    this.contents[0].state = new ContentState(1, undefined, true);
    this.contents[1].state = new ContentState(1, undefined, true);
    this.contents[2].state = new ContentState(1, undefined, true);
    return this.contents;
  }

  getAnswersDeleted() {
    return of({});
  }

  hasFormatRounds() {
    return false;
  }

  getAnswer(contentId: string) {
    const roundStatistics = new RoundStatistics(1, [1, 5, 2, 3], [], 0, 11);
    const stats = new AnswerStatistics();
    stats.contentId = contentId;
    stats.roundStatistics = [roundStatistics];
    return of(stats);
  }

  getTextAnswerCreatedStream(contentId: string) {
    const roundStatistics = new RoundStatistics(1, [1, 5, 2, 3], [], 0, 11);
    const stats = new AnswerStatistics();
    stats.contentId = contentId;
    stats.roundStatistics = [roundStatistics];
    const body = {
      payload: {
        stats: stats,
      },
    };
    const message = {
      body: JSON.stringify(body),
    };
    return of(message);
  }

  getAnswersChangedStream(contentId: string) {
    const roundStatistics = new RoundStatistics(1, [1, 5, 2, 3], [], 0, 11);
    const stats = new AnswerStatistics();
    stats.contentId = contentId;
    stats.roundStatistics = [roundStatistics];
    const body = {
      payload: {
        stats: stats,
      },
    };
    const message = {
      body: JSON.stringify(body),
    };
    return of(message);
  }

  getAnswerBanned() {
    return of({});
  }
}

class MockContentPublishService {
  filterPublishedIds() {
    return ['content1', 'content2', 'content3', 'content4'];
  }

  isIndexPublished() {
    return true;
  }

  isGroupLive() {
    return false;
  }

  isGroupLocked() {
    return false;
  }
}

class MockUserService {
  getUserSettingsByLoginId() {
    return of(new UserSettings(false, true, true));
  }
}

class MockContentAnswerService {
  getAnswers() {
    return of([]);
  }
}

class MockMaterialCssVarsService {
  setDarkTheme() {}
  setPrimaryColor() {}
  setAccentColor() {}
  setWarnColor() {}
}

export default {
  component: ContentsPageComponent,
  title: 'ContentsPage',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentsPageComponent, BrowserAnimationsModule],
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
          provide: ContentGroupService,
          useClass: MockContentGroupService,
        },
        {
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: ContentPublishService,
          useClass: MockContentPublishService,
        },
        {
          provide: FocusModeService,
          useClass: MockFocusModeService,
        },
        {
          provide: RoutingService,
          useClass: MockRoutingService,
        },
        {
          provide: FormattingService,
          useClass: MockFormattingService,
        },
        {
          provide: ContentService,
          useClass: MockContentService,
        },
        {
          provide: UserService,
          useClass: MockUserService,
        },
        {
          provide: ContentAnswerService,
          useClass: MockContentAnswerService,
        },
        {
          provide: DialogService,
          useClass: MockService,
        },
        {
          provide: MaterialCssVarsService,
          useClass: MockMaterialCssVarsService,
        },
        LikertScaleService,
        PresentationService,
        ThemeService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                apiConfig: { ui: {} },
                room: {
                  id: 'roomId',
                  name: 'My awesome room',
                  shortId: '12345678',
                  description: 'This is my awesome room description.',
                  settings: {},
                },
                contentGroup: new ContentGroup(
                  'roomId',
                  'My mixed series',
                  ['content1', 'content2', 'content3', 'content4'],
                  true,
                  true,
                  true,
                  PublishingMode.ALL,
                  0,
                  GroupType.MIXED,
                  false
                ),
              },
              params: {
                contentIndex: 1,
                seriesName: 'My mixed series',
              },
              queryParams: {},
            },
          },
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

type Story = StoryObj<ContentsPageComponent>;

export const ContentsPagePresentation: Story = {};
