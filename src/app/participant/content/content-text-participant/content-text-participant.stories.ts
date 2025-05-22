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
import { ContentTextParticipantComponent } from '@app/participant/content/content-text-participant/content-text-participant.component';
import { Content } from '@app/core/models/content';
import { TextAnswer } from '@app/core/models/text-answer';

class MockFormattingService {}

class MockContentAnswerService {}

export default {
  component: ContentTextParticipantComponent,
  title: 'ContentTextParticipant',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentTextParticipantComponent],
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

type Story = StoryObj<ContentTextParticipantComponent>;

const textContent = new Content(
  'roomId',
  'subject',
  'Text Content',
  [],
  ContentType.TEXT
);

export const Unanswered: Story = {
  args: {
    content: textContent,
  },
};

export const UnansweredDisabled: Story = {
  args: {
    content: textContent,
    isDisabled: true,
  },
};

export const Answered: Story = {
  args: {
    content: textContent,
    answer: new TextAnswer('contentId', 1, 'abc'),
    isDisabled: true,
  },
};
