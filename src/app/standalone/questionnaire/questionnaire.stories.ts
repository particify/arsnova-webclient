import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { QuestionnaireComponent } from './questionnaire.component';
import { RoutingService } from '@app/core/services/util/routing.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import {
  QuestionnaireType,
  ToggleQuestionnairePublishedGql,
} from '@gql/generated/graphql';
import { of } from 'rxjs';

class MockRoutingService {}
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

const toggleQuestionnairePublishedGqlMock = {
  mutate: () =>
    of({
      data: {
        toggleQuestionnairePublished: {
          success: true,
        },
      },
    }),
};

export default {
  component: QuestionnaireComponent,
  title: 'Questionnaire',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [QuestionnaireComponent],
      providers: [
        {
          provide: ToggleQuestionnairePublishedGql,
          useValue: toggleQuestionnairePublishedGqlMock,
        },
        {
          provide: RoutingService,
          useClass: MockRoutingService,
        },
        {
          provide: ContentGroupService,
          useClass: MockContentGroupService,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<QuestionnaireComponent>;

export const Questionnaire: Story = {
  args: {
    questionnaire: {
      id: 'questionnaireId',
      name: 'Quiz',
      contentCount: 42,
      published: true,
      type: QuestionnaireType.Quiz,
    },
    isParticipant: false,
    showRipple: false,
  },
};
