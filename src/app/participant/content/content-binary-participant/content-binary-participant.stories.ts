import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { FormattingService } from '@app/core/services/http/formatting.service';
import {
  AnswerResultState,
  BinaryContentFormatData,
  ContentType,
  CreateQuestionnaireBinaryAnswerGql,
} from '@gql/generated/graphql';
import { of } from 'rxjs';
import { ContentBinaryParticipantComponent } from './content-binary-participant.component';

export default {
  component: ContentBinaryParticipantComponent,
  title: 'ContentBinaryParticipant',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentBinaryParticipantComponent],
      providers: [
        { provide: FormattingService, useValue: {} },
        {
          provide: CreateQuestionnaireBinaryAnswerGql,
          useValue: { mutate: () => of({ data: {} }) },
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentBinaryParticipantComponent>;

const contentFormatData: BinaryContentFormatData = {
  __typename: 'BinaryContentFormatData',
  format: ContentType.Binary,
  correctAnswer: true,
};

/** What a participant gets before the correct answers are published. */
const withheldFormatData: BinaryContentFormatData = {
  ...contentFormatData,
  correctAnswer: null,
};

const answered = (answer: boolean) => ({
  contentId: 'content-1',
  roundId: 'round-1',
  answerFormatData: {
    __typename: 'BinaryAnswerFormatData' as const,
    format: ContentType.Binary,
    answer,
  },
});

export const Unanswered: Story = {
  args: {
    contentId: 'content-1',
    roundId: 'round-1',
    contentFormatData: withheldFormatData,
  },
};

export const AnsweredBeforePublishing: Story = {
  args: {
    ...answered(true),
    contentFormatData: withheldFormatData,
    result: AnswerResultState.Neutral,
  },
};

export const Correct: Story = {
  args: {
    ...answered(true),
    contentFormatData,
    result: AnswerResultState.Correct,
    correctOptionsPublished: true,
  },
};

export const Wrong: Story = {
  args: {
    ...answered(false),
    contentFormatData,
    result: AnswerResultState.Wrong,
    correctOptionsPublished: true,
  },
};
