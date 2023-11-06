import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommentListHintComponent } from './comment-list-hint.component';
import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { TranslocoRootModule } from '@app/transloco-root.module';

export default {
  component: CommentListHintComponent,
  title: 'CommentListHint',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [CommentListHintComponent, BrowserAnimationsModule],
    }),
    applicationConfig({
      providers: [
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
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
