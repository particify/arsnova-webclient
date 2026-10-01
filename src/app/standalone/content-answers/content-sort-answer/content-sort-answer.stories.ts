import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { ContentSortAnswerComponent } from './content-sort-answer.component';

import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { FormattingService } from '@app/core/services/http/formatting.service';

class MockFormattingService {}

export default {
  component: ContentSortAnswerComponent,
  title: 'ContentSortAnswer',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentSortAnswerComponent, RenderedTextComponent],
      providers: [
        {
          provide: FormattingService,
          useClass: MockFormattingService,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentSortAnswerComponent>;

const answerOptions = [
  { label: '*answer 1*', labelRendered: '<b>answer 1</b>' },
  { label: 'answer 2' },
  { label: 'answer 3' },
  { label: 'answer 4' },
];

export const ContentSortAnswer: Story = {
  args: {
    answerOptions: answerOptions,
    disabled: false,
  },
};

export const Correct: Story = {
  args: {
    answerOptions: answerOptions,
    disabled: true,
    correct: true,
  },
};

export const Wrong: Story = {
  args: {
    answerOptions: answerOptions,
    disabled: true,
    correct: false,
  },
};
