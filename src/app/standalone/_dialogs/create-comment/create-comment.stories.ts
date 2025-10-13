import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CreateCommentComponent } from './create-comment.component';

class MockMatDialogRef {}

export default {
  component: CreateCommentComponent,
  title: 'CreateComment',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [CreateCommentComponent],
      providers: [
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {},
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<CreateCommentComponent>;

export const CreateComment: Story = {};
