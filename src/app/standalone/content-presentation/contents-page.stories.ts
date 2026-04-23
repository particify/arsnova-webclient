import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { AuthenticatedUser } from '@app/core/models/authenticated-user';
import { RoomService } from '@app/core/services/http/room.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import {
  ContentGroup,
  GroupType,
  PublishingMode,
} from '@app/core/models/content-group';
import { RoutingService } from '@app/core/services/util/routing.service';

import { FormattingService } from '@app/core/services/http/formatting.service';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { ContentFocusState } from '@app/core/models/events/remote/content-focus-state';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { ContentsPageComponent } from '@app/standalone/content-presentation/contents-page.component';
import { PresentationService } from '@app/core/services/util/presentation.service';
import {
  ContentType,
  QuestionnaireContentsByQuestionnaireIdGql,
  QuestionnairePublishingMode,
  QuestionnaireType,
} from '@gql/generated/graphql';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentPresentationService } from '@app/presentation/content-presentation.service';

class MockService {}

class MockAuthenticationService {
  getCurrentAuthentication() {
    return of(new AuthenticatedUser('userId', true, 'displayId'));
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

class MockRoutingService {
  getRoomJoinUrl() {
    return 'join-url';
  }

  getRouteChanges() {
    return of({});
  }
}

class MockFormattingService {}

class MockContentService {}

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

class MockContentAnswerService {
  getAnswers() {
    return of([]);
  }
}

const questionnaireContentsByQuestionnaireIdGql = {
  watch: () => ({
    valueChanges: of({
      data: {
        questionnaireContentsByQuestionnaireId: {
          edges: [
            {
              node: {
                __typename: 'Content',
                id: 'content1',
                body: 'Was ist die richtige Antwort?',
                bodyRendered: '<p>Was ist die richtige Antwort?</p>',
                duration: 30,
                abstentionsAllowed: false,
                hasCorrectAnswer: true,
                weight: 1,
                answerCount: 10,
                abstentionCount: 1,
                correctAnswerCount: 6,
                activeRound: {
                  __typename: 'Round',
                  id: 'round-1',
                  roundNo: 1,
                },
                formatData: {
                  __typename: 'ChoiceContentFormatData',
                  format: ContentType.Choice,
                  correctOptionIndexes: [1],
                  multiple: false,
                  options: [
                    {
                      __typename: 'AnswerOption',
                      label: 'Antwort A',
                      labelRendered: '<p>Antwort A</p>',
                    },
                    {
                      __typename: 'AnswerOption',
                      label: 'Antwort B (richtig)',
                      labelRendered: '<p>Antwort B</p>',
                    },
                    {
                      __typename: 'AnswerOption',
                      label: 'Antwort C',
                      labelRendered: '<p>Antwort C</p>',
                    },
                  ],
                },
              },
            },

            {
              node: {
                __typename: 'Content',
                id: 'content-2',
                body: 'Was denkst du gerade?',
                bodyRendered: '<p>Was denkst du gerade?</p>',
                duration: 45,
                abstentionsAllowed: true,
                hasCorrectAnswer: false,
                weight: 1,
                answerCount: 0,
                abstentionCount: 0,
                correctAnswerCount: 0,
                activeRound: null,
                formatData: {
                  __typename: 'WordcloudContentFormatData',
                  format: ContentType.Wordcloud,
                  maxAnswers: 3,
                },
              },
            },
          ],
        },
      },
    }),
  }),
};

export default {
  component: ContentsPageComponent,
  title: 'ContentsPage',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentsPageComponent],
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
          provide: ContentService,
          useClass: MockContentService,
        },
        {
          provide: ContentAnswerService,
          useClass: MockContentAnswerService,
        },
        {
          provide: QuestionnaireContentsByQuestionnaireIdGql,
          useValue: questionnaireContentsByQuestionnaireIdGql,
        },
        LikertScaleService,
        PresentationService,
        ContentPresentationService,
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
  ],
} as Meta;

type Story = StoryObj<ContentsPageComponent>;

export const ContentsPagePresentation: Story = {
  args: {
    showStepInfo: true,
    showAnswerCount: true,
    showHotkeyActionButtons: true,
    showResults: true,
    contentIndex: 1,
    noControlBar: undefined,
    questionnaire: {
      id: 'questionnaireId',
      name: 'Quiz',
      contentCount: 42,
      published: true,
      type: QuestionnaireType.Quiz,
      publishingMode: QuestionnairePublishingMode.All,
    },
    language: 'de',
    settings: {},
  },
};
