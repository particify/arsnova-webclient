import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommentSettingsHintComponent } from './comment-settings-hint.component';
import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { TranslocoRootModule } from '@app/transloco-root.module';

export default {
  component: CommentSettingsHintComponent,
  title: 'CommentSettingsHint',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [CommentSettingsHintComponent, BrowserAnimationsModule],
    }),
    applicationConfig({
      providers: [
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<CommentSettingsHintComponent>;

export const CommentSettingsHint: Story = {
  args: {
    disabled: false,
    readonly: false,
    showToggleButton: true,
  },
};
