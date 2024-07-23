import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';

import { LeaderboardPageComponent } from '@app/standalone/leaderboard-page/leaderboard-page.component';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { OrdinalPipe } from '@app/core/pipes/ordinal.pipe';
import { of } from 'rxjs';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ActivatedRoute } from '@angular/router';

class MockContentGroupService {
  getLeaderboard() {
    return of([
      {
        userAlias: { id: '1', alias: 'Happy Hippo', seed: 1 },
        score: 5700,
      },
      {
        userAlias: { id: '2', alias: 'Funny Cow', seed: 1 },
        score: 5100,
      },
      {
        userAlias: { id: '3', alias: 'Silent Panda', seed: 1 },
        score: 3100,
      },
      {
        userAlias: { id: '4', alias: 'Curious Turtle', seed: 1 },
        score: 2200,
      },
      {
        userAlias: { id: '5', alias: 'Reliable Rhino', seed: 1 },
        score: 1800,
      },
      {
        userAlias: { id: '6', alias: 'Smart Starfish', seed: 1 },
        score: 1700,
      },
      {
        userAlias: { id: '7', alias: 'Ambitious Amadillo', seed: 1 },
        score: 1200,
      },
      {
        userAlias: { id: '8', alias: 'This is my awesome name', seed: 1 },
        score: 1111,
      },
      {
        userAlias: { id: '9', alias: 'I made it', seed: 1 },
        score: 987,
      },
      {
        userAlias: { id: '10', alias: '10th! wohoo!', seed: 1 },
        score: 985,
      },
      {
        userAlias: {
          id: '11',
          alias: 'I should not made it to the board',
          seed: 1,
        },
        score: 897,
      },
      {
        userAlias: { id: '12', alias: 'Crazy Frog', seed: 1 },
        score: 789,
      },
      {
        userAlias: { id: '13', alias: 'This is another player', seed: 1 },
        score: 665,
      },
    ]);
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
    applicationConfig({
      providers: [
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<LeaderboardPageComponent>;

export const LeaderboardPage: Story = {};
