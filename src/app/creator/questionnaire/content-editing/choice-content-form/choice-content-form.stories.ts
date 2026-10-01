import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { ContentService } from '@app/core/services/http/content.service';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { QuestionnairePageService } from '@app/creator/questionnaire/questionnaire-page.service';
import {
  ChoiceContentFormatData,
  ContentType,
  CreateQuestionnaireChoiceContentGql,
  UpdateQuestionnaireChoiceContentGql,
} from '@gql/generated/graphql';
import { of } from 'rxjs';
import { ChoiceContentFormComponent } from './choice-content-form.component';

class MockContentService {
  getAnswerOptions = ContentService.prototype.getAnswerOptions;
}

class MockFormattingService {
  postString(text: string) {
    return of(text);
  }
}

const mutationMock = { mutate: () => of({ data: {} }) };

export default {
  component: ChoiceContentFormComponent,
  title: 'ChoiceContentForm',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ChoiceContentFormComponent],
      providers: [
        { provide: ContentService, useClass: MockContentService },
        { provide: FormattingService, useClass: MockFormattingService },
        {
          provide: QuestionnairePageService,
          useClass: QuestionnairePageService,
        },
        {
          provide: CreateQuestionnaireChoiceContentGql,
          useValue: mutationMock,
        },
        {
          provide: UpdateQuestionnaireChoiceContentGql,
          useValue: mutationMock,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ChoiceContentFormComponent>;

const formatData: ChoiceContentFormatData = {
  __typename: 'ChoiceContentFormatData',
  format: ContentType.Choice,
  multiple: false,
  correctOptionIndexes: [1],
  options: [
    { __typename: 'AnswerOption', label: 'Mercury' },
    { __typename: 'AnswerOption', label: 'Venus' },
    { __typename: 'AnswerOption', label: 'Mars' },
  ],
};

export const New: Story = {
  args: {
    formatData: null,
  },
};

export const SingleChoice: Story = {
  args: {
    formatData,
    contentId: 'content-1',
  },
};

export const MultipleChoiceWithCorrectAnswers: Story = {
  args: {
    formatData: { ...formatData, multiple: true, correctOptionIndexes: [0, 2] },
    contentId: 'content-1',
    hasCorrectAnswer: true,
    multiple: true,
  },
};

export const Answered: Story = {
  args: {
    formatData,
    contentId: 'content-1',
    answered: true,
  },
};

export const Preview: Story = {
  args: {
    formatData,
    preview: true,
  },
};
