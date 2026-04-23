import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { ContentWordcloudParticipantComponent } from './content-wordcloud-participant.component';
import {
  AnswerResultState,
  ContentType,
  CreateQuestionnaireWordcloudAnswerGql,
  WordcloudAnswerFormatData,
  WordcloudContentFormatData,
} from '@gql/generated/graphql';
import { of } from 'rxjs';

class MockFormattingService {}

const createQuestionnaireWordcloudAnswerGqlMock = {
  mutate: () =>
    of({
      data: {
        createQuestionnaireWordcloudAnswer: {
          success: true,
          id: 'mock-id',
        },
      },
    }),
};

export default {
  component: ContentWordcloudParticipantComponent,
  title: 'ContentWordcloudParticipant',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentWordcloudParticipantComponent],
      providers: [
        {
          provide: FormattingService,
          useClass: MockFormattingService,
        },
        {
          provide: CreateQuestionnaireWordcloudAnswerGql,
          useValue: createQuestionnaireWordcloudAnswerGqlMock,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentWordcloudParticipantComponent>;

const baseArgs = {
  contentId: 'content-1',
  roundId: 'round-1',
  result: AnswerResultState.Unanswered,
  correctOptionsPublished: false,
};

const wordcloudFormatData: WordcloudContentFormatData = {
  __typename: 'WordcloudContentFormatData',
  format: ContentType.Wordcloud,
  maxAnswers: 3,
};

const wordcloudAnswerFormatData: WordcloudAnswerFormatData = {
  __typename: 'WordcloudAnswerFormatData',
  format: ContentType.Wordcloud,
  words: ['abc', 'test'],
};

export const Unanswered: Story = {
  args: {
    ...baseArgs,
    contentFormatData: wordcloudFormatData,
  },
};

export const UnansweredMoreMaxAnswers: Story = {
  args: {
    ...baseArgs,
    contentFormatData: {
      ...wordcloudFormatData,
      maxAnswers: 10,
    },
  },
};

export const Answered: Story = {
  args: {
    ...baseArgs,
    contentFormatData: wordcloudFormatData,
    answerFormatData: wordcloudAnswerFormatData,
    result: AnswerResultState.Neutral,
    correctOptionsPublished: true,
  },
};
