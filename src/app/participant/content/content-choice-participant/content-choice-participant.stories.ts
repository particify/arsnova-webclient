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
import { Content } from '@app/core/models/content';
import { ContentType } from '@app/core/models/content-type.enum';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentChoice } from '@app/core/models/content-choice';
import { AnswerOption } from '@app/core/models/answer-option';
import { ContentChoiceParticipantComponent } from '@app/participant/content/content-choice-participant/content-choice-participant.component';
import { ChoiceAnswer } from '@app/core/models/choice-answer';

class MockFormattingService {}

class MockContentAnswerService {}

class MockContentService {
  private contents: Content[] = [
    new ContentChoice(
      'roomId',
      'subject',
      'Single Choice with correct option',
      [],
      [
        new AnswerOption('Answer 1'),
        new AnswerOption('Answer 2'),
        new AnswerOption('Answer 3'),
        new AnswerOption('Answer 4'),
      ],
      [1],
      false,
      ContentType.CHOICE
    ),
    new ContentChoice(
      'roomId',
      'subject',
      'Multiple choice with correct options',
      [],
      [
        new AnswerOption('Answer 1'),
        new AnswerOption('Answer 2'),
        new AnswerOption('Answer 3'),
        new AnswerOption('Answer 4'),
      ],
      [0, 2],
      true,
      ContentType.CHOICE
    ),
    new ContentChoice(
      'roomId',
      'subject',
      'Single choice without correct',
      [],
      [
        new AnswerOption('Answer 1'),
        new AnswerOption('Answer 2'),
        new AnswerOption('Answer 3'),
        new AnswerOption('Answer 4'),
      ],
      [],
      false,
      ContentType.CHOICE
    ),
    new ContentChoice(
      'roomId',
      'subject',
      'Multiple choice without correct',
      [],
      [
        new AnswerOption('Answer 1'),
        new AnswerOption('Answer 2'),
        new AnswerOption('Answer 3'),
        new AnswerOption('Answer 4'),
      ],
      [],
      true,
      ContentType.CHOICE
    ),
  ];

  getCorrectChoiceIndexes(roomId: string, contentId: string) {
    this.contents[0].id = 'singleWithCorrect';
    this.contents[1].id = 'multipleWithCorrect';
    this.contents[2].id = 'singleWithoutCorrect';
    this.contents[3].id = 'multiplrWithoutCorrect';
    return of(
      (
        this.contents.find(
          (c) => c.roomId === roomId && c.id === contentId
        ) as ContentChoice
      ).correctOptionIndexes
    );
  }
}

export default {
  component: ContentChoiceParticipantComponent,
  title: 'ContentChoiceParticipant',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentChoiceParticipantComponent],
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

type Story = StoryObj<ContentChoiceParticipantComponent>;

const singleChoiceContent = new ContentChoice(
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
  [1],
  false,
  ContentType.CHOICE
);
singleChoiceContent.id = 'singleWithCorrect';

export const Unselected: Story = {
  args: {
    content: singleChoiceContent,
  },
};

export const UnselectedDisabled: Story = {
  args: {
    content: singleChoiceContent,
    isDisabled: true,
  },
};

const singleChoiceCorrectAnswer = new ChoiceAnswer(
  'contentId',
  1,
  ContentType.CHOICE
);
singleChoiceCorrectAnswer.selectedChoiceIndexes = [1];

export const Selected: Story = {
  args: {
    content: singleChoiceContent,
    answer: singleChoiceCorrectAnswer,
  },
};

export const AnsweredCorrect: Story = {
  args: {
    content: singleChoiceContent,
    answer: singleChoiceCorrectAnswer,
    isDisabled: true,
    correctOptionsPublished: true,
  },
};

export const AnsweredCorrectButCorrectOptionsAreNotPublished: Story = {
  args: {
    content: singleChoiceContent,
    answer: singleChoiceCorrectAnswer,
    isDisabled: true,
    correctOptionsPublished: false,
  },
};

const singleChoiceWrongAnswer = new ChoiceAnswer(
  'contentId',
  1,
  ContentType.CHOICE
);
singleChoiceWrongAnswer.selectedChoiceIndexes = [2];

export const AnsweredWrong: Story = {
  args: {
    content: singleChoiceContent,
    answer: singleChoiceWrongAnswer,
    isDisabled: true,
    correctOptionsPublished: true,
  },
};
