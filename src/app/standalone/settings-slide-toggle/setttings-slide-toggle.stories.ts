import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsSlideToggleComponent } from '@app/standalone/settings-slide-toggle/settings-slide-toggle.component';

export default {
  component: SettingsSlideToggleComponent,
  title: 'SettingsSlideToggle',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [TranslateModule.forRoot(), SettingsSlideToggleComponent],
    }),
  ],
} as Meta;

type Story = StoryObj<SettingsSlideToggleComponent>;

export const SettingsSlideToggle: Story = {
  args: {
    isChecked: true,
    label: 'Label for the toggle',
    disabled: false,
  },
};
