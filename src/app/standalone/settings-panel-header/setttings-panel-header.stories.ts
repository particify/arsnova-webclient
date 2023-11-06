import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';
import { SettingsPanelHeaderComponent } from '@app/standalone/settings-panel-header/settings-panel-header.component';
import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { TranslocoRootModule } from '@app/transloco-root.module';

export default {
  component: SettingsPanelHeaderComponent,
  title: 'SettingsPanelHeader',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [SettingsPanelHeaderComponent],
    }),
    applicationConfig({
      providers: [
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
      ],
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
