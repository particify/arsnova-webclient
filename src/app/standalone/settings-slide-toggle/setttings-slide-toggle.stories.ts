import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';

import { SettingsSlideToggleComponent } from '@app/standalone/settings-slide-toggle/settings-slide-toggle.component';
import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { TranslocoRootModule } from '@app/transloco-root.module';

export default {
  component: SettingsSlideToggleComponent,
  title: 'SettingsSlideToggle',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [SettingsSlideToggleComponent],
    }),
    applicationConfig({
      providers: [
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
      ],
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
