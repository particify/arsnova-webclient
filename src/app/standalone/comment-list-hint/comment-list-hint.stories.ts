import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { CommentListHintComponent } from './comment-list-hint.component';

export default {
  component: CommentListHintComponent,
  title: 'CommentListHint',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [CommentListHintComponent],
    }),
  ],
} as Meta;

type Story = StoryObj<CommentListHintComponent>;

export const CommentListHint: Story = {
  args: {
    noPostsFound: true,
    isListEmpty: true,
  },
};
