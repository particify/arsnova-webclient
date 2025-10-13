import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { ActivatedRoute } from '@angular/router';
import { CommentComponent } from '@app/standalone/comment/comment.component';
import { ModerationState, Post } from '@gql/generated/graphql';

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
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<CommentComponent>;

const standardComment: Post = {
  id: 'postId1',
  body: 'This is a comment body',
  createdAt: new Date().toDateString(),
  favorite: false,
  score: 42,
  moderationState: ModerationState.Approved,
  tags: [],
  replies: [],
};

export const StandardComment: Story = {
  args: {
    post: standardComment,
    isEditor: true,
  },
};

const favoriteComment: Post = {
  id: 'postId2',
  body: 'This is a favorite comment',
  createdAt: new Date().toDateString(),
  favorite: true,
  score: 99,
  moderationState: ModerationState.Approved,
  tags: [],
  replies: [],
};

export const FavoriteComment: Story = {
  args: {
    post: favoriteComment,
    isEditor: true,
  },
};
