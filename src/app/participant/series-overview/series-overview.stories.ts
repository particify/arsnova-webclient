import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { NEVER, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { AuthenticatedUser } from '@app/core/models/authenticated-user';
import { RoomService } from '@app/core/services/http/room.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { FocusModeService } from '@app/participant/_services/focus-mode.service';
import { CommentFocusState } from '@app/core/models/events/remote/comment-focus-state';
import { RoutingService } from '@app/core/services/util/routing.service';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { SeriesOverviewComponent } from '@app/participant/series-overview/series-overview.component';
import { ContentCarouselService } from '@app/core/services/util/content-carousel.service';
import {
  AnswerResultOverview,
  AnswerResultType,
} from '@app/core/models/answer-result';
import {
  AnswerResultState,
  ContentAnswerResult,
  ContentDetailsFragment,
  ContentType,
  LeaderboardPage,
  QuestionnaireAnswerResultsByQuestionnaireIdGql,
  QuestionnaireDetailsFragment,
  QuestionnaireLeaderboardByQuestionnaireIdGql,
  QuestionnaireLeaderboardUpdatedGql,
  QuestionnairePublishingMode,
  QuestionnaireType,
  ScaleContentTemplate,
} from '@gql/generated/graphql';

class MockService {}

class MockAuthenticationService {
  getCurrentAuthentication() {
    return of(new AuthenticatedUser('userId', true, 'displayId'));
  }
}

const leaderboardPage: LeaderboardPage = {
  entries: [
    {
      userAlias: { id: '1', alias: 'Happy Hippo', seed: 1 },
      score: 1942,
      position: 1,
    },
    {
      userAlias: { id: '2', alias: 'Funny Cow', seed: 2 },
      score: 1832,
      position: 2,
    },
    {
      userAlias: { id: '3', alias: 'Silent Panda', seed: 3 },
      score: 1813,
      position: 3,
    },
    {
      userAlias: { id: '4', alias: 'Curious Turtle', seed: 4 },
      score: 1795,
      position: 4,
    },
    {
      userAlias: { id: '5', alias: 'Reliable Rhino', seed: 5 },
      score: 1753,
      position: 5,
    },
    {
      userAlias: { id: '6', alias: 'Smart Starfish', seed: 6 },
      score: 1700,
      position: 6,
    },
    {
      userAlias: { id: '7', alias: 'Ambitious Amadillo', seed: 7 },
      score: 1200,
      position: 7,
    },
    {
      userAlias: { id: '8', alias: 'This is my awesome name', seed: 8 },
      score: 1111,
      position: 8,
    },
    {
      userAlias: { id: '9', alias: 'I made it', seed: 9 },
      score: 987,
      position: 9,
    },
    {
      userAlias: { id: '10', alias: '10th! wohoo!', seed: 10 },
      score: 985,
      position: 10,
    },
    {
      userAlias: {
        id: '11',
        alias: 'I should not made it to the board',
        seed: 11,
      },
      score: 897,
      position: 11,
    },
    {
      userAlias: { id: '12', alias: 'Crazy Frog', seed: 12 },
      score: 789,
      position: 12,
    },
    {
      userAlias: { id: '13', alias: 'This is another player', seed: 13 },
      score: 665,
      position: 13,
    },
  ],
  totalCount: 13,
};

// The real service keeps the ranking and colouring logic in play.
const leaderboardByQuestionnaireIdGqlMock = {
  watch: () => ({
    valueChanges: of({
      dataState: 'complete',
      data: { questionnaireLeaderboardByQuestionnaireId: leaderboardPage },
    }),
  }),
};

const leaderboardUpdatedGqlMock = {
  subscribe: () => NEVER,
};

const questionnaireScores: Record<
  string,
  { achievedScore: number; maxScore: number }
> = {
  mixedGroupId: { achievedScore: 500, maxScore: 500 },
  quizGroupId: { achievedScore: 2000, maxScore: 2000 },
  surveyGroupId: { achievedScore: 0, maxScore: 0 },
};

const questionnaireAnswerResultsByQuestionnaireIdGqlMock = {
  watch: ({ variables }: { variables: { questionnaireId: string } }) => ({
    valueChanges: of({
      loading: false,
      data: {
        questionnaireAnswerResultsByQuestionnaireId: {
          __typename: 'QuestionnaireAnswerResult',
          correctAnswerCount: null,
          scorableContentCount: null,
          ...questionnaireScores[variables.questionnaireId],
        },
      },
    }),
  }),
};

class MockContentGroupService {
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

class MockRoutingService {
  getRoomJoinUrl() {
    return 'join-url';
  }
}

class MockFormattingService {}

class MockContentCarouselService {
  isLastContentAnswered() {
    return false;
  }
  setLastContentAnswered() {}
}

export default {
  component: SeriesOverviewComponent,
  title: 'ParticipantSeriesOverview',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [SeriesOverviewComponent],
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
          provide: ContentCarouselService,
          useClass: MockContentCarouselService,
        },
        {
          provide: QuestionnaireAnswerResultsByQuestionnaireIdGql,
          useValue: questionnaireAnswerResultsByQuestionnaireIdGqlMock,
        },
        {
          provide: QuestionnaireLeaderboardByQuestionnaireIdGql,
          useValue: leaderboardByQuestionnaireIdGqlMock,
        },
        {
          provide: QuestionnaireLeaderboardUpdatedGql,
          useValue: leaderboardUpdatedGqlMock,
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
              },
            },
          },
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<SeriesOverviewComponent>;

const createQuestionnaire = (
  id: string,
  name: string,
  type: QuestionnaireType
): QuestionnaireDetailsFragment => ({
  __typename: 'Questionnaire',
  id,
  name,
  type,
  published: true,
  publishingMode: QuestionnairePublishingMode.All,
  statisticsPublished: true,
  correctOptionsPublished: type === QuestionnaireType.Quiz,
  leaderboardEnabled: type === QuestionnaireType.Quiz,
  contentCount: 4,
  publishedUpToContent: null,
  activeRound: null,
});

const createContent = (
  id: string,
  body: string,
  formatData: ContentDetailsFragment['formatData']
): ContentDetailsFragment => ({
  __typename: 'Content',
  id,
  body,
  bodyRendered: `<p>${body}</p>`,
  duration: null,
  abstentionsAllowed: null,
  hasCorrectAnswer: null,
  weight: null,
  answerCount: null,
  abstentionCount: null,
  position: null,
  activeRound: null,
  formatData,
});

const choiceFormatData = (
  correctOptionIndexes: number[],
  multiple = false
): ContentDetailsFragment['formatData'] => ({
  __typename: 'ChoiceContentFormatData',
  format: ContentType.Choice,
  correctOptionIndexes,
  multiple,
  options: [1, 2, 3, 4].map((i) => ({
    __typename: 'AnswerOption' as const,
    label: `Answer ${i}`,
    labelRendered: null,
  })),
});

const createAnswerResults = (
  ...results: AnswerResultState[]
): ContentAnswerResult[] =>
  results.map((result, i) => ({
    contentId: `content${i + 1}`,
    durationMs: 0,
    result,
  }));

const createMixedContents = (
  correctOptionIndexes: number[]
): ContentDetailsFragment[] => [
  createContent('content1', 'Content 1', {
    __typename: 'TextContentFormatData',
    format: ContentType.Text,
    answersPublished: false,
  }),
  createContent(
    'content2',
    'Content 2',
    choiceFormatData(correctOptionIndexes)
  ),
  createContent('content3', 'Content 3', {
    __typename: 'ScaleContentFormatData',
    format: ContentType.Scale,
    template: ScaleContentTemplate.Agreement,
    neutralOption: true,
  }),
  createContent('content4', 'Content 4', {
    __typename: 'WordcloudContentFormatData',
    format: ContentType.Wordcloud,
    maxAnswers: 3,
  }),
];

export const Mixed: Story = {
  args: {
    questionnaire: createQuestionnaire(
      'mixedGroupId',
      'Mixed series',
      QuestionnaireType.Mixed
    ),
    contents: createMixedContents([1]),
    answerResults: createAnswerResults(
      AnswerResultState.Neutral,
      AnswerResultState.Correct,
      AnswerResultState.Neutral,
      AnswerResultState.Unanswered
    ),
    roomId: 'roomId',
    finished: true,
  },
};

export const Quiz: Story = {
  args: {
    questionnaire: createQuestionnaire(
      'quizGroupId',
      'Mixed series',
      QuestionnaireType.Quiz
    ),
    contents: [
      createContent('content1', 'Content 1', choiceFormatData([0, 2], true)),
      createContent('content2', 'Content 2', choiceFormatData([1])),
      createContent('content3', 'Content 3', choiceFormatData([1])),
      createContent('content4', 'Content 4', choiceFormatData([1])),
    ],
    answerResults: createAnswerResults(
      AnswerResultState.Correct,
      AnswerResultState.Correct,
      AnswerResultState.Correct,
      AnswerResultState.Correct
    ),
    roomId: 'roomId',
    finished: true,
    alias: { id: '5', alias: 'Reliable Rhino', seed: 5 },
  },
};

export const Survey: Story = {
  args: {
    questionnaire: createQuestionnaire(
      'surveyGroupId',
      'Survey series',
      QuestionnaireType.Mixed
    ),
    contents: createMixedContents([]),
    answerResults: createAnswerResults(
      AnswerResultState.Neutral,
      AnswerResultState.Neutral,
      AnswerResultState.Unanswered,
      AnswerResultState.Unanswered
    ),
    roomId: 'roomId',
    finished: false,
  },
};
