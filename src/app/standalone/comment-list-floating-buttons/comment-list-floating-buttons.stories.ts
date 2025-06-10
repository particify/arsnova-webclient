import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { CommentListFloatingButtonsComponent } from './comment-list-floating-buttons.component';

export default {
  component: CommentListFloatingButtonsComponent,
  title: 'CommentListFloatingButtons',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [CommentListFloatingButtonsComponent],
    }),
  ],
} as Meta;

type Story = StoryObj<CommentListFloatingButtonsComponent>;

export const CommentListFloatingButtons: Story = {
  args: {
    showAddButton: true,
    showScrollButton: true,
    showScrollToNewPostsButton: true,
    addButtonDisabled: false,
    navBarExists: false,
  },
};
