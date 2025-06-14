import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { ContentChoiceAnswerComponent } from './content-choice-answer.component';

import { SelectableAnswer } from '@app/core/models/selectable-answer';
import { AnswerOption } from '@app/core/models/answer-option';
import { ChoiceAnswer } from '@app/core/models/choice-answer';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { ContentType } from '@app/core/models/content-type.enum';
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
  new SelectableAnswer(new AnswerOption('*answer 1*'), false),
  new SelectableAnswer(new AnswerOption('answer 2'), false),
  new SelectableAnswer(new AnswerOption('answer 3'), false),
  new SelectableAnswer(new AnswerOption('answer 4'), false),
];

selectableAnswers[0].answerOption.renderedLabel = '<b>answer 1</b>';

export const ContentChoiceAnswer: Story = {
  args: {
    answer: new ChoiceAnswer('contentId', 1, ContentType.CHOICE),
    selectableAnswers: selectableAnswers,
    isDisabled: false,
    multipleAnswersAllowed: false,
    hasAbstained: false,
    hasCorrectAnswer: false,
    isCorrectAnswerPublished: false,
    correctOptionIndexes: [1],
    contentId: 'contentId',
    dynamicRendering: false,
  },
};
