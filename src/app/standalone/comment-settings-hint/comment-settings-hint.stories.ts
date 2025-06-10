import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { CommentSettingsHintComponent } from './comment-settings-hint.component';

export default {
  component: CommentSettingsHintComponent,
  title: 'CommentSettingsHint',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [CommentSettingsHintComponent],
    }),
  ],
} as Meta;

type Story = StoryObj<CommentSettingsHintComponent>;

export const CommentSettingsHint: Story = {
  args: {
    disabled: true,
    readonly: false,
    showToggleButton: true,
  },
};
