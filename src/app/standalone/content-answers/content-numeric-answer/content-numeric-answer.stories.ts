import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { ContentNumericAnswerComponent } from './content-numeric-answer.component';

export default {
  component: ContentNumericAnswerComponent,
  title: 'ContentNumericAnswer',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentNumericAnswerComponent],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentNumericAnswerComponent>;

const range = { minNumber: 0, maxNumber: 100 };

export const Unanswered: Story = {
  args: { ...range },
};

export const AnsweredCorrectly: Story = {
  args: {
    ...range,
    selectedNumber: 41,
    answered: true,
    disabled: true,
    correctNumber: 42,
    tolerance: 2,
    correctOptionsPublished: true,
  },
};

export const AnsweredWrongly: Story = {
  args: {
    ...range,
    selectedNumber: 50,
    answered: true,
    disabled: true,
    correctNumber: 42,
    correctOptionsPublished: true,
  },
};
