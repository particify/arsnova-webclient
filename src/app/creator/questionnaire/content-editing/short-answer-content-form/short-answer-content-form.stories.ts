import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { QuestionnairePageService } from '@app/creator/questionnaire/questionnaire-page.service';
import {
  ContentType,
  CreateQuestionnaireShortAnswerContentGql,
  UpdateQuestionnaireShortAnswerContentGql,
} from '@gql/generated/graphql';
import { of } from 'rxjs';
import { ShortAnswerContentFormComponent } from './short-answer-content-form.component';

const mutationMock = { mutate: () => of({ data: {} }) };

export default {
  component: ShortAnswerContentFormComponent,
  title: 'ShortAnswerContentForm',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ShortAnswerContentFormComponent],
      providers: [
        {
          provide: QuestionnairePageService,
          useClass: QuestionnairePageService,
        },
        {
          provide: CreateQuestionnaireShortAnswerContentGql,
          useValue: mutationMock,
        },
        {
          provide: UpdateQuestionnaireShortAnswerContentGql,
          useValue: mutationMock,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ShortAnswerContentFormComponent>;

const formatData = {
  __typename: 'ShortAnswerContentFormatData' as const,
  format: ContentType.ShortAnswer,
  correctTerms: ['Paris', 'paris'],
};

export const New: Story = {
  args: { formatData: null },
};

export const Existing: Story = {
  args: { formatData, contentId: 'content-1' },
};

export const LockedByAnswers: Story = {
  args: { formatData, contentId: 'content-1', answered: true },
};

export const Preview: Story = {
  args: { formatData, preview: true },
};
