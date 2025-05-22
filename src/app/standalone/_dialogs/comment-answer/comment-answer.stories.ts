import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { Comment } from '@app/core/models/comment';
import { CommentService } from '@app/core/services/http/comment.service';
import { CommentAnswerComponent } from './comment-answer.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { Observable, of } from 'rxjs';

import { ActivatedRoute } from '@angular/router';

class MockCommentService {}
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
      imports: [CommentAnswerComponent],
      providers: [
        {
          provide: CommentService,
          useClass: MockCommentService,
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
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                room: { id: 'roomId' },
              },
            },
          },
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<CommentAnswerComponent>;

export const CommentAnswer: Story = {};
