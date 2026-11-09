import { Meta, moduleMetadata } from '@storybook/angular';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { AuthenticatedUser } from '@app/core/models/authenticated-user';
import { RoomService } from '@app/core/services/http/room.service';
import { FocusModeService } from '@app/participant/_services/focus-mode.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { ThemeService } from '@app/core/theme/theme.service';
import { ContentCarouselService } from '@app/core/services/util/content-carousel.service';
import {
  RoomUserAliasByRoomIdGql,
  SetRoomUserAliasGql,
} from '@gql/generated/graphql';
import { ContentFocusState } from '@app/core/models/events/remote/content-focus-state';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { QuestionnairePageComponent } from './questionnaire-page.component';

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

const roomUserAliasByRoomIdGqlMock = {
  watch: () => ({
    valueChanges: of({
      dataState: 'complete',
      data: {
        roomUserAliasByRoomId: { id: null, alias: 'Happy Hippo', seed: 2222 },
      },
    }),
  }),
};

const setRoomUserAliasGqlMock = {
  mutate: () =>
    of({
      data: {
        setRoomUserAlias: { id: '1', alias: 'Happy Hippo', seed: 2222 },
      },
    }),
};

export default {
  component: QuestionnairePageComponent,
  title: 'ParticipantContentCarouselPage',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [QuestionnairePageComponent],
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
          provide: RoomUserAliasByRoomIdGql,
          useValue: roomUserAliasByRoomIdGqlMock,
        },
        {
          provide: SetRoomUserAliasGql,
          useValue: setRoomUserAliasGqlMock,
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

// type Story = StoryObj<QuestionnairePageComponent>;

// export const ParticipantContentCarouselPage: Story = {
//   args: {
//     contentGroup: new ContentGroup(
//       'roomId',
//       'My mixed series',
//       ['content1', 'content2', 'content3', 'content4'],
//       true,
//       true,
//       true,
//       PublishingMode.ALL,
//       0,
//       GroupType.MIXED,
//       false
//     ),
//     room: new Room(),
//     contentIndex: 1,
//     showCard: true,
//     showStepper: true,
//   },
// };
