import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { CommentAnswerComponent } from './comment-answer.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { Observable, of } from 'rxjs';

import { ActivatedRoute } from '@angular/router';
import { ModerationState, Post } from '@gql/generated/graphql';

class MockMatDialogRef {}
class MockFormattingService {
  postString(text: string): Observable<string> {
    return of(text);
  }
}

const post: Post = {
  id: 'postId',
  body: 'This is a comment body',
  createdAt: new Date().toDateString(),
  favorite: false,
  score: 42,
  moderationState: ModerationState.Approved,
  tags: [],
  replies: [
    {
      id: 'answerId',
      body: 'This is a answer',
      bodyRendered: 'This is a answer',
      createdAt: new Date().toDateString(),
    },
  ],
};

const data = {
  post: post,
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
