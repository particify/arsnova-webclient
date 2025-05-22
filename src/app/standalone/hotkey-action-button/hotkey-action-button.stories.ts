import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { HotkeyActionButtonComponent } from '@app/standalone/hotkey-action-button/hotkey-action-button.component';

export default {
  component: HotkeyActionButtonComponent,
  title: 'HotkeyActionButton',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [HotkeyActionButtonComponent],
    }),
  ],
} as Meta;

type Story = StoryObj<HotkeyActionButtonComponent>;

export const Hotkey1: Story = {
  args: {
    hotkey: 'p',
    hotkeyTitle: 'Publish content',
    action: 'to publish content',
    infoLabel: 'Content is locked',
    infoIcon: 'locked',
    isNavBarVisible: true,
  },
};

export const Hotkey2: Story = {
  args: {
    hotkey: 't',
    hotkeyTitle: 'Test this button',
    action: 'to test this button',
    isNavBarVisible: true,
  },
};
