import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import {
  ContentType,
  QuestionnaireAnswerByRoundIdGql,
  QuestionnaireTextAnswersByRoundIdGql,
  QuestionnaireTextAnswersUpdatedGql,
  ToggleQuestionnaireTextAnswerHiddenGql,
} from '@gql/generated/graphql';
import { NEVER, of } from 'rxjs';
import { TextResultsComponent } from './text-results.component';

function answer(id: string, body: string) {
  return {
    __typename: 'Answer',
    id,
    hidden: false,
    result: 'NEUTRAL',
    formatData: { __typename: 'TextAnswerFormatData', format: 'TEXT', body },
  };
}

const answersMock = {
  watch: () => ({
    valueChanges: of({
      dataState: 'complete',
      data: {
        questionnaireTextAnswersByRoundId: [
          answer('a-1', 'Small steps, every day.'),
          answer('a-2', 'Asking questions early.'),
          answer('a-3', 'Reading the docs first.'),
        ],
      },
    }),
  }),
};

const ownAnswerMock = {
  watch: () => ({
    valueChanges: of({
      dataState: 'complete',
      data: {
        questionnaireAnswerByRoundId: answer('a-2', 'Asking questions early.'),
      },
    }),
  }),
};

export default {
  component: TextResultsComponent,
  title: 'TextResults',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [TextResultsComponent],
      providers: [
        {
          provide: QuestionnaireTextAnswersByRoundIdGql,
          useValue: answersMock,
        },
        { provide: QuestionnaireAnswerByRoundIdGql, useValue: ownAnswerMock },
        {
          provide: QuestionnaireTextAnswersUpdatedGql,
          useValue: { subscribe: () => NEVER },
        },
        {
          provide: ToggleQuestionnaireTextAnswerHiddenGql,
          useValue: { mutate: () => of({ data: {} }) },
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<TextResultsComponent>;

const formatData = (answersPublished: boolean) => ({
  __typename: 'TextContentFormatData' as const,
  format: ContentType.Text,
  answersPublished,
});

export const Answers: Story = {
  args: { formatData: formatData(false), roundIds: ['round-1'] },
};

export const Moderation: Story = {
  args: {
    formatData: formatData(false),
    roundIds: ['round-1'],
    allowAnswerModeration: true,
  },
};

export const ParticipantBeforePublishing: Story = {
  args: {
    formatData: formatData(false),
    roundIds: ['round-1'],
    viewAsParticipant: true,
  },
};

export const ParticipantAfterPublishing: Story = {
  args: {
    formatData: formatData(true),
    roundIds: ['round-1'],
    viewAsParticipant: true,
  },
};
