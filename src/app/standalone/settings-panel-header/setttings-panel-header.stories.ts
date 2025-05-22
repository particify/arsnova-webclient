import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { SettingsPanelHeaderComponent } from '@app/standalone/settings-panel-header/settings-panel-header.component';

export default {
  component: SettingsPanelHeaderComponent,
  title: 'SettingsPanelHeader',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [SettingsPanelHeaderComponent],
    }),
  ],
} as Meta;

type Story = StoryObj<SettingsPanelHeaderComponent>;

export const SettingsPanelHeader: Story = {
  args: {
    text: 'Settings header text',
    icon: 'settings',
  },
};
