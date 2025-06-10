import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { ContentPrioritizationAnswerComponent } from './content-prioritization-answer.component';

import { AnswerOption } from '@app/core/models/answer-option';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { AnswerWithPoints } from '@app/core/models/answer-with-points';

class MockFormattingService {}

export default {
  component: ContentPrioritizationAnswerComponent,
  title: 'ContentPrioritizationAnswer',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentPrioritizationAnswerComponent, RenderedTextComponent],
      providers: [
        {
          provide: FormattingService,
          useClass: MockFormattingService,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentPrioritizationAnswerComponent>;

const answerOptions = [
  new AnswerWithPoints(new AnswerOption('answer 1'), 0),
  new AnswerWithPoints(new AnswerOption('answer 2'), 0),
  new AnswerWithPoints(new AnswerOption('answer 3'), 0),
  new AnswerWithPoints(new AnswerOption('answer 4'), 0),
];

answerOptions[0].answerOption.renderedLabel = '<b>answer 1</b>';

export const ContentPrioritizationAnswer: Story = {
  args: {
    answerOptions: answerOptions,
    assignablePoints: 100,
    isDisabled: false,
  },
};
