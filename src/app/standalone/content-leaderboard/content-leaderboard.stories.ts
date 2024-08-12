import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';

import { ContentLeaderboardComponent } from '@app/standalone/content-leaderboard/content-leaderboard.component';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { CurrentLeaderboardItem } from '@app/core/models/current-leaderboard-item';
import { OrdinalPipe } from '@app/core/pipes/ordinal.pipe';

export default {
  component: ContentLeaderboardComponent,
  title: 'ContentLeaderboard',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentLeaderboardComponent, OrdinalPipe],
    }),
    applicationConfig({
      providers: [
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentLeaderboardComponent>;

const leaderboardItems: CurrentLeaderboardItem[] = [
  {
    userAlias: { id: '1', alias: 'Happy Hippo', seed: 1 },
    score: 5700,
    currentResult: {
      points: 975,
      durationMs: 432,
      correct: true,
    },
  },
  {
    userAlias: { id: '2', alias: 'Funny Cow', seed: 1 },
    score: 5100,
    currentResult: {
      points: 965,
      durationMs: 786,
      correct: true,
    },
  },
  {
    userAlias: { id: '3', alias: 'Silent Panda', seed: 1 },
    score: 3100,
    currentResult: {
      points: 925,
      durationMs: 999,
      correct: true,
    },
  },
  {
    userAlias: { id: '4', alias: 'Curious Turtle', seed: 1 },
    score: 2200,
    currentResult: {
      points: 912,
      durationMs: 1234,
      correct: true,
    },
  },
  {
    userAlias: { id: '5', alias: 'Reliable Rhino', seed: 1 },
    score: 1800,
    currentResult: {
      points: 901,
      durationMs: 1543,
      correct: true,
    },
  },
  {
    userAlias: { id: '6', alias: 'Smart Starfish', seed: 1 },
    score: 1700,
    currentResult: {
      points: 854,
      durationMs: 2345,
      correct: true,
    },
  },
  {
    userAlias: { id: '7', alias: 'Ambitious Amadillo', seed: 1 },
    score: 1200,
    currentResult: {
      points: 821,
      durationMs: 3456,
      correct: true,
    },
  },
  {
    userAlias: { id: '8', alias: 'This is my awesome name', seed: 1 },
    score: 1111,
    currentResult: {
      points: 786,
      durationMs: 4567,
      correct: true,
    },
  },
  {
    userAlias: { id: '9', alias: 'I made it', seed: 1 },
    score: 987,
    currentResult: {
      points: 742,
      durationMs: 5678,
      correct: true,
    },
  },
  {
    userAlias: { id: '10', alias: '10th! wohoo!', seed: 1 },
    score: 985,
    currentResult: {
      points: 534,
      durationMs: 6789,
      correct: true,
    },
  },
  {
    userAlias: {
      id: '11',
      alias: 'I should not made it to the board',
      seed: 1,
    },
    score: 897,
    currentResult: {
      points: 521,
      durationMs: 7890,
      correct: true,
    },
  },
  {
    userAlias: { id: '12', alias: 'Crazy Frog', seed: 1 },
    score: 789,
    currentResult: {
      points: 457,
      durationMs: 8354,
      correct: true,
    },
  },
  {
    userAlias: { id: '13', alias: 'This is another player', seed: 1 },
    score: 665,
    currentResult: {
      points: 378,
      durationMs: 8969,
      correct: true,
    },
  },
];

export const ContentLeaderboard: Story = {
  args: {
    leaderboardItems: leaderboardItems,
  },
};

export const ContentLeaderboardWithAlias: Story = {
  args: {
    leaderboardItems: leaderboardItems,
    aliasId: '12',
  },
};

export const ContentLeaderboardWithTime: Story = {
  args: {
    leaderboardItems: leaderboardItems,
    contentDuration: 20,
  },
};
