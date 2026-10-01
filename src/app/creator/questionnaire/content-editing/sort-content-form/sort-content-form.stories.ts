import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { QuestionnairePageService } from '@app/creator/questionnaire/questionnaire-page.service';
import {
  ContentType,
  CreateQuestionnaireSortContentGql,
  UpdateQuestionnaireSortContentGql,
} from '@gql/generated/graphql';
import { of } from 'rxjs';
import { SortContentFormComponent } from './sort-content-form.component';

const mutationMock = { mutate: () => of({ data: {} }) };

/** The preview renders the items as they are typed, without a server. */
class MockFormattingService {
  postString(text: string) {
    return of({ html: `<p>${text}</p>` });
  }
}

export default {
  component: SortContentFormComponent,
  title: 'SortContentForm',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [SortContentFormComponent],
      providers: [
        { provide: FormattingService, useClass: MockFormattingService },
        {
          provide: QuestionnairePageService,
          useClass: QuestionnairePageService,
        },
        {
          provide: CreateQuestionnaireSortContentGql,
          useValue: mutationMock,
        },
        {
          provide: UpdateQuestionnaireSortContentGql,
          useValue: mutationMock,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<SortContentFormComponent>;

/** Stored shuffled; the correct order is Mercury, Venus, Earth, Mars. */
const formatData = {
  __typename: 'SortContentFormatData' as const,
  format: ContentType.Sort,
  options: [
    { __typename: 'AnswerOption' as const, label: 'Earth' },
    { __typename: 'AnswerOption' as const, label: 'Mercury' },
    { __typename: 'AnswerOption' as const, label: 'Mars' },
    { __typename: 'AnswerOption' as const, label: 'Venus' },
  ],
  correctOrder: [1, 3, 0, 2],
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
