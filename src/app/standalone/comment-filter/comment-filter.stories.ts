import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { CommentFilterComponent } from './comment-filter.component';

export default {
  component: CommentFilterComponent,
  title: 'CommentFilter',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [CommentFilterComponent],
    }),
  ],
} as Meta;

type Story = StoryObj<CommentFilterComponent>;

export const CommentFilter: Story = {};
