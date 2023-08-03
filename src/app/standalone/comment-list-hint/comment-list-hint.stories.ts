import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { CommentListHintComponent } from './comment-list-hint.component';

export default {
  component: CommentListHintComponent,
  title: 'CommentListHint',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [
        TranslateModule.forRoot(),
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
