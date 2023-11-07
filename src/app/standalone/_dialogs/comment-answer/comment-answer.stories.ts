import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';

import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { Comment } from '@app/core/models/comment';
import { CommentService } from '@app/core/services/http/comment.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommentAnswerComponent } from './comment-answer.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { Observable, of } from 'rxjs';
import { importProvidersFrom } from '@angular/core';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { HttpClientModule } from '@angular/common/http';

class MockHotkeyService {
  unregisterHotkey() {}
}
class MockCommentService {}
class MockNotificationService {}
class MockDialogService {}
class MockAnnounceService {}
class MockMatDialogRef {}
class MockFormattingService {
  postString(text: string): Observable<string> {
    return of(text);
  }
}

const comment = new Comment();
comment.id = 'commentId';
comment.roomId = 'roomId';
comment.body = 'This is a comment body';
comment.timestamp = new Date();
comment.answer = 'answer';

const data = {
  comment: comment,
  isEditor: true,
};

export default {
  component: CommentAnswerComponent,
  title: 'CommentAnswer',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [CommentAnswerComponent, BrowserAnimationsModule],
      providers: [
        {
          provide: HotkeyService,
          useClass: MockHotkeyService,
        },
        {
          provide: CommentService,
          useClass: MockCommentService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: DialogService,
          useClass: MockDialogService,
        },
        {
          provide: AnnounceService,
          useClass: MockAnnounceService,
        },
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: data,
        },
        {
          provide: FormattingService,
          useClass: MockFormattingService,
        },
      ],
    }),
    applicationConfig({
      providers: [
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<CommentAnswerComponent>;

export const CommentAnswer: Story = {};
