import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslocoModule } from '@ngneat/transloco';
import { CommentSettingsHintComponent } from './comment-settings-hint.component';

export default {
  component: CommentSettingsHintComponent,
  title: 'CommentSettingsHint',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [
        TranslocoModule,
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
