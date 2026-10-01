import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { ContentTextAnswerComponent } from './content-text-answer.component';

export default {
  component: ContentTextAnswerComponent,
  title: 'ContentTextAnswer',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentTextAnswerComponent],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentTextAnswerComponent>;

export const ContentTextAnswer: Story = {};

export const Answered: Story = {
  args: {
    answer: 'An answer given by a participant',
    disabled: true,
  },
};

export const SingleLine: Story = {
  args: {
    minRows: 1,
  },
};

export const Correct: Story = {
  args: {
    answer: 'Paris',
    correct: true,
    disabled: true,
    minRows: 1,
  },
};

export const Wrong: Story = {
  args: {
    answer: 'Lyon',
    correct: false,
    disabled: true,
    minRows: 1,
  },
};
