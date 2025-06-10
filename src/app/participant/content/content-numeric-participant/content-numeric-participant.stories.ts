import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { ActivatedRoute } from '@angular/router';
import {
  ContentGroup,
  GroupType,
  PublishingMode,
} from '@app/core/models/content-group';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { ContentType } from '@app/core/models/content-type.enum';
import { ContentNumeric } from '@app/core/models/content-numeric';
import { ContentNumericParticipantComponent } from '@app/participant/content/content-numeric-participant/content-numeric-participant.component';
import { NumericAnswer } from '@app/core/models/numeric-answer';

class MockFormattingService {}

class MockContentAnswerService {}

export default {
  component: ContentNumericParticipantComponent,
  title: 'ContentNumericParticipant',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentNumericParticipantComponent],
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

type Story = StoryObj<ContentNumericParticipantComponent>;

const numericContent = new ContentNumeric(
  'roomId',
  'subject',
  'Numeric Content',
  [],
  ContentType.NUMERIC,
  1,
  100,
  0
);

export const Unanswered: Story = {
  args: {
    content: numericContent,
  },
};

export const UnansweredDisabled: Story = {
  args: {
    content: numericContent,
    isDisabled: true,
  },
};

const numericAnswer = new NumericAnswer('contentId', 1, ContentType.NUMERIC);
numericAnswer.selectedNumber = 99;

export const Answered: Story = {
  args: {
    content: numericContent,
    answer: numericAnswer,
    isDisabled: true,
  },
};

const numericContentWithCorrect = new ContentNumeric(
  'roomId',
  'subject',
  'Numeric Content With Correct',
  [],
  ContentType.NUMERIC,
  1,
  100,
  0,
  42
);

const correctNumericAnswer = new NumericAnswer(
  'contentId',
  1,
  ContentType.NUMERIC
);
correctNumericAnswer.selectedNumber = 42;

export const AnsweredCorrectly: Story = {
  args: {
    content: numericContentWithCorrect,
    answer: correctNumericAnswer,
    correctOptionsPublished: true,
    isDisabled: true,
  },
};

const wrongNumericAnswer = new NumericAnswer(
  'contentId',
  1,
  ContentType.NUMERIC
);
wrongNumericAnswer.selectedNumber = 24;

export const AnsweredCWrong: Story = {
  args: {
    content: numericContentWithCorrect,
    answer: wrongNumericAnswer,
    correctOptionsPublished: true,
    isDisabled: true,
  },
};

const numericContentWithCorrectAndTolerance = new ContentNumeric(
  'roomId',
  'subject',
  'Numeric Content With Correct',
  [],
  ContentType.NUMERIC,
  1,
  100,
  2,
  42
);

const correctNumericAnswerWithTolerance = new NumericAnswer(
  'contentId',
  1,
  ContentType.NUMERIC
);
correctNumericAnswerWithTolerance.selectedNumber = 40;

export const AnsweredCorrectlyWithTolerance: Story = {
  args: {
    content: numericContentWithCorrectAndTolerance,
    answer: correctNumericAnswerWithTolerance,
    correctOptionsPublished: true,
    isDisabled: true,
  },
};
