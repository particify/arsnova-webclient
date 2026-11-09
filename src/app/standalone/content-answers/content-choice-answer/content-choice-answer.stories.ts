import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { ContentChoiceAnswerComponent } from './content-choice-answer.component';

import { SelectableOption } from '@app/core/models/selectable-option';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { ActivatedRoute } from '@angular/router';

class MockFormattingService {}

export default {
  component: ContentChoiceAnswerComponent,
  title: 'ContentChoiceAnswer',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentChoiceAnswerComponent, RenderedTextComponent],
      providers: [
        {
          provide: FormattingService,
          useClass: MockFormattingService,
        },
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

type Story = StoryObj<ContentChoiceAnswerComponent>;

const selectableAnswers = [
  new SelectableOption({ label: '*answer 1*' }, false),
  new SelectableOption({ label: 'answer 2' }, false),
  new SelectableOption({ label: 'answer 3' }, false),
  new SelectableOption({ label: 'answer 4' }, false),
];

selectableAnswers[0].option.labelRendered = '<b>answer 1</b>';

export const ContentChoiceAnswer: Story = {
  args: {
    answerOptions: selectableAnswers,
    disabled: false,
    multipleAnswersAllowed: false,
    correctOptionsPublished: false,
    correctOptionIndexes: [1],
    dynamicRendering: false,
  },
};
