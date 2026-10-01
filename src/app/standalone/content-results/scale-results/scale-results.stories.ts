import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import {
  ContentType,
  QuestionnaireScaleRoundStatsByRoundIdGql,
  QuestionnaireScaleRoundStatsUpdatedGql,
  Round,
  ScaleContentTemplate,
} from '@gql/generated/graphql';
import { NEVER, of } from 'rxjs';
import { ScaleResultsComponent } from './scale-results.component';

const statsMock = {
  watch: () => ({
    valueChanges: of({
      dataState: 'complete',
      data: {
        questionnaireScaleRoundStatsByRoundId: {
          __typename: 'ScaleContentRoundStats',
          counts: [7, 12, 4, 2, 1],
        },
      },
    }),
  }),
};

export default {
  component: ScaleResultsComponent,
  title: 'ScaleResults',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ScaleResultsComponent],
      providers: [
        LikertScaleService,
        {
          provide: FormattingService,
          useValue: { postString: (text: string) => of(text) },
        },
        { provide: PresentationService, useValue: { getScale: () => 1 } },
        {
          provide: QuestionnaireScaleRoundStatsByRoundIdGql,
          useValue: statsMock,
        },
        {
          provide: QuestionnaireScaleRoundStatsUpdatedGql,
          useValue: { subscribe: () => NEVER },
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ScaleResultsComponent>;

const baseArgs = (template: ScaleContentTemplate) => ({
  roundIds: ['round-1'],
  rounds: [{ id: 'round-1', roundNo: 1 }] as Round[],
  formatData: {
    __typename: 'ScaleContentFormatData' as const,
    format: ContentType.Scale,
    template,
    neutralOption: true,
  },
});

export const Agreement: Story = {
  args: baseArgs(ScaleContentTemplate.Agreement),
};

export const Emoji: Story = {
  args: baseArgs(ScaleContentTemplate.Emoji),
};

export const InPercent: Story = {
  args: {
    ...baseArgs(ScaleContentTemplate.Agreement),
    visualizationUnitPercent: true,
  },
};
