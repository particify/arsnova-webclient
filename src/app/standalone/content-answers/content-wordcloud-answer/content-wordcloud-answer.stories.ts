import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { ContentWordcloudAnswerComponent } from './content-wordcloud-answer.component';

import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { FormattingService } from '@app/core/services/http/formatting.service';

class MockFormattingService {}

export default {
  component: ContentWordcloudAnswerComponent,
  title: 'ContentWordcloudAnswer',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentWordcloudAnswerComponent, RenderedTextComponent],
      providers: [
        {
          provide: FormattingService,
          useClass: MockFormattingService,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentWordcloudAnswerComponent>;

export const ContentWordcloudAnswer: Story = {
  args: {
    words: ['word 1', 'word 2', 'word 3'],
    disabled: false,
  },
};
