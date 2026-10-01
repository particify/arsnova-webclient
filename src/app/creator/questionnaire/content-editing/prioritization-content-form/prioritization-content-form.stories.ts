import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { QuestionnairePageService } from '@app/creator/questionnaire/questionnaire-page.service';
import {
  ContentType,
  CreateQuestionnairePrioritizationContentGql,
  UpdateQuestionnairePrioritizationContentGql,
} from '@gql/generated/graphql';
import { of } from 'rxjs';
import { PrioritizationContentFormComponent } from './prioritization-content-form.component';

const mutationMock = { mutate: () => of({ data: {} }) };

/** The preview renders the items as they are typed, without a server. */
class MockFormattingService {
  postString(text: string) {
    return of({ html: `<p>${text}</p>` });
  }
}

export default {
  component: PrioritizationContentFormComponent,
  title: 'PrioritizationContentForm',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [PrioritizationContentFormComponent],
      providers: [
        { provide: FormattingService, useClass: MockFormattingService },
        {
          provide: QuestionnairePageService,
          useClass: QuestionnairePageService,
        },
        {
          provide: CreateQuestionnairePrioritizationContentGql,
          useValue: mutationMock,
        },
        {
          provide: UpdateQuestionnairePrioritizationContentGql,
          useValue: mutationMock,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<PrioritizationContentFormComponent>;

const formatData = {
  __typename: 'PrioritizationContentFormatData' as const,
  format: ContentType.Prioritization,
  assignablePoints: 100,
  options: [
    { __typename: 'AnswerOption' as const, label: 'More exercises' },
    { __typename: 'AnswerOption' as const, label: 'Shorter lectures' },
    { __typename: 'AnswerOption' as const, label: 'Recorded sessions' },
  ],
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
