import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { ContentChoiceParticipantComponent } from './content-choice-participant.component';
import {
  AnswerResultState,
  ChoiceContentFormatData,
  ContentType,
  CreateQuestionnaireChoiceAnswerGql,
} from '@gql/generated/graphql';
import { of } from 'rxjs';
import { FormattingService } from '@app/core/services/http/formatting.service';

const createQuestionnaireChoiceAnswerGqlMock = {
  mutate: () =>
    of({
      data: {
        createQuestionnaireChoiceAnswer: {
          __typename: 'ChoiceAnswer',
          id: 'answer-1',
          contentId: 'contentId',
          selectedChoiceIndexes: [1],
        },
      },
    }),
};

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
          useValue: {},
        },
        {
          provide: CreateQuestionnaireChoiceAnswerGql,
          useValue: createQuestionnaireChoiceAnswerGqlMock,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentChoiceParticipantComponent>;

const choiceContentFormatData: ChoiceContentFormatData = {
  __typename: 'ChoiceContentFormatData',
  format: ContentType.Choice,
  multiple: false,
  correctOptionIndexes: [1],
  options: [
    {
      __typename: 'AnswerOption',
      label: 'A',
      labelRendered: '<p>A</p>',
    },
    {
      __typename: 'AnswerOption',
      label: 'B',
      labelRendered: '<p>B</p>',
    },
    {
      __typename: 'AnswerOption',
      label: 'C',
      labelRendered: '<p>C</p>',
    },
    {
      __typename: 'AnswerOption',
      label: 'D',
      labelRendered: '<p>D</p>',
    },
  ],
};

const unansweredArgs = {
  contentId: 'contentId',
  contentFormatData: choiceContentFormatData,
};

export const Unselected: Story = {
  args: unansweredArgs,
};

export const Selected: Story = {
  args: {
    ...unansweredArgs,
    answerFormatData: {
      __typename: 'ChoiceAnswerFormatData',
      format: ContentType.Choice,
      selectedChoiceIndexes: [1],
    },
  },
};

export const AnsweredCorrect: Story = {
  args: {
    ...unansweredArgs,
    answerFormatData: {
      __typename: 'ChoiceAnswerFormatData',
      format: ContentType.Choice,
      selectedChoiceIndexes: [1],
    },
    result: AnswerResultState.Correct,
    correctOptionsPublished: true,
  },
};

export const AnsweredCorrectButCorrectOptionsAreNotPublished: Story = {
  args: {
    ...unansweredArgs,
    answerFormatData: {
      __typename: 'ChoiceAnswerFormatData',
      format: ContentType.Choice,
      selectedChoiceIndexes: [1],
    },
    result: AnswerResultState.Correct,
    correctOptionsPublished: false,
  },
};

export const AnsweredWrong: Story = {
  args: {
    ...unansweredArgs,
    answerFormatData: {
      __typename: 'ChoiceAnswerFormatData',
      format: ContentType.Choice,
      selectedChoiceIndexes: [2],
    },
    result: AnswerResultState.Wrong,
    correctOptionsPublished: true,
  },
};
