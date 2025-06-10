import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { CommentListBarComponent } from './comment-list-bar.component';

export default {
  component: CommentListBarComponent,
  title: 'CommentListBar',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [CommentListBarComponent],
    }),
  ],
} as Meta;

type Story = StoryObj<CommentListBarComponent>;

export const CommentListBar: Story = {};
