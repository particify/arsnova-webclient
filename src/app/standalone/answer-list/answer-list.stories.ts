import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { AnswerListComponent } from '@app/standalone/answer-list/answer-list.component';
import { ActivatedRoute } from '@angular/router';
import { TextCount } from '@app/core/models/text-count';
import { UserRole } from '@app/core/models/user-roles.enum';

class MockActivatedRoute {
  snapshot = {
    data: {
      viewRole: UserRole.EDITOR,
    },
  };
}

export default {
  component: AnswerListComponent,
  title: 'AnswerList',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [AnswerListComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useClass: MockActivatedRoute,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<AnswerListComponent>;

const answers = [
  new TextCount('Answer 1', 5, '1'),
  new TextCount('Answer 2', 4, '2'),
  new TextCount('Answer 3', 2, '3'),
  new TextCount('Answer 4', 1, '4'),
  new TextCount('Answer 5', 1, '5'),
  new TextCount('Answer 6', 1, '6'),
];

export const AnswerList: Story = {
  args: {
    answers: answers,
    banMode: true,
    isPresentation: false,
  },
};
