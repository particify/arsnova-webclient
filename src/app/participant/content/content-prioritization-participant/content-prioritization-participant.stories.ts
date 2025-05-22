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
import { ContentPrioritizationParticipantComponent } from '@app/participant/content/content-prioritization-participant/content-prioritization-participant.component';
import { ContentPrioritization } from '@app/core/models/content-prioritization';
import { AnswerOption } from '@app/core/models/answer-option';
import { PrioritizationAnswer } from '@app/core/models/prioritization-answer';

class MockFormattingService {}

class MockContentAnswerService {}

export default {
  component: ContentPrioritizationParticipantComponent,
  title: 'ContentPrioritizationParticipant',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentPrioritizationParticipantComponent],
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

type Story = StoryObj<ContentPrioritizationParticipantComponent>;

const prioritizationContent = new ContentPrioritization(
  'roomId',
  'subject',
  'Prioritization Content',
  [],
  [
    new AnswerOption('Answer 1'),
    new AnswerOption('Answer 2'),
    new AnswerOption('Answer 3'),
    new AnswerOption('Answer 4'),
  ],
  ContentType.PRIORITIZATION,
  100
);

export const Unanswered: Story = {
  args: {
    content: prioritizationContent,
  },
};

export const UnansweredDisabled: Story = {
  args: {
    content: prioritizationContent,
    isDisabled: true,
  },
};

const prioritizationAnswer = new PrioritizationAnswer(
  'contentId',
  1,
  ContentType.PRIORITIZATION
);
prioritizationAnswer.assignedPoints = [25, 42, 13, 20];

export const Answered: Story = {
  args: {
    content: prioritizationContent,
    answer: prioritizationAnswer,
    isDisabled: true,
  },
};
