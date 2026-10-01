import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import {
  AnswerResultState,
  ContentType,
  CreateQuestionnaireNumericAnswerGql,
} from '@gql/generated/graphql';
import { of } from 'rxjs';
import { ContentNumericParticipantComponent } from './content-numeric-participant.component';

export default {
  component: ContentNumericParticipantComponent,
  title: 'ContentNumericParticipant',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentNumericParticipantComponent],
      providers: [
        {
          provide: CreateQuestionnaireNumericAnswerGql,
          useValue: { mutate: () => of({ data: {} }) },
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentNumericParticipantComponent>;

const contentFormatData = {
  __typename: 'NumericContentFormatData' as const,
  format: ContentType.Numeric,
  minNumber: 0,
  maxNumber: 100,
  correctNumber: 42,
  tolerance: 2,
};

export const Unanswered: Story = {
  args: { contentId: 'content-1', roundId: 'round-1', contentFormatData },
};

export const AnsweredAndPublished: Story = {
  args: {
    contentId: 'content-1',
    roundId: 'round-1',
    contentFormatData,
    answerFormatData: {
      __typename: 'NumericAnswerFormatData',
      format: ContentType.Numeric,
      selectedNumber: 40,
    },
    result: AnswerResultState.Correct,
    correctOptionsPublished: true,
  },
};
