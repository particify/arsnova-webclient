import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { CountComponent } from '@app/standalone/count/count.component';

export default {
  component: CountComponent,
  title: 'Count',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [CountComponent],
    }),
  ],
} as Meta;

type Story = StoryObj<CountComponent>;

export const Count: Story = {
  args: {
    count: 42,
    label: 'answers',
  },
};
