import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslocoModule } from '@ngneat/transloco';
import { CommentListHintComponent } from './comment-list-hint.component';

export default {
  component: CommentListHintComponent,
  title: 'CommentListHint',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [
        TranslocoModule,
        CommentListHintComponent,
        BrowserAnimationsModule,
      ],
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
