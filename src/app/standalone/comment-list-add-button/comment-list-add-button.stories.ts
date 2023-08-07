import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommentListAddButtonComponent } from './comment-list-add-button.component';
import { TranslateModule } from '@ngx-translate/core';

export default {
  component: CommentListAddButtonComponent,
  title: 'CommentListAddButton',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [
        TranslateModule.forRoot(),
        CommentListAddButtonComponent,
        BrowserAnimationsModule,
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<CommentListAddButtonComponent>;

export const CommentListAddButton: Story = {};
