import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { AnswerCountComponent } from './answer-count.component';

export default {
  component: AnswerCountComponent,
  title: 'AnswerCount',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [AnswerCountComponent],
    }),
  ],
} as Meta;

type Story = StoryObj<AnswerCountComponent>;

export const AnswerCount: Story = {
  args: {
    count: 42,
  },
};
