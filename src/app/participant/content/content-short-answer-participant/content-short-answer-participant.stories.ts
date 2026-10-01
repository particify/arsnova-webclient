import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import {
  AnswerResultState,
  ContentType,
  CreateQuestionnaireShortAnswerAnswerGql,
  ShortAnswerContentFormatData,
} from '@gql/generated/graphql';
import { of } from 'rxjs';
import { ContentShortAnswerParticipantComponent } from './content-short-answer-participant.component';

const createAnswerMock = { mutate: () => of({ data: {} }) };

export default {
  component: ContentShortAnswerParticipantComponent,
  title: 'ContentShortAnswerParticipant',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentShortAnswerParticipantComponent],
      providers: [
        {
          provide: CreateQuestionnaireShortAnswerAnswerGql,
          useValue: createAnswerMock,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentShortAnswerParticipantComponent>;

const contentFormatData: ShortAnswerContentFormatData = {
  __typename: 'ShortAnswerContentFormatData',
  format: ContentType.ShortAnswer,
  correctTerms: ['Paris', 'paris'],
};

const answered = (body: string) => ({
  contentId: 'content-1',
  roundId: 'round-1',
  contentFormatData,
  answerFormatData: {
    __typename: 'ShortAnswerAnswerFormatData' as const,
    format: ContentType.ShortAnswer,
    body,
  },
});

export const Unanswered: Story = {
  args: {
    contentId: 'content-1',
    roundId: 'round-1',
    contentFormatData,
  },
};

export const AnsweredBeforePublishing: Story = {
  args: { ...answered('Paris'), result: AnswerResultState.Neutral },
};

export const Correct: Story = {
  args: {
    ...answered('Paris'),
    result: AnswerResultState.Correct,
    correctOptionsPublished: true,
  },
};

export const Wrong: Story = {
  args: {
    ...answered('Lyon'),
    result: AnswerResultState.Wrong,
    correctOptionsPublished: true,
  },
};
