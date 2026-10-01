import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PresentationService } from '@app/core/services/util/presentation.service';
import {
  ContentType,
  QuestionnaireNumericRoundStatsByRoundIdGql,
  QuestionnaireNumericRoundStatsUpdatedGql,
  Round,
} from '@gql/generated/graphql';
import { NEVER, of } from 'rxjs';
import { NumericResultsComponent } from './numeric-results.component';

const statsMock = {
  watch: () => ({
    valueChanges: of({
      dataState: 'complete',
      data: {
        questionnaireNumericRoundStatsByRoundId: {
          __typename: 'NumericContentRoundStats',
          selectedNumbers: [10, 38, 41, 42, 44, 60, 95],
          counts: [1, 3, 5, 8, 4, 2, 1],
          mean: 42.3,
          median: 42,
          standardDeviation: 12.1,
          variance: 146.4,
          minimum: 10,
          maximum: 95,
          correctAnswerFraction: 0.71,
        },
      },
    }),
  }),
};

export default {
  component: NumericResultsComponent,
  title: 'NumericResults',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [NumericResultsComponent],
      providers: [
        { provide: PresentationService, useValue: { getScale: () => 1 } },
        {
          provide: QuestionnaireNumericRoundStatsByRoundIdGql,
          useValue: statsMock,
        },
        {
          provide: QuestionnaireNumericRoundStatsUpdatedGql,
          useValue: { subscribe: () => NEVER },
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<NumericResultsComponent>;

const baseArgs = {
  roundIds: ['round-1'],
  rounds: [{ id: 'round-1', roundNo: 1 }] as Round[],
  formatData: {
    __typename: 'NumericContentFormatData' as const,
    format: ContentType.Numeric,
    minNumber: 0,
    maxNumber: 100,
    correctNumber: 42,
    tolerance: 2,
  },
  answerCount: 24,
  correctAnswerCount: 17,
};

export const Results: Story = {
  args: baseArgs,
};

export const CorrectAnswerRevealed: Story = {
  args: { ...baseArgs, hasCorrectAnswer: true, showCorrect: true },
};

export const InPercent: Story = {
  args: { ...baseArgs, visualizationUnitPercent: true },
};

export const Presentation: Story = {
  args: {
    ...baseArgs,
    hasCorrectAnswer: true,
    showCorrect: true,
    isPresentation: true,
  },
};
