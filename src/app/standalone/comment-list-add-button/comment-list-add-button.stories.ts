import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommentListAddButtonComponent } from './comment-list-add-button.component';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';

export default {
  component: CommentListAddButtonComponent,
  title: 'CommentListAddButton',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [CommentListAddButtonComponent, BrowserAnimationsModule],
    }),
    applicationConfig({
      providers: [
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<CommentListAddButtonComponent>;

export const CommentListAddButton: Story = {};
