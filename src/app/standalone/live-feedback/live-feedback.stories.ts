import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { LiveFeedbackComponent } from '@app/standalone/live-feedback/live-feedback.component';
import { LiveFeedbackType } from '@app/core/models/live-feedback-type.enum';

export default {
  component: LiveFeedbackComponent,
  title: 'LiveFeedback',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [LiveFeedbackComponent],
    }),
  ],
} as Meta;

type Story = StoryObj<LiveFeedbackComponent>;

export const Feedback: Story = {
  args: {
    type: LiveFeedbackType.FEEDBACK,
    isEnabled: true,
    fixedSize: false,
    data: [25, 45, 20, 10],
  },
};
