import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { ContentStepInfoComponent } from '@app/standalone/content-step-info/content-step-info.component';

export default {
  component: ContentStepInfoComponent,
  title: 'ContentStepInfo',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentStepInfoComponent],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentStepInfoComponent>;

export const ContentStepInfo: Story = {
  args: {
    current: 1,
    totalCount: 5,
  },
};
