import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { CommentSettingsHintComponent } from './comment-settings-hint.component';
import { QnaState } from '@gql/generated/graphql';

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

export const Stopped: Story = {
  args: {
    state: QnaState.Stopped,
    showToggleButton: true,
  },
};

export const Paused: Story = {
  args: {
    state: QnaState.Paused,
    showToggleButton: false,
  },
};
