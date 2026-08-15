import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { ContentGroupLeaderboardComponent } from '@app/standalone/content-group-leaderboard/content-group-leaderboard.component';
import { OrdinalPipe } from '@app/core/pipes/ordinal.pipe';
import { NEVER, of } from 'rxjs';
import {
  LeaderboardPage,
  Questionnaire,
  QuestionnaireLeaderboardByQuestionnaireIdGql,
  QuestionnaireLeaderboardUpdatedGql,
} from '@gql/generated/graphql';

const leaderboardPage: LeaderboardPage = {
  entries: [
    {
      userAlias: { id: '1', alias: 'Happy Hippo', seed: 1 },
      score: 5700,
      position: 1,
    },
    {
      userAlias: { id: '2', alias: 'Funny Cow', seed: 2 },
      score: 5100,
      position: 2,
    },
    {
      userAlias: { id: '3', alias: 'Silent Panda', seed: 3 },
      score: 3100,
      position: 3,
    },
    {
      userAlias: { id: '4', alias: 'Curious Turtle', seed: 4 },
      score: 2200,
      position: 4,
    },
    {
      userAlias: { id: '5', alias: 'Reliable Rhino', seed: 5 },
      score: 1800,
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

export default {
  component: ContentGroupLeaderboardComponent,
  title: 'ContentGroupLeaderboard',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentGroupLeaderboardComponent, OrdinalPipe],
      providers: [
        {
          provide: QuestionnaireLeaderboardByQuestionnaireIdGql,
          useValue: leaderboardByQuestionnaireIdGqlMock,
        },
        {
          provide: QuestionnaireLeaderboardUpdatedGql,
          useValue: leaderboardUpdatedGqlMock,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentGroupLeaderboardComponent>;

export const Editor: Story = {
  args: {
    questionnaire: { id: 'questionnaireId' } as Questionnaire,
    showAll: true,
  },
};
