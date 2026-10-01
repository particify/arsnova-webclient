import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { ContentPrioritizationAnswerComponent } from './content-prioritization-answer.component';

import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { FormattingService } from '@app/core/services/http/formatting.service';

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
  { label: '*answer 1*', labelRendered: '<b>answer 1</b>' },
  { label: 'answer 2' },
  { label: 'answer 3' },
  { label: 'answer 4' },
];

export const ContentPrioritizationAnswer: Story = {
  args: {
    answerOptions: answerOptions,
    assignablePoints: 100,
    assignedPoints: [40, 30, 20, 10],
    disabled: false,
  },
};

export const Unassigned: Story = {
  args: {
    answerOptions: answerOptions,
    assignablePoints: 100,
    assignedPoints: [],
  },
};

export const OverBudget: Story = {
  args: {
    answerOptions: answerOptions,
    assignablePoints: 100,
    assignedPoints: [60, 40, 20, 0],
  },
};

export const Disabled: Story = {
  args: {
    answerOptions: answerOptions,
    assignablePoints: 100,
    assignedPoints: [40, 30, 20, 10],
    disabled: true,
  },
};
