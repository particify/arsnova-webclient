import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import {
  ContentType,
  QuestionnaireSortRoundStatsByRoundIdGql,
  QuestionnaireSortRoundStatsUpdatedGql,
  SortContentFormatData,
} from '@gql/generated/graphql';
import { NEVER, of } from 'rxjs';
import { SortResultsComponent } from './sort-results.component';

/** Reverses instead of shuffling, so the stories render the same every time. */
class MockContentAnswerService {
  shuffleAnswerOptions<T>(answers: T[]): T[] {
    return answers.reverse();
  }
}

const statsMock = {
  watch: () => ({
    valueChanges: of({
      dataState: 'complete',
      data: {
        questionnaireSortRoundStatsByRoundId: {
          __typename: 'SortContentRoundStats',
          combinations: [
            {
              __typename: 'SortCombination',
              selectedChoiceIndexes: [1, 3, 0, 2],
              count: 9,
            },
            {
              __typename: 'SortCombination',
              selectedChoiceIndexes: [3, 1, 0, 2],
              count: 5,
            },
            {
              __typename: 'SortCombination',
              selectedChoiceIndexes: [1, 3, 2, 0],
              count: 2,
            },
          ],
        },
      },
    }),
  }),
};

export default {
  component: SortResultsComponent,
  title: 'SortResults',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [SortResultsComponent],
      providers: [
        { provide: ContentAnswerService, useClass: MockContentAnswerService },
        { provide: FormattingService, useValue: {} },
        { provide: PresentationService, useValue: { getScale: () => 1 } },
        {
          provide: QuestionnaireSortRoundStatsByRoundIdGql,
          useValue: statsMock,
        },
        {
          provide: QuestionnaireSortRoundStatsUpdatedGql,
          useValue: { subscribe: () => NEVER },
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<SortResultsComponent>;

const options = [
  { __typename: 'AnswerOption' as const, label: 'Earth' },
  { __typename: 'AnswerOption' as const, label: 'Mercury' },
  { __typename: 'AnswerOption' as const, label: 'Mars' },
  { __typename: 'AnswerOption' as const, label: 'Venus' },
];

/** What a participant gets before the correct answers are published. */
const withheldFormatData: SortContentFormatData = {
  __typename: 'SortContentFormatData',
  format: ContentType.Sort,
  options,
};

const formatData: SortContentFormatData = {
  ...withheldFormatData,
  correctOrder: [1, 3, 0, 2],
};

export const Withheld: Story = {
  args: { formatData: withheldFormatData, roundIds: ['round-1'] },
};

export const Hidden: Story = {
  args: { formatData, roundIds: ['round-1'], hasCorrectAnswer: true },
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
    visualizationUnitPercent: true,
    answerCount: 16,
    correctAnswerCount: 9,
  },
};
