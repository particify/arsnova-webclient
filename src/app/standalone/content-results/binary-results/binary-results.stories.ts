import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PresentationService } from '@app/core/services/util/presentation.service';
import {
  ContentType,
  QuestionnaireBinaryRoundStatsByRoundIdGql,
  QuestionnaireBinaryRoundStatsUpdatedGql,
  Round,
} from '@gql/generated/graphql';
import { NEVER, of } from 'rxjs';
import { BinaryResultsComponent } from './binary-results.component';

const counts: Record<string, number[]> = {
  'round-1': [14, 6],
  'round-2': [18, 2],
};

const statsMock = {
  watch: ({ variables }: { variables: { roundId: string } }) => ({
    valueChanges: of({
      dataState: 'complete',
      data: {
        questionnaireBinaryRoundStatsByRoundId: {
          __typename: 'BinaryContentRoundStats',
          selectionCounts: counts[variables.roundId],
        },
      },
    }),
  }),
};

export default {
  component: BinaryResultsComponent,
  title: 'BinaryResults',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [BinaryResultsComponent],
      providers: [
        { provide: PresentationService, useValue: { getScale: () => 1 } },
        {
          provide: QuestionnaireBinaryRoundStatsByRoundIdGql,
          useValue: statsMock,
        },
        {
          provide: QuestionnaireBinaryRoundStatsUpdatedGql,
          useValue: { subscribe: () => NEVER },
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<BinaryResultsComponent>;

const rounds = [
  { id: 'round-1', roundNo: 1 },
  { id: 'round-2', roundNo: 2 },
] as Round[];

const formatData = {
  __typename: 'BinaryContentFormatData' as const,
  format: ContentType.Binary,
  correctAnswer: true,
};

const baseArgs = {
  roundIds: ['round-1'],
  rounds,
  formatData,
  hasCorrectAnswer: true,
  language: 'en',
};

export const Answers: Story = {
  args: baseArgs,
};

export const ShowCorrect: Story = {
  args: { ...baseArgs, showCorrect: true },
};

export const RoundComparison: Story = {
  args: { ...baseArgs, roundIds: ['round-1', 'round-2'] },
};

export const Presentation: Story = {
  args: {
    ...baseArgs,
    showCorrect: true,
    isPresentation: true,
    visualizationUnitPercent: true,
    answerCount: 20,
    correctAnswerCount: 14,
  },
};
