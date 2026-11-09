import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { QuestionnaireComponent } from './questionnaire.component';
import { RoutingService } from '@app/core/services/util/routing.service';
import {
  QuestionnairePublishingMode,
  QuestionnaireType,
  ToggleQuestionnairePublishedGql,
} from '@gql/generated/graphql';
import { of } from 'rxjs';

class MockRoutingService {}
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
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<QuestionnaireComponent>;

export const Questionnaire: Story = {
  args: {
    questionnaire: {
      __typename: 'Questionnaire',
      id: 'questionnaireId',
      name: 'Quiz',
      contentCount: 42,
      published: true,
      type: QuestionnaireType.Quiz,
      publishingMode: QuestionnairePublishingMode.All,
      leaderboardEnabled: null,
      publishedUpToContent: null,
    },
    isParticipant: false,
    showRipple: false,
  },
};
