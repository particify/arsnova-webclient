import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { of } from 'rxjs';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentResultsComponent } from '@app/standalone/content-results/content-results.component';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import {
  BanQuestionnaireWordcloudContentKeywordGql,
  Content,
  ContentType,
  CurrentUserWithSettingsGql,
  QuestionnaireChoiceRoundStatsByRoundIdGql,
  QuestionnaireRoundsByContentIdGql,
  QuestionnaireWordcloudRoundStatsByRoundIdGql,
  UserUiSettings,
} from '@gql/generated/graphql';
import { ContentResultsService } from './content-results.service';

class MockContentService {
  updateAnswerCounts() {}
}

class MockPresentationService {
  scale() {
    return 1;
  }
}

class MockFormattingService {
  postString(text: string) {
    return of(text);
  }
}

const currentUserWithSettingsGqlMock = {
  fetch: () =>
    of({
      data: {
        currentUser: {
          uiSettings: {
            contentVisualizationUnitPercent: true,
            contentAnswersDirectlyBelowChart: false,
            showContentResultsDirectly: false,
            rotateWordcloudItems: true,
          },
        },
      },
    }),
};

const questionnaireRoundsByContentIdGqlMock = {
  watch: () => ({
    valueChanges: of({
      dataState: 'complete',
      data: {
        questionnaireRoundsByContentId: [
          {
            __typename: 'Round',
            id: 'round-1',
            contentId: null,
            roundNo: 1,
            closed: true,
          },
          {
            __typename: 'Round',
            id: 'round-2',
            contentId: null,
            roundNo: 2,
            closed: true,
          },
        ],
      },
    }),
  }),
};

const questionnaireChoiceRoundStatsByRoundIdGqlMock = {
  watch: ({ variables }: { variables: { roundId: string } }) => ({
    valueChanges: of({
      data: {
        questionnaireChoiceRoundStatsByRoundId: {
          __typename: 'ChoiceContentRoundStats',
          selectionCounts:
            variables.roundId === 'round-2'
              ? [5, 30, 10, 20]
              : [10, 25, 15, 50],
        },
      },
    }),
  }),
};

const questionnaireWordcloudRoundStatsByRoundIdGqlMock = {
  watch: ({ variables }: { variables: { roundId: string } }) => ({
    valueChanges: of({
      dataState: 'complete',
      data: {
        questionnaireWordcloudRoundStatsByRoundId: {
          __typename: 'WordcloudContentRoundStats',
          words:
            variables.roundId === 'round-2'
              ? ['Signals', 'Angular', 'Zoneless']
              : ['Angular', 'TypeScript', 'GraphQL', 'Storybook'],
          counts:
            variables.roundId === 'round-2' ? [25, 20, 15] : [40, 30, 20, 10],
        },
      },
    }),
  }),
};

const banQuestionnaireWordcloudContentKeywordGqlMock = {
  mutate: () =>
    of({
      data: {
        banQuestionnaireWordcloudContentKeyword: {
          success: true,
        },
      },
    }),
};

export default {
  component: ContentResultsComponent,
  title: 'ContentResults',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentResultsComponent],
      providers: [
        {
          provide: ContentService,
          useClass: MockContentService,
        },
        ContentResultsService,
        {
          provide: FormattingService,
          useClass: MockFormattingService,
        },
        {
          provide: PresentationService,
          useClass: MockPresentationService,
        },
        {
          provide: CurrentUserWithSettingsGql,
          useValue: currentUserWithSettingsGqlMock,
        },
        {
          provide: QuestionnaireRoundsByContentIdGql,
          useValue: questionnaireRoundsByContentIdGqlMock,
        },
        {
          provide: QuestionnaireChoiceRoundStatsByRoundIdGql,
          useValue: questionnaireChoiceRoundStatsByRoundIdGqlMock,
        },
        {
          provide: QuestionnaireWordcloudRoundStatsByRoundIdGql,
          useValue: questionnaireWordcloudRoundStatsByRoundIdGqlMock,
        },
        {
          provide: BanQuestionnaireWordcloudContentKeywordGql,
          useValue: banQuestionnaireWordcloudContentKeywordGqlMock,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentResultsComponent>;

const baseArgs = {
  active: true,
  directShow: true,
  isPresentation: false,
  settings: {} as UserUiSettings,
  isStandalone: true,
  showCorrect: false,
};

const activeRound = {
  __typename: 'Round' as const,
  id: 'round-2',
  contentId: null,
  roundNo: 2,
  closed: true,
};

const createChoiceContent = (multiple = false): Content => ({
  __typename: 'Content',
  id: multiple ? 'mc-multiple' : 'mc-single',
  body: multiple ? 'Multiple Choice Content' : 'Single Choice Content',
  bodyRendered: '<p>Choice Content</p>',
  activeRound,
  formatData: {
    __typename: 'ChoiceContentFormatData',
    format: ContentType.Choice,
    multiple,
    correctOptionIndexes: multiple ? [0, 2] : [1],
    options: [
      { __typename: 'AnswerOption', label: 'Answer 1' },
      { __typename: 'AnswerOption', label: 'Answer 2' },
      { __typename: 'AnswerOption', label: 'Answer 3' },
      { __typename: 'AnswerOption', label: 'Answer 4' },
    ],
  },
});

const wordcloudContent: Content = {
  __typename: 'Content',
  id: 'wordcloud-content',
  body: 'Wordcloud Content',
  bodyRendered: '<p>Wordcloud Content</p>',
  activeRound,
  formatData: {
    __typename: 'WordcloudContentFormatData',
    format: ContentType.Wordcloud,
    maxAnswers: 3,
  },
};

export const SingleChoice: Story = {
  args: {
    ...baseArgs,
    content: createChoiceContent(false),
  },
};

export const MultipleChoice: Story = {
  args: {
    ...baseArgs,
    content: createChoiceContent(true),
  },
};

export const Wordcloud: Story = {
  args: {
    ...baseArgs,
    content: wordcloudContent,
  },
};
