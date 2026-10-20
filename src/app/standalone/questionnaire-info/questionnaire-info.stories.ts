import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { QuestionnaireInfoComponent } from './questionnaire-info.component';
import { QuestionnaireType } from '@gql/generated/graphql';

class MockContentGroupService {
  private typeIcons: Map<QuestionnaireType, string> = new Map<
    QuestionnaireType,
    string
  >([
    [QuestionnaireType.Mixed, 'dashboard'],
    [QuestionnaireType.Quiz, 'sports_esports'],
    [QuestionnaireType.Survey, 'tune'],
    [QuestionnaireType.Flashcards, 'school'],
  ]);
  getQuestionnaireTypeIcons() {
    return this.typeIcons;
  }
}

export default {
  component: QuestionnaireInfoComponent,
  title: 'QuestionnaireInfo',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [QuestionnaireInfoComponent],
      providers: [
        {
          provide: ContentGroupService,
          useClass: MockContentGroupService,
        },
      ],
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
