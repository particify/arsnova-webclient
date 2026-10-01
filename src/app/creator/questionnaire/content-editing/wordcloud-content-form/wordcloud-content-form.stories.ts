import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { QuestionnairePageService } from '@app/creator/questionnaire/questionnaire-page.service';
import {
  ContentType,
  CreateQuestionnaireWordcloudContentGql,
  UpdateQuestionnaireWordcloudContentGql,
} from '@gql/generated/graphql';
import { of } from 'rxjs';
import { WordcloudContentFormComponent } from './wordcloud-content-form.component';

const mutationMock = { mutate: () => of({ data: {} }) };

export default {
  component: WordcloudContentFormComponent,
  title: 'WordcloudContentForm',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [WordcloudContentFormComponent],
      providers: [
        {
          provide: QuestionnairePageService,
          useClass: QuestionnairePageService,
        },
        {
          provide: CreateQuestionnaireWordcloudContentGql,
          useValue: mutationMock,
        },
        {
          provide: UpdateQuestionnaireWordcloudContentGql,
          useValue: mutationMock,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<WordcloudContentFormComponent>;

export const New: Story = {
  args: {
    formatData: null,
  },
};

export const Existing: Story = {
  args: {
    formatData: {
      __typename: 'WordcloudContentFormatData',
      format: ContentType.Wordcloud,
      maxAnswers: 5,
    },
    contentId: 'content-1',
  },
};
