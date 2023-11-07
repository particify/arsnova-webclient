import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';

import { VotingComponent } from '@app/standalone/voting/voting.component';
import { VoteService } from '@app/core/services/http/vote.service';
import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { TranslocoRootModule } from '@app/transloco-root.module';

class MockVoteService {}

export default {
  component: VotingComponent,
  title: 'Voting',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [VotingComponent],
      providers: [
        {
          provide: VoteService,
          useClass: MockVoteService,
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

type Story = StoryObj<VotingComponent>;

export const Voting: Story = {
  args: {
    score: 42,
    userId: 'userId',
    roomId: 'roomId',
    commentId: 'commentId',
  },
};
