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
import { RoomService } from '@app/core/services/http/room.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { EventService } from '@app/core/services/util/event.service';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { FocusModeService } from '@app/participant/_services/focus-mode.service';
import { CommentFocusState } from '@app/core/models/events/remote/comment-focus-state';
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
import { SeriesOverviewComponent } from '@app/participant/series-overview/series-overview.component';
import { ThemeService } from '@app/core/theme/theme.service';
import { ContentCarouselService } from '@app/core/services/util/content-carousel.service';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { Content } from '@app/core/models/content';
import { ContentType } from '@app/core/models/content-type.enum';
import {
  AnswerResultOverview,
  AnswerResultType,
} from '@app/core/models/answer-result';
import { ContentChoice } from '@app/core/models/content-choice';
import { AnswerOption } from '@app/core/models/answer-option';
import { ContentScale } from '@app/core/models/content-scale';
import { ContentWordcloud } from '@app/core/models/content-wordcloud';
import { LikertScaleTemplate } from '@app/core/models/likert-scale-template.enum';
import { ContentState } from '@app/core/models/content-state';
import { MaterialCssVarsService } from 'angular-material-css-vars';

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

class MockContentGroupService {
  getLeaderboard() {
    return of([
      {
        userAlias: { id: '1', alias: 'Happy Hippo', seed: 1 },
        score: 1942,
      },
      {
        userAlias: { id: '2', alias: 'Funny Cow', seed: 2 },
        score: 1832,
      },
      {
        userAlias: { id: '3', alias: 'Silent Panda', seed: 3 },
        score: 1813,
      },
      {
        userAlias: { id: '4', alias: 'Curious Turtle', seed: 4 },
        score: 1795,
      },
      {
        userAlias: { id: '5', alias: 'Reliable Rhino', seed: 5 },
        score: 1753,
      },
      {
        userAlias: { id: '6', alias: 'Smart Starfish', seed: 6 },
        score: 1700,
      },
      {
        userAlias: { id: '7', alias: 'Ambitious Amadillo', seed: 7 },
        score: 1200,
      },
      {
        userAlias: { id: '8', alias: 'This is my awesome name', seed: 8 },
        score: 1111,
      },
      {
        userAlias: { id: '9', alias: 'I made it', seed: 9 },
        score: 987,
      },
      {
        userAlias: { id: '10', alias: '10th! wohoo!', seed: 10 },
        score: 985,
      },
      {
        userAlias: {
          id: '11',
          alias: 'I should not made it to the board',
          seed: 11,
        },
        score: 897,
      },
      {
        userAlias: { id: '12', alias: 'Crazy Frog', seed: 12 },
        score: 789,
      },
      {
        userAlias: { id: '13', alias: 'This is another player', seed: 13 },
        score: 665,
      },
    ]);
  }

  getAnswerStats(roomId: string, groupId: string) {
    const answerStats = new AnswerResultOverview();
    if (roomId === 'roomId') {
      switch (groupId) {
        case 'mixedGroupId':
          {
            answerStats.achievedScore = 500;
            answerStats.answerResults = [
              {
                contentId: 'content1',
                achievedPoints: 0,
                maxPoints: 0,
                duration: 0,
                state: AnswerResultType.NEUTRAL,
              },
              {
                contentId: 'content2',
                achievedPoints: 500,
                maxPoints: 500,
                duration: 0,
                state: AnswerResultType.CORRECT,
              },
              {
                contentId: 'content3',
                achievedPoints: 0,
                maxPoints: 0,
                duration: 0,
                state: AnswerResultType.NEUTRAL,
              },
              {
                contentId: 'content4',
                achievedPoints: 0,
                maxPoints: 0,
                duration: 0,
                state: AnswerResultType.UNANSWERED,
              },
            ];
            answerStats.correctAnswerCount = 1;
            answerStats.maxScore = 500;
            answerStats.scorableContentCount = 1;
          }
          break;
        case 'quizGroupId':
          {
            answerStats.achievedScore = 2000;
            answerStats.answerResults = [
              {
                contentId: 'content1',
                achievedPoints: 500,
                maxPoints: 500,
                duration: 0,
                state: AnswerResultType.CORRECT,
              },
              {
                contentId: 'content2',
                achievedPoints: 500,
                maxPoints: 500,
                duration: 0,
                state: AnswerResultType.CORRECT,
              },
              {
                contentId: 'content3',
                achievedPoints: 500,
                maxPoints: 500,
                duration: 0,
                state: AnswerResultType.CORRECT,
              },
              {
                contentId: 'content4',
                achievedPoints: 0,
                maxPoints: 253,
                duration: 0,
                state: AnswerResultType.CORRECT,
              },
            ];
            answerStats.correctAnswerCount = 3;
            answerStats.maxScore = 2000;
            answerStats.scorableContentCount = 4;
          }
          break;
        case 'surveyGroupId': {
          answerStats.achievedScore = 0;
          answerStats.answerResults = [
            {
              contentId: 'content1',
              achievedPoints: 0,
              maxPoints: 0,
              duration: 0,
              state: AnswerResultType.NEUTRAL,
            },
            {
              contentId: 'content2',
              achievedPoints: 0,
              maxPoints: 0,
              duration: 0,
              state: AnswerResultType.NEUTRAL,
            },
            {
              contentId: 'content3',
              achievedPoints: 0,
              maxPoints: 0,
              duration: 0,
              state: AnswerResultType.UNANSWERED,
            },
            {
              contentId: 'content4',
              achievedPoints: 0,
              maxPoints: 0,
              duration: 0,
              state: AnswerResultType.UNANSWERED,
            },
          ];
          answerStats.correctAnswerCount = 0;
          answerStats.maxScore = 0;
          answerStats.scorableContentCount = 0;
        }
      }
    }
    return of(answerStats);
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

class MockRoutingService {
  getRoomJoinUrl() {
    return 'join-url';
  }
}

class MockApiConfigService {
  getApiConfig$() {
    return of(new ApiConfig([], {}, {}));
  }
}

class MockFormattingService {}

class MockContentCarouselService {
  isLastContentAnswered() {
    return false;
  }
  setLastContentAnswered() {}
}

class MockContentAnswerService {
  getAnswerResultIcon(state: AnswerResultType) {
    switch (state) {
      case AnswerResultType.CORRECT:
        return 'check';
      case AnswerResultType.WRONG:
        return 'close';
      case AnswerResultType.UNANSWERED:
        return 'horizontal_rule';
      default:
        return 'fiber_manual_record';
    }
  }
}

class MockMaterialCssVarsService {
  setDarkTheme() {}
  setPrimaryColor() {}
  setAccentColor() {}
  setWarnColor() {}
}

export default {
  component: SeriesOverviewComponent,
  title: 'ParticipantSeriesOverview',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [SeriesOverviewComponent, BrowserAnimationsModule],
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
          useClass: MockService,
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
        ThemeService,
        {
          provide: MaterialCssVarsService,
          useClass: MockMaterialCssVarsService,
        },
        {
          provide: ContentCarouselService,
          useClass: MockContentCarouselService,
        },
        {
          provide: ContentAnswerService,
          useClass: MockContentAnswerService,
        },
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
        {
          provide: AuthenticationService,
          useClass: MockAuthenticationService,
        },
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

type Story = StoryObj<SeriesOverviewComponent>;

const mixedGroup = new ContentGroup(
  'roomId',
  'Mixed series',
  ['content1', 'content2', 'content3', 'content4', 'content5'],
  true,
  true,
  true,
  PublishingMode.ALL,
  0,
  GroupType.MIXED,
  false
);
mixedGroup.id = 'mixedGroupId';

const mixedContents = [
  new Content('roomId', 'subject', 'Content 1', [], ContentType.TEXT),
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

mixedContents[0].id = 'content1';
mixedContents[1].id = 'content2';
mixedContents[2].id = 'content3';
mixedContents[3].id = 'content4';
mixedContents[0].renderedBody = '<p>Content 1</p>';
mixedContents[1].renderedBody = '<p>Content 2</p>';
mixedContents[2].renderedBody = '<p>Content 3</p>';
mixedContents[3].renderedBody = '<p>Content 4</p>';
mixedContents[0].state = new ContentState(1, undefined, true);
mixedContents[1].state = new ContentState(1, undefined, true);
mixedContents[2].state = new ContentState(1, undefined, true);
mixedContents[3].state = new ContentState(1, undefined, true);

export const Mixed: Story = {
  args: {
    group: mixedGroup,
    contents: mixedContents,
    finished: true,
  },
};

const quizGroup = new ContentGroup(
  'roomId',
  'Mixed series',
  ['content1', 'content2', 'content3', 'content4', 'content5'],
  true,
  true,
  true,
  PublishingMode.ALL,
  0,
  GroupType.QUIZ,
  true
);
quizGroup.id = 'quizGroupId';

const quizContents = [
  new ContentChoice(
    'roomId',
    'subject',
    'Content 1',
    [],
    [
      new AnswerOption('Answer 1'),
      new AnswerOption('Answer 2'),
      new AnswerOption('Answer 3'),
      new AnswerOption('Answer 4'),
    ],
    [0, 2],
    true,
    ContentType.CHOICE
  ),
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
  new ContentChoice(
    'roomId',
    'subject',
    'Content 3',
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
  new ContentChoice(
    'roomId',
    'subject',
    'Content 4',
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
];

quizContents[0].id = 'content1';
quizContents[1].id = 'content2';
quizContents[2].id = 'content3';
quizContents[3].id = 'content4';
quizContents[0].renderedBody = '<p>Content 1</p>';
quizContents[1].renderedBody = '<p>Content 2</p>';
quizContents[2].renderedBody = '<p>Content 3</p>';
quizContents[3].renderedBody = '<p>Content 4</p>';
quizContents[0].state = new ContentState(1, undefined, true);
quizContents[1].state = new ContentState(1, undefined, true);
quizContents[2].state = new ContentState(1, undefined, true);
quizContents[3].state = new ContentState(1, undefined, true);

export const Quiz: Story = {
  args: {
    group: quizGroup,
    contents: quizContents,
    finished: true,
    alias: { id: '5', alias: 'Reliable Rhino', seed: 5 },
  },
};

const surveyGroup = new ContentGroup(
  'roomId',
  'Survey series',
  ['content1', 'content2', 'content3', 'content4', 'content5'],
  true,
  true,
  true,
  PublishingMode.ALL,
  0,
  GroupType.MIXED,
  false
);
surveyGroup.id = 'surveyGroupId';

const surveyContents = [
  new Content('roomId', 'subject', 'Content 1', [], ContentType.TEXT),
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
    [],
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

surveyContents[0].id = 'content1';
surveyContents[1].id = 'content2';
surveyContents[2].id = 'content3';
surveyContents[3].id = 'content4';
surveyContents[0].renderedBody = '<p>Content 1</p>';
surveyContents[1].renderedBody = '<p>Content 2</p>';
surveyContents[2].renderedBody = '<p>Content 3</p>';
surveyContents[3].renderedBody = '<p>Content 4</p>';
surveyContents[0].state = new ContentState(1, undefined, true);
surveyContents[1].state = new ContentState(1, undefined, true);
surveyContents[2].state = new ContentState(1, undefined, true);
surveyContents[3].state = new ContentState(1, undefined, true);

export const Survey: Story = {
  args: {
    group: surveyGroup,
    contents: surveyContents,
    finished: false,
  },
};
