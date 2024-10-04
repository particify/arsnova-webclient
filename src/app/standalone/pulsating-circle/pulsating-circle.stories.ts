import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PulsatingCircleComponent } from '@app/standalone/pulsating-circle/pulsating-circle.component';

export default {
  component: PulsatingCircleComponent,
  title: 'PulsatingCircle',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [PulsatingCircleComponent],
    }),
  ],
} as Meta;

type Story = StoryObj<PulsatingCircleComponent>;

export const PulsatingCircle: Story = {
  args: {
    size: 8,
  },
};
