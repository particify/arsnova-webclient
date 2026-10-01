import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import {
  BanQuestionnaireShortAnswerContentKeywordGql,
  ContentType,
  QuestionnaireShortAnswerRoundStatsByRoundIdGql,
  QuestionnaireShortAnswerRoundStatsUpdatedGql,
} from '@gql/generated/graphql';
import { NEVER, of } from 'rxjs';
import { ShortAnswerResultsComponent } from './short-answer-results.component';

const roundStatsMock = {
  watch: () => ({
    valueChanges: of({
      dataState: 'complete',
      data: {
        questionnaireShortAnswerRoundStatsByRoundId: {
          __typename: 'ShortAnswerContentRoundStats',
          texts: ['Paris', 'Lyon', 'Marseille'],
          counts: [14, 3, 1],
        },
      },
    }),
  }),
};

export default {
  component: ShortAnswerResultsComponent,
  title: 'ShortAnswerResults',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ShortAnswerResultsComponent],
      providers: [
        {
          provide: QuestionnaireShortAnswerRoundStatsByRoundIdGql,
          useValue: roundStatsMock,
        },
        {
          provide: QuestionnaireShortAnswerRoundStatsUpdatedGql,
          useValue: { subscribe: () => NEVER },
        },
        {
          provide: BanQuestionnaireShortAnswerContentKeywordGql,
          useValue: { mutate: () => of({}) },
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ShortAnswerResultsComponent>;

const formatData = {
  __typename: 'ShortAnswerContentFormatData' as const,
  format: ContentType.ShortAnswer,
  correctTerms: ['Paris'],
};

export const Answers: Story = {
  args: { formatData, roundIds: ['round-1'] },
};

export const ShowCorrect: Story = {
  args: {
    formatData,
    roundIds: ['round-1'],
    hasCorrectAnswer: true,
    showCorrect: true,
  },
};

export const Presentation: Story = {
  args: {
    formatData,
    roundIds: ['round-1'],
    hasCorrectAnswer: true,
    showCorrect: true,
    isPresentation: true,
    answerCount: 18,
    correctAnswerCount: 14,
  },
};

export const Moderation: Story = {
  args: {
    contentId: 'content-1',
    formatData,
    roundIds: ['round-1'],
    hasCorrectAnswer: true,
    showCorrect: true,
    allowAnswerModeration: true,
  },
};
