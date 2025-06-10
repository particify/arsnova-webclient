import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { ContentTextAnswerComponent } from './content-text-answer.component';

import { AnswerOption } from '@app/core/models/answer-option';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { FormattingService } from '@app/core/services/http/formatting.service';

class MockFormattingService {}

export default {
  component: ContentTextAnswerComponent,
  title: 'ContentTextAnswer',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentTextAnswerComponent, RenderedTextComponent],
      providers: [
        {
          provide: FormattingService,
          useClass: MockFormattingService,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentTextAnswerComponent>;

const answerOptions = [
  new AnswerOption('answer 1'),
  new AnswerOption('answer 2'),
  new AnswerOption('answer 3'),
  new AnswerOption('answer 4'),
];

answerOptions[0].renderedLabel = '<b>answer 1</b>';

export const ContentTextAnswer: Story = {};
