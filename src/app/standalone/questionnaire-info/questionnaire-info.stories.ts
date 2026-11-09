import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { QuestionnaireInfoComponent } from './questionnaire-info.component';
import { QuestionnaireType } from '@gql/generated/graphql';

export default {
  component: QuestionnaireInfoComponent,
  title: 'QuestionnaireInfo',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [QuestionnaireInfoComponent],
      providers: [],
    }),
  ],
} as Meta;

type Story = StoryObj<QuestionnaireInfoComponent>;

export const ContentGroupLockedMixed: Story = {
  args: {
    questionnaireType: QuestionnaireType.Mixed,
    contentCount: 3,
    published: false,
    countColor: false,
  },
};

export const ContentGroupPublishedMixed: Story = {
  args: {
    questionnaireType: QuestionnaireType.Mixed,
    contentCount: 3,
    published: true,
    countColor: false,
  },
};

export const ContentGroupPublishedQuiz: Story = {
  args: {
    questionnaireType: QuestionnaireType.Quiz,
    contentCount: 5,
    published: true,
    countColor: false,
  },
};
