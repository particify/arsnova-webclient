import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { OrdinalPipe } from '@app/core/pipes/ordinal.pipe';
import { of } from 'rxjs';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ActivatedRoute } from '@angular/router';
import { LeaderboardPageComponent } from '@app/participant/leaderboard-page/leaderboard-page.component';
import { ContentService } from '@app/core/services/http/content.service';
import { Content } from '@app/core/models/content';
import { ContentType } from '@app/core/models/content-type.enum';

class MockContentGroupService {
  getCurrentLeaderboard() {
    return of([
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
        userAlias: { id: '2', alias: 'Funny Cow', seed: 2 },
        score: 5100,
        currentResult: {
          points: 965,
          durationMs: 786,
          correct: true,
        },
      },
      {
        userAlias: { id: '3', alias: 'Silent Panda', seed: 3 },
        score: 3100,
        currentResult: {
          points: 925,
          durationMs: 999,
          correct: true,
        },
      },
      {
        userAlias: { id: '4', alias: 'Curious Turtle', seed: 4 },
        score: 2200,
        currentResult: {
          points: 912,
          durationMs: 1234,
          correct: true,
        },
      },
      {
        userAlias: { id: '5', alias: 'Reliable Rhino', seed: 5 },
        score: 1800,
        currentResult: {
          points: 901,
          durationMs: 1543,
          correct: true,
        },
      },
      {
        userAlias: { id: '6', alias: 'Smart Starfish', seed: 6 },
        score: 1700,
        currentResult: {
          points: 854,
          durationMs: 2345,
          correct: true,
        },
      },
      {
        userAlias: { id: '7', alias: 'Ambitious Amadillo', seed: 7 },
        score: 1200,
        currentResult: {
          points: 821,
          durationMs: 3456,
          correct: true,
        },
      },
      {
        userAlias: { id: '8', alias: 'This is my awesome name', seed: 8 },
        score: 1111,
        currentResult: {
          points: 786,
          durationMs: 4567,
          correct: true,
        },
      },
      {
        userAlias: { id: '9', alias: 'I made it', seed: 9 },
        score: 987,
        currentResult: {
          points: 742,
          durationMs: 5678,
          correct: true,
        },
      },
      {
        userAlias: { id: '10', alias: '10th! wohoo!', seed: 10 },
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
          seed: 11,
        },
        score: 897,
        currentResult: {
          points: 521,
          durationMs: 7890,
          correct: true,
        },
      },
      {
        userAlias: { id: '12', alias: 'Crazy Frog', seed: 12 },
        score: 789,
        currentResult: {
          points: 457,
          durationMs: 8354,
          correct: true,
        },
      },
      {
        userAlias: { id: '13', alias: 'This is another player', seed: 13 },
        score: 665,
        currentResult: {
          points: 378,
          durationMs: 8969,
          correct: true,
        },
      },
    ]);
  }
}

class MockContentService {
  getAnswersChangedStream() {
    return of({});
  }
}

export default {
  component: LeaderboardPageComponent,
  title: 'LeaderboardPage',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [LeaderboardPageComponent, OrdinalPipe],
      providers: [
        {
          provide: ContentGroupService,
          useClass: MockContentGroupService,
        },
        {
          provide: ContentService,
          useClass: MockContentService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                room: { id: 'roomId' },
                contentGroup: { id: 'contentGroupId' },
              },
            },
          },
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<LeaderboardPageComponent>;

export const Participant: Story = {
  args: {
    content: new Content(),
    aliasId: '5',
  },
};

export const ParticipantWithDuration: Story = {
  args: {
    content: new Content(
      'roomId',
      'subject',
      'body',
      [],
      ContentType.CHOICE,
      30
    ),
    aliasId: '5',
  },
};
