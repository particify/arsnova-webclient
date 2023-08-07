import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { DividerComponent } from '@app/standalone/divider/divider.component';

export default {
  component: DividerComponent,
  title: 'Divider',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [DividerComponent],
    }),
  ],
} as Meta;

type Story = StoryObj<DividerComponent>;

export const Divider: Story = {
  args: {
    padding: true,
  },
};
