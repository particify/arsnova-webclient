import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import {
  ChoiceContentFormatData,
  ContentType,
  QuestionnaireChoiceRoundStatsByRoundIdGql,
} from '@gql/generated/graphql';
import { of } from 'rxjs';
import { ChoiceResultsComponent } from './choice-results.component';

class MockFormattingService {
  postString(text: string) {
    return of(text);
  }
}

class MockPresentationService {
  scale() {
    return 1;
  }
}

const roundStatsMock = {
  watch: () => ({
    valueChanges: of({
      dataState: 'complete',
      data: {
        questionnaireChoiceRoundStatsByRoundId: {
          __typename: 'ChoiceContentRoundStats',
          selectionCounts: [12, 30, 5, 18],
        },
      },
    }),
  }),
};

export default {
  component: ChoiceResultsComponent,
  title: 'ChoiceResults',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ChoiceResultsComponent],
      providers: [
        { provide: FormattingService, useClass: MockFormattingService },
        { provide: PresentationService, useClass: MockPresentationService },
        {
          provide: QuestionnaireChoiceRoundStatsByRoundIdGql,
          useValue: roundStatsMock,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ChoiceResultsComponent>;

const formatData: ChoiceContentFormatData = {
  __typename: 'ChoiceContentFormatData',
  format: ContentType.Choice,
  multiple: false,
  correctOptionIndexes: [1],
  options: [
    { __typename: 'AnswerOption', label: 'Mercury' },
    { __typename: 'AnswerOption', label: 'Venus' },
    {
      __typename: 'AnswerOption',
      label: '**Earth**',
      labelRendered: '<p><strong>Earth</strong></p>',
    },
    { __typename: 'AnswerOption', label: 'Mars' },
  ],
};

const baseArgs = {
  roundId: 'round-1',
  formatData,
  resultsVisible: true,
};

export const Results: Story = {
  args: baseArgs,
};

export const ResultsHidden: Story = {
  args: { ...baseArgs, resultsVisible: false },
};

export const InPercent: Story = {
  args: { ...baseArgs, visualizationUnitPercent: true },
};

export const AnswersBelowChart: Story = {
  args: { ...baseArgs, answersDirectlyBelowChart: true },
};

export const CorrectAnswerRevealed: Story = {
  args: { ...baseArgs, hasCorrectAnswer: true, showCorrect: true },
};

export const SeveralCorrectAnswersRevealed: Story = {
  args: {
    ...baseArgs,
    formatData: { ...formatData, multiple: true, correctOptionIndexes: [1, 2] },
    hasCorrectAnswer: true,
    showCorrect: true,
  },
};

export const Presentation: Story = {
  args: {
    ...baseArgs,
    hasCorrectAnswer: true,
    isPresentation: true,
  },
};
