import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { ActivatedRoute } from '@angular/router';
import { CommentComponent } from '@app/standalone/comment/comment.component';
import { Comment } from '@app/core/models/comment';
import { CommentService } from '@app/core/services/http/comment.service';

class MockCommentService {}

export default {
  component: CommentComponent,
  title: 'Comment',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [CommentComponent],
      providers: [
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
        {
          provide: CommentService,
          useClass: MockCommentService,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<CommentComponent>;

const standardComment = new Comment();
standardComment.id = 'commentId1';
standardComment.roomId = 'roomId';
standardComment.body = 'This is a comment body';
standardComment.timestamp = new Date();

export const StandardComment: Story = {
  args: {
    comment: standardComment,
    isEditor: true,
  },
};

const favoriteComment = new Comment();
favoriteComment.id = 'commentId2';
favoriteComment.roomId = 'roomId';
favoriteComment.body = 'This is a another comment which is a favorite';
favoriteComment.timestamp = new Date();
favoriteComment.favorite = true;

export const FavoriteComment: Story = {
  args: {
    comment: favoriteComment,
    isEditor: true,
  },
};
