import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { BaseCardComponent } from './base-card.component';

export default {
  component: BaseCardComponent,
  title: 'BaseCard',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [BaseCardComponent],
    }),
  ],
} as Meta;

type Story = StoryObj<BaseCardComponent>;

export const BaseCard: Story = {};
