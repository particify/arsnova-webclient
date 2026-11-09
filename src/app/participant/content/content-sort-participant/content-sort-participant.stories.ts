import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { FormattingService } from '@app/core/services/http/formatting.service';
import {
  AnswerResultState,
  ContentType,
  CreateQuestionnaireSortAnswerGql,
  SortContentFormatData,
} from '@gql/generated/graphql';
import { of } from 'rxjs';
import { ContentSortParticipantComponent } from './content-sort-participant.component';

export default {
  component: ContentSortParticipantComponent,
  title: 'ContentSortParticipant',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentSortParticipantComponent],
      providers: [
        { provide: FormattingService, useValue: {} },
        {
          provide: CreateQuestionnaireSortAnswerGql,
          useValue: { mutate: () => of({ data: {} }) },
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentSortParticipantComponent>;

const contentFormatData: SortContentFormatData = {
  __typename: 'SortContentFormatData',
  format: ContentType.Sort,
  options: [
    { __typename: 'AnswerOption', label: 'Earth' },
    { __typename: 'AnswerOption', label: 'Mercury' },
    { __typename: 'AnswerOption', label: 'Mars' },
    { __typename: 'AnswerOption', label: 'Venus' },
  ],
};

const answered = (selectedChoiceIndexes: number[]) => ({
  contentId: 'content-1',
  roundId: 'round-1',
  contentFormatData,
  answerFormatData: {
    __typename: 'SortAnswerFormatData' as const,
    format: ContentType.Sort,
    selectedChoiceIndexes,
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
  args: { ...answered([1, 3, 0, 2]), result: AnswerResultState.Neutral },
};

export const Correct: Story = {
  args: {
    ...answered([1, 3, 0, 2]),
    result: AnswerResultState.Correct,
    correctOptionsPublished: true,
  },
};

export const Wrong: Story = {
  args: {
    ...answered([3, 1, 0, 2]),
    result: AnswerResultState.Wrong,
    correctOptionsPublished: true,
  },
};
