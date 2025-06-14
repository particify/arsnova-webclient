import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { AuthProvider } from '@app/core/models/auth-provider';
import { RoomService } from '@app/core/services/http/room.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { FocusModeService } from '@app/participant/_services/focus-mode.service';
import {
  ContentGroup,
  GroupType,
  PublishingMode,
} from '@app/core/models/content-group';
import { RoutingService } from '@app/core/services/util/routing.service';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { ThemeService } from '@app/core/theme/theme.service';
import { ContentCarouselService } from '@app/core/services/util/content-carousel.service';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { Content } from '@app/core/models/content';
import { ContentType } from '@app/core/models/content-type.enum';
import {
  AnswerResultOverview,
  AnswerResultType,
} from '@app/core/models/answer-result';
import { ParticipantContentCarouselPageComponent } from '@app/participant/participant-content-carousel-page/participant-content-carousel-page.component';
import { ContentService } from '@app/core/services/http/content.service';
import { RoomUserAliasService } from '@app/core/services/http/room-user-alias.service';
import { ContentFocusState } from '@app/core/models/events/remote/content-focus-state';
import { ContentState } from '@app/core/models/content-state';
import { ContentChoice } from '@app/core/models/content-choice';
import { AnswerOption } from '@app/core/models/answer-option';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { ContentScale } from '@app/core/models/content-scale';
import { LikertScaleTemplate } from '@app/core/models/likert-scale-template.enum';
import { ContentWordcloud } from '@app/core/models/content-wordcloud';
import { Room } from '@app/core/models/room';

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

class MockContentGroupService {
  getAnswerStats() {
    const answerStats = new AnswerResultOverview();
    answerStats.achievedScore = 0;
    answerStats.answerResults = [
      {
        contentId: 'content1',
        achievedPoints: 0,
        maxPoints: 0,
        duration: 0,
        state: AnswerResultType.UNANSWERED,
      },
      {
        contentId: 'content2',
        achievedPoints: 0,
        maxPoints: 500,
        duration: 0,
        state: AnswerResultType.UNANSWERED,
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
    answerStats.maxScore = 500;
    answerStats.scorableContentCount = 1;
    return of(answerStats);
  }

  getAttributions() {
    return of([]);
  }

  getChangesStreamForEntity() {
    return of({});
  }

  getById() {
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
}

class MockRoutingService {
  getRoomJoinUrl() {
    return 'join-url';
  }

  getRouteChanges() {
    return of({});
  }
}

class MockFormattingService {}

class MockContentCarouselService {
  isLastContentAnswered() {
    return false;
  }
  setLastContentAnswered() {}
}

class MockThemeService {
  private getCssVariable(name: string) {
    const computedStyle = getComputedStyle(document.body);
    return computedStyle.getPropertyValue(name).trim();
  }

  getColor(color: string) {
    return this.getCssVariable(`--${color}`);
  }
  getPrimaryColor() {
    return '#5e35b1';
  }
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

  getAnswersByUserIdContentIds() {
    return of([]);
  }
}

class MockContentService {
  private contents: Content[] = [
    new Content('roomId', 'subject', '**Content 1**', [], ContentType.TEXT),
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
    this.contents[3].id = 'content4';
    this.contents[0].renderedBody = '<p><b>Content 1</b></p>';
    this.contents[1].renderedBody = '<p>Content 2</p>';
    this.contents[2].renderedBody = '<p>Content 3</p>';
    this.contents[3].renderedBody = '<p>Content 4</p>';
    this.contents[0].state = new ContentState(1, undefined, true);
    this.contents[1].state = new ContentState(1, undefined, true);
    this.contents[2].state = new ContentState(1, undefined, true);
    this.contents[3].state = new ContentState(1, undefined, true);
    return of(this.contents);
  }

  getSupportedContents() {
    this.contents[0].id = 'content1';
    this.contents[1].id = 'content2';
    this.contents[2].id = 'content3';
    this.contents[3].id = 'content4';
    this.contents[0].renderedBody = '<p><b>Content 1</b></p>';
    this.contents[1].renderedBody = '<p>Content 2</p>';
    this.contents[2].renderedBody = '<p>Content 3</p>';
    this.contents[3].renderedBody = '<p>Content 4</p>';
    this.contents[0].state = new ContentState(1, undefined, true);
    this.contents[1].state = new ContentState(1, undefined, true);
    this.contents[2].state = new ContentState(1, undefined, true);
    this.contents[3].state = new ContentState(1, undefined, true);
    return this.contents;
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
}

class MockRoomUserAliasService {}

export default {
  component: ParticipantContentCarouselPageComponent,
  title: 'ParticipantContentCarouselPage',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ParticipantContentCarouselPageComponent],
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
          provide: ContentGroupService,
          useClass: MockContentGroupService,
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
          provide: ThemeService,
          useClass: MockThemeService,
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
          provide: ContentService,
          useClass: MockContentService,
        },
        {
          provide: RoomUserAliasService,
          useClass: MockRoomUserAliasService,
        },
        LikertScaleService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {},
              params: {
                contentIndex: 1,
                seriesName: 'My mixed series',
              },
            },
          },
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ParticipantContentCarouselPageComponent>;

export const ParticipantContentCarouselPage: Story = {
  args: {
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
    room: new Room(),
    contentIndex: 1,
    showCard: true,
    showStepper: true,
  },
};
