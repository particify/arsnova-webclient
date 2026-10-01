import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { FormattingService } from '@app/core/services/http/formatting.service';
import {
  ContentType,
  QuestionnairePrioritizationRoundStatsByRoundIdGql,
  QuestionnairePrioritizationRoundStatsUpdatedGql,
} from '@gql/generated/graphql';
import { NEVER, of } from 'rxjs';
import { PrioritizationResultsComponent } from './prioritization-results.component';

const statsMock = {
  watch: () => ({
    valueChanges: of({
      dataState: 'complete',
      data: {
        questionnairePrioritizationRoundStatsByRoundId: {
          __typename: 'PrioritizationContentRoundStats',
          assignedPoints: [620, 240, 940],
        },
      },
    }),
  }),
};

export default {
  component: PrioritizationResultsComponent,
  title: 'PrioritizationResults',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [PrioritizationResultsComponent],
      providers: [
        { provide: FormattingService, useValue: {} },
        {
          provide: QuestionnairePrioritizationRoundStatsByRoundIdGql,
          useValue: statsMock,
        },
        {
          provide: QuestionnairePrioritizationRoundStatsUpdatedGql,
          useValue: { subscribe: () => NEVER },
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<PrioritizationResultsComponent>;

const formatData = {
  __typename: 'PrioritizationContentFormatData' as const,
  format: ContentType.Prioritization,
  assignablePoints: 100,
  options: [
    { __typename: 'AnswerOption' as const, label: 'More exercises' },
    { __typename: 'AnswerOption' as const, label: 'Shorter lectures' },
    { __typename: 'AnswerOption' as const, label: 'Recorded sessions' },
  ],
};

export const Points: Story = {
  args: { formatData, roundIds: ['round-1'] },
};

export const InPercent: Story = {
  args: { formatData, roundIds: ['round-1'], visualizationUnitPercent: true },
};
