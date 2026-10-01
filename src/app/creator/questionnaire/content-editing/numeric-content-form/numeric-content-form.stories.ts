import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { QuestionnairePageService } from '@app/creator/questionnaire/questionnaire-page.service';
import {
  ContentType,
  CreateQuestionnaireNumericContentGql,
  UpdateQuestionnaireNumericContentGql,
} from '@gql/generated/graphql';
import { of } from 'rxjs';
import { NumericContentFormComponent } from './numeric-content-form.component';

const mutationMock = { mutate: () => of({ data: {} }) };

export default {
  component: NumericContentFormComponent,
  title: 'NumericContentForm',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [NumericContentFormComponent],
      providers: [
        {
          provide: QuestionnairePageService,
          useClass: QuestionnairePageService,
        },
        {
          provide: CreateQuestionnaireNumericContentGql,
          useValue: mutationMock,
        },
        {
          provide: UpdateQuestionnaireNumericContentGql,
          useValue: mutationMock,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<NumericContentFormComponent>;

const formatData = {
  __typename: 'NumericContentFormatData' as const,
  format: ContentType.Numeric,
  minNumber: 0,
  maxNumber: 100,
  correctNumber: 42,
  tolerance: 2,
};

export const New: Story = {
  args: { formatData: null },
};

export const WithCorrectAnswer: Story = {
  args: { formatData, contentId: 'content-1', hasCorrectAnswer: true },
};

export const Preview: Story = {
  args: { formatData, preview: true, hasCorrectAnswer: true },
};
