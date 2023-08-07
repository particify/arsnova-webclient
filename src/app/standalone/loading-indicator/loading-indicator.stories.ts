import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

export default {
  component: LoadingIndicatorComponent,
  title: 'LoadingIndicator',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [LoadingIndicatorComponent],
    }),
  ],
} as Meta;

type Story = StoryObj<LoadingIndicatorComponent>;

export const LoadingIndicator: Story = {
  args: {
    size: 40,
    height: 0,
  },
};
