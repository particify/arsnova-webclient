import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { CommentListAddButtonComponent } from './comment-list-add-button.component';

export default {
  component: CommentListAddButtonComponent,
  title: 'CommentListAddButton',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [CommentListAddButtonComponent],
    }),
  ],
} as Meta;

type Story = StoryObj<CommentListAddButtonComponent>;

export const CommentListAddButton: Story = {};
