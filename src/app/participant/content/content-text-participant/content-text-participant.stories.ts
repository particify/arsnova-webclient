import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import {
  AnswerResultState,
  ContentType,
  CreateQuestionnaireTextAnswerGql,
  TextContentFormatData,
} from '@gql/generated/graphql';
import { of } from 'rxjs';
import { ContentTextParticipantComponent } from './content-text-participant.component';

const createAnswerMock = { mutate: () => of({ data: {} }) };

export default {
  component: ContentTextParticipantComponent,
  title: 'ContentTextParticipant',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentTextParticipantComponent],
      providers: [
        {
          provide: CreateQuestionnaireTextAnswerGql,
          useValue: createAnswerMock,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentTextParticipantComponent>;

const contentFormatData: TextContentFormatData = {
  __typename: 'TextContentFormatData',
  format: ContentType.Text,
  answersPublished: false,
};

export const Unanswered: Story = {
  args: {
    contentId: 'content-1',
    roundId: 'round-1',
    contentFormatData,
  },
};

export const Answered: Story = {
  args: {
    contentId: 'content-1',
    roundId: 'round-1',
    contentFormatData,
    answerFormatData: {
      __typename: 'TextAnswerFormatData',
      format: ContentType.Text,
      body: 'Small steps, every day.',
    },
    result: AnswerResultState.Neutral,
  },
};
