import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import {
  ContentGroup,
  GroupType,
  PublishingMode,
} from '@app/core/models/content-group';

import { FormattingService } from '@app/core/services/http/formatting.service';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { ContentType } from '@app/core/models/content-type.enum';
import { ContentService } from '@app/core/services/http/content.service';
import { AnswerOption } from '@app/core/models/answer-option';
import { ContentSortParticipantComponent } from '@app/participant/content/content-sort-participant/content-sort-participant.component';
import { ContentChoice } from '@app/core/models/content-choice';
import { ChoiceAnswer } from '@app/core/models/choice-answer';

class MockFormattingService {}

class MockContentAnswerService {
  shuffleAnswerOptions() {
    return [
      new AnswerOption('Answer 1'),
      new AnswerOption('Answer 2'),
      new AnswerOption('Answer 3'),
      new AnswerOption('Answer 4'),
    ];
  }
}

class MockContentService {
  getCorrectChoiceIndexes() {
    return of([0, 1, 2, 3]);
  }
}

export default {
  component: ContentSortParticipantComponent,
  title: 'ContentSortParticipant',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentSortParticipantComponent],
      providers: [
        {
          provide: FormattingService,
          useClass: MockFormattingService,
        },
        {
          provide: ContentAnswerService,
          useClass: MockContentAnswerService,
        },
        {
          provide: ContentService,
          useClass: MockContentService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                apiConfig: { ui: {} },
                room: {
                  id: 'roomId',
                  name: 'My awesome room',
                  shortId: '12345678',
                  description: 'This is my awesome room description.',
                  settings: {},
                },
                contentGroup: new ContentGroup(
                  'roomId',
                  'My mixed series',
                  ['content1', 'content2', 'content3', 'content4'],
                  true,
                  true,
                  true,
                  PublishingMode.ALL,
                  0,
                  GroupType.MIXED,
                  false
                ),
              },
              params: {
                shortId: '12345678',
                seriesName: 'My mixed series',
              },
            },
          },
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentSortParticipantComponent>;

const sortContent = new ContentChoice(
  'roomId',
  'subject',
  'Content 1',
  [],
  [
    new AnswerOption('Answer 1'),
    new AnswerOption('Answer 2'),
    new AnswerOption('Answer 3'),
    new AnswerOption('Answer 4'),
  ],
  [0, 1, 2, 3],
  false,
  ContentType.SORT
);
sortContent.id = 'singleWithCorrect';

export const Unselected: Story = {
  args: {
    content: sortContent,
  },
};

export const UnselectedDisabled: Story = {
  args: {
    content: sortContent,
    isDisabled: true,
  },
};

const sortCorrectAnswer = new ChoiceAnswer('contentId', 1, ContentType.SORT);
sortCorrectAnswer.selectedChoiceIndexes = [0, 1, 2, 3];

export const Selected: Story = {
  args: {
    content: sortContent,
    answer: sortCorrectAnswer,
  },
};

export const AnsweredCorrect: Story = {
  args: {
    content: sortContent,
    answer: sortCorrectAnswer,
    isDisabled: true,
    correctOptionsPublished: true,
  },
};

export const AnsweredCorrectButCorrectOptionsAreNotPublished: Story = {
  args: {
    content: sortContent,
    answer: sortCorrectAnswer,
    isDisabled: true,
    correctOptionsPublished: false,
  },
};

const sortWrongAnswer = new ChoiceAnswer('contentId', 1, ContentType.SORT);
sortWrongAnswer.selectedChoiceIndexes = [1, 0, 2, 3];

export const AnsweredWrong: Story = {
  args: {
    content: sortContent,
    answer: sortWrongAnswer,
    isDisabled: true,
    correctOptionsPublished: true,
  },
};
