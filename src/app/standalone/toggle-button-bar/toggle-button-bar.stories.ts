import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { ToggleButtonBarComponent } from './toggle-button-bar.component';

export default {
  component: ToggleButtonBarComponent,
  title: 'ToggleButtonBar',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ToggleButtonBarComponent],
    }),
  ],
} as Meta;

type Story = StoryObj<ToggleButtonBarComponent>;

export const ToggleButtonBar: Story = {
  args: {
    buttons: [
      {
        id: 'cloud',
        icon: 'cloud',
        tooltip: 'Show wordcloud',
      },
      {
        id: 'list',
        icon: 'grid_view',
        tooltip: 'Show list',
      },
    ],
    activeButtonId: 'cloud',
  },
};
