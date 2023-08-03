import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { TranslateModule } from '@ngx-translate/core';
import { VotingComponent } from '@app/standalone/voting/voting.component';
import { VoteService } from '@app/core/services/http/vote.service';

class MockVoteService {}

export default {
  component: VotingComponent,
  title: 'Voting',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [TranslateModule.forRoot(), VotingComponent],
      providers: [
        {
          provide: VoteService,
          useClass: MockVoteService,
        },
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
