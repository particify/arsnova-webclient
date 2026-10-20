import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { FormattingService } from '@app/core/services/http/formatting.service';
import {
  AnswerResultState,
  ContentType,
  CreateQuestionnairePrioritizationAnswerGql,
  PrioritizationContentFormatData,
} from '@gql/generated/graphql';
import { of } from 'rxjs';
import { ContentPrioritizationParticipantComponent } from './content-prioritization-participant.component';

export default {
  component: ContentPrioritizationParticipantComponent,
  title: 'ContentPrioritizationParticipant',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentPrioritizationParticipantComponent],
      providers: [
        { provide: FormattingService, useValue: {} },
        {
          provide: CreateQuestionnairePrioritizationAnswerGql,
          useValue: { mutate: () => of({ data: {} }) },
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentPrioritizationParticipantComponent>;

const contentFormatData: PrioritizationContentFormatData = {
  __typename: 'PrioritizationContentFormatData',
  format: ContentType.Prioritization,
  assignablePoints: 100,
  options: [
    { __typename: 'AnswerOption', label: 'More exercises' },
    { __typename: 'AnswerOption', label: 'Shorter lectures' },
    { __typename: 'AnswerOption', label: 'Recorded sessions' },
  ],
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
      __typename: 'PrioritizationAnswerFormatData',
      format: ContentType.Prioritization,
      assignedPoints: [50, 20, 30],
    },
    result: AnswerResultState.Neutral,
  },
};
