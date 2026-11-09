import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { AnswerGridListComponent } from '@app/standalone/answer-grid-list/answer-grid-list.component';
import { TextCount } from '@app/core/models/text-count';

export default {
  component: AnswerGridListComponent,
  title: 'AnswerGridList',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [AnswerGridListComponent],
    }),
  ],
} as Meta;

type Story = StoryObj<AnswerGridListComponent>;

const answers = [
  new TextCount('Answer 1', 5, '1'),
  new TextCount('Answer 2', 4, '2'),
  new TextCount('Answer 3', 2, '3'),
  new TextCount('Answer 4', 1, '4'),
  new TextCount('Answer 5', 1, '5'),
  new TextCount('Answer 6', 1, '6'),
];

export const AnswerGridList: Story = {
  args: {
    answers: answers,
    showCorrect: false,
    correctTerms: ['Answer 1', 'Answer 3'],
  },
};
