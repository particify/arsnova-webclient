import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { QuestionnairePageService } from '@app/creator/questionnaire/questionnaire-page.service';
import {
  ContentType,
  CreateQuestionnaireBinaryContentGql,
  UpdateQuestionnaireBinaryContentGql,
} from '@gql/generated/graphql';
import { of } from 'rxjs';
import { BinaryContentFormComponent } from './binary-content-form.component';

const mutationMock = { mutate: () => of({ data: {} }) };

export default {
  component: BinaryContentFormComponent,
  title: 'BinaryContentForm',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [BinaryContentFormComponent],
      providers: [
        { provide: FormattingService, useValue: {} },
        {
          provide: QuestionnairePageService,
          useClass: QuestionnairePageService,
        },
        {
          provide: CreateQuestionnaireBinaryContentGql,
          useValue: mutationMock,
        },
        {
          provide: UpdateQuestionnaireBinaryContentGql,
          useValue: mutationMock,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<BinaryContentFormComponent>;

const formatData = (correctAnswer: boolean | null) => ({
  __typename: 'BinaryContentFormatData' as const,
  format: ContentType.Binary,
  correctAnswer,
});

export const New: Story = {
  args: { formatData: null, hasCorrectAnswer: true },
};

export const CorrectAnswerNo: Story = {
  args: {
    formatData: formatData(false),
    contentId: 'content-1',
    hasCorrectAnswer: true,
  },
};

export const LockedByAnswers: Story = {
  args: {
    formatData: formatData(true),
    contentId: 'content-1',
    hasCorrectAnswer: true,
    answered: true,
  },
};

export const Preview: Story = {
  args: {
    formatData: formatData(true),
    contentId: 'content-1',
    hasCorrectAnswer: true,
    preview: true,
  },
};
