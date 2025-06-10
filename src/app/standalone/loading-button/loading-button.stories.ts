import { LoadingButtonComponent } from './loading-button.component';

import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { HotkeyAction } from '@app/core/directives/hotkey.directive';

export default {
  component: LoadingButtonComponent,
  title: 'LoadingButton',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [LoadingButtonComponent],
    }),
  ],
  argTypes: {
    clicked: { action: 'clicked' },
  },
} as Meta;

type Story = StoryObj<LoadingButtonComponent>;

export const LoadingButton: Story = {
  args: {
    name: 'Click me',
    isDialog: false,
    fullWidth: false,
    color: 'primary',
    aria: 'aria',
    hotkey: 'hotkey',
    hotkeyTitle: 'hotkey title',
    hotkeyAction: HotkeyAction.CLICK,
    trackInteraction: 'track interaction',
    trackName: 'track name',
    disabled: false,
    useDirectives: false,
  },
};
