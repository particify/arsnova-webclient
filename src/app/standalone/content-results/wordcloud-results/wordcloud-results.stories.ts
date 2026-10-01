import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import {
  BanQuestionnaireWordcloudContentKeywordGql,
  QuestionnaireWordcloudRoundStatsByRoundIdGql,
} from '@gql/generated/graphql';
import { of } from 'rxjs';
import { VisualizationType } from '@app/standalone/content-results/visualization/visualization-type';
import { WordcloudResultsComponent } from './wordcloud-results.component';

const roundStatsMock = {
  watch: () => ({
    valueChanges: of({
      dataState: 'complete',
      data: {
        questionnaireWordcloudRoundStatsByRoundId: {
          __typename: 'WordcloudContentRoundStats',
          words: ['Angular', 'TypeScript', 'GraphQL', 'Kotlin', 'Storybook'],
          counts: [40, 30, 20, 15, 10],
        },
      },
    }),
  }),
};

const banKeywordMock = { mutate: () => of({ data: {} }) };

export default {
  component: WordcloudResultsComponent,
  title: 'WordcloudResults',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [WordcloudResultsComponent],
      providers: [
        {
          provide: QuestionnaireWordcloudRoundStatsByRoundIdGql,
          useValue: roundStatsMock,
        },
        {
          provide: BanQuestionnaireWordcloudContentKeywordGql,
          useValue: banKeywordMock,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<WordcloudResultsComponent>;

const baseArgs = {
  contentId: 'content-1',
  roundId: 'round-1',
  resultsVisible: true,
};

export const Wordcloud: Story = {
  args: { ...baseArgs, visualizationType: VisualizationType.WORDCLOUD },
};

export const RotatedWords: Story = {
  args: {
    ...baseArgs,
    visualizationType: VisualizationType.WORDCLOUD,
    rotateWords: true,
  },
};

export const Table: Story = {
  args: { ...baseArgs, visualizationType: VisualizationType.TABLE },
};

export const Grid: Story = {
  args: { ...baseArgs, visualizationType: VisualizationType.GRID },
};
