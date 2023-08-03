import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { CommentSettingsHintComponent } from './comment-settings-hint.component';

export default {
  component: CommentSettingsHintComponent,
  title: 'CommentSettingsHint',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [
        TranslateModule.forRoot(),
        CommentSettingsHintComponent,
        BrowserAnimationsModule,
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
