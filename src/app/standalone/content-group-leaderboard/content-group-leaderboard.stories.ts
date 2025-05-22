import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { ContentGroupLeaderboardComponent } from '@app/standalone/content-group-leaderboard/content-group-leaderboard.component';
import { OrdinalPipe } from '@app/core/pipes/ordinal.pipe';
import { of } from 'rxjs';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { Room } from '@app/core/models/room';
import { ContentGroup } from '@app/core/models/content-group';

class MockContentGroupService {
  getLeaderboard() {
    return of([
      {
        userAlias: { id: '1', alias: 'Happy Hippo', seed: 1 },
        score: 5700,
      },
      {
        userAlias: { id: '2', alias: 'Funny Cow', seed: 2 },
        score: 5100,
      },
      {
        userAlias: { id: '3', alias: 'Silent Panda', seed: 3 },
        score: 3100,
      },
      {
        userAlias: { id: '4', alias: 'Curious Turtle', seed: 4 },
        score: 2200,
      },
      {
        userAlias: { id: '5', alias: 'Reliable Rhino', seed: 5 },
        score: 1800,
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
}

export default {
  component: ContentGroupLeaderboardComponent,
  title: 'ContentGroupLeaderboard',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentGroupLeaderboardComponent, OrdinalPipe],
      providers: [
        {
          provide: ContentGroupService,
          useClass: MockContentGroupService,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentGroupLeaderboardComponent>;

export const Editor: Story = {
  args: {
    room: new Room(),
    contentGroup: new ContentGroup(),
    showAll: true,
  },
};
