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
import { ContentShortAnswerParticipantComponent } from '@app/participant/content/content-short-answer-participant/content-short-answer-participant.component';
import { ContentShortAnswer } from '@app/core/models/content-short-answer';
import { ShortAnswerAnswer } from '@app/core/models/short-answer-answer';
import { ContentService } from '@app/core/services/http/content.service';

class MockFormattingService {}

class MockContentAnswerService {}

class MockContentService {
  getCorrectTerms() {
    return of(['a', 'b', 'c']);
  }
}

export default {
  component: ContentShortAnswerParticipantComponent,
  title: 'ContentShortAnswerParticipant',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentShortAnswerParticipantComponent],
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

type Story = StoryObj<ContentShortAnswerParticipantComponent>;

const shortAnswerContent = new ContentShortAnswer(
  'roomId',
  'subject',
  'Short answer Content',
  [],
  ['a', 'b', 'c'],
  ContentType.SHORT_ANSWER
);

export const Unanswered: Story = {
  args: {
    content: shortAnswerContent,
  },
};

export const UnansweredDisabled: Story = {
  args: {
    content: shortAnswerContent,
    isDisabled: true,
  },
};

export const Answered: Story = {
  args: {
    content: shortAnswerContent,
    answer: new ShortAnswerAnswer('contentId', 1, 'a'),
    isDisabled: true,
  },
};

export const AnsweredCorrect: Story = {
  args: {
    content: shortAnswerContent,
    answer: new ShortAnswerAnswer('contentId', 1, 'a'),
    isDisabled: true,
    correctOptionsPublished: true,
    isCorrect: true,
  },
};

export const AnsweredWrong: Story = {
  args: {
    content: shortAnswerContent,
    answer: new ShortAnswerAnswer('contentId', 1, 'abc'),
    isDisabled: true,
    correctOptionsPublished: true,
    isCorrect: false,
  },
};
