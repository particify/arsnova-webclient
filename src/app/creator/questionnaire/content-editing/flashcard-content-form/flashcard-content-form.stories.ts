import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { QuestionnairePageService } from '@app/creator/questionnaire/questionnaire-page.service';
import {
  ContentType,
  CreateQuestionnaireFlashcardContentGql,
  UpdateQuestionnaireFlashcardContentGql,
} from '@gql/generated/graphql';
import { of } from 'rxjs';
import { FlashcardContentFormComponent } from './flashcard-content-form.component';

class MockFormattingService {
  containsTextAnImage(text: string) {
    return text.includes('![');
  }
}

const mutationMock = { mutate: () => of({ data: {} }) };

export default {
  component: FlashcardContentFormComponent,
  title: 'FlashcardContentForm',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [FlashcardContentFormComponent],
      providers: [
        { provide: FormattingService, useClass: MockFormattingService },
        {
          provide: QuestionnairePageService,
          useClass: QuestionnairePageService,
        },
        {
          provide: CreateQuestionnaireFlashcardContentGql,
          useValue: mutationMock,
        },
        {
          provide: UpdateQuestionnaireFlashcardContentGql,
          useValue: mutationMock,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<FlashcardContentFormComponent>;

export const New: Story = {
  args: {
    formatData: null,
  },
};

export const Existing: Story = {
  args: {
    formatData: {
      __typename: 'FlashcardContentFormatData',
      format: ContentType.Flashcard,
      answer: 'Canberra is the capital of Australia.',
    },
    contentId: 'content-1',
  },
};
