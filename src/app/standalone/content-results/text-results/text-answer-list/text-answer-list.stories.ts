import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { TextAnswerListComponent } from './text-answer-list.component';

export default {
  component: TextAnswerListComponent,
  title: 'TextAnswerList',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [TextAnswerListComponent],
    }),
  ],
} as Meta;

type Story = StoryObj<TextAnswerListComponent>;

const answers = [
  { id: 'a-1', body: 'Small steps, every day.' },
  { id: 'a-2', body: 'Asking questions early.' },
  {
    id: 'a-3',
    body: 'A much longer answer that runs over several lines, to show how the list wraps text that does not fit into a single line of the card.',
  },
];

export const Answers: Story = {
  args: { answers },
};

export const Moderated: Story = {
  args: { answers, hidingAllowed: true },
};
