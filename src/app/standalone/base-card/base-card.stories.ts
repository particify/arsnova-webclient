import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BaseCardComponent } from './base-card.component';

export default {
  component: BaseCardComponent,
  title: 'BaseCard',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [BaseCardComponent, BrowserAnimationsModule],
    }),
  ],
} as Meta;

type Story = StoryObj<BaseCardComponent>;

export const Card: Story = {};
