import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { VotingComponent } from '@app/standalone/voting/voting.component';

export default {
  component: VotingComponent,
  title: 'Voting',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [VotingComponent],
    }),
  ],
} as Meta;

type Story = StoryObj<VotingComponent>;

export const Voting: Story = {
  args: {
    score: 42,
    postId: 'postId',
    userVote: 0,
  },
};
