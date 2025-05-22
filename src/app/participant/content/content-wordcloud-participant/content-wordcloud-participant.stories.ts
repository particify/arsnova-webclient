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
import { ContentWordcloudParticipantComponent } from '@app/participant/content/content-wordcloud-participant/content-wordcloud-participant.component';
import { ContentWordcloud } from '@app/core/models/content-wordcloud';
import { MultipleTextsAnswer } from '@app/core/models/multiple-texts-answer';

class MockFormattingService {}

class MockContentAnswerService {}

export default {
  component: ContentWordcloudParticipantComponent,
  title: 'ContentWordcloudParticipant',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentWordcloudParticipantComponent],
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

type Story = StoryObj<ContentWordcloudParticipantComponent>;

const wordcloudContent = new ContentWordcloud(
  'roomId',
  'subject',
  'Text Content',
  [],
  ContentType.TEXT,
  3
);

export const Unanswered: Story = {
  args: {
    content: wordcloudContent,
  },
};

const wordcloudContentWithMoreMaxAnswers = new ContentWordcloud(
  'roomId',
  'subject',
  'Text Content',
  [],
  ContentType.TEXT,
  10
);

export const UnansweredMoreMaxAnswers: Story = {
  args: {
    content: wordcloudContentWithMoreMaxAnswers,
  },
};

export const UnansweredDisabled: Story = {
  args: {
    content: wordcloudContent,
    isDisabled: true,
  },
};

const wordcloudAnswer = new MultipleTextsAnswer(
  'contentId',
  1,
  ContentType.WORDCLOUD
);
wordcloudAnswer.texts = ['abc', 'test'];

export const Answered: Story = {
  args: {
    content: wordcloudContent,
    answer: wordcloudAnswer,
    isDisabled: true,
  },
};
