import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { ContentGroupTemplatePreviewComponent } from './content-group-template-preview.component';

import { RoutingService } from '@app/core/services/util/routing.service';
import { of } from 'rxjs';
import { ContentService } from '@app/core/services/http/content.service';

import { RoomMembershipService } from '@app/core/services/room-membership.service';
import { AddTemplateButtonComponent } from '@app/standalone/add-template-button/add-template-button.component';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { AuthenticatedUser } from '@app/core/models/authenticated-user';
import {
  ContentType,
  QuestionnairePublishedContentsByQuestionnaireIdGql,
  QuestionnaireType,
  TemplateByIdGql,
} from '@gql/generated/graphql';

class MockService {}

const templateByIdGqlMock = {
  watch: () => ({
    valueChanges: of({
      data: {
        templateById: {
          id: 'templateId1',
          aiGenerated: false,
          attribution: 'Attribution',
          contentCount: 4,
          createdByCurrentUser: false,
          description: 'This is a description.',
          language: 'en',
          license: {
            id: 'CC-BY-4.0',
            name: 'CC BY 4.0',
            url: 'https://creativecommons.org/licenses/by/4.0/',
          },
          name: 'Template name',
          published: true,
          questionnaireId: 'templateId1',
          questionnaireType: QuestionnaireType.Mixed,
          tags: [
            { id: 'tagId1', name: 'tag 1', verified: true },
            { id: 'tagId2', name: 'tag 2', verified: true },
            { id: 'tagId3', name: 'tag 3', verified: true },
          ],
        },
      },
    }),
  }),
};

function contentNode(id: string, body: string, format: ContentType) {
  return { node: { id, body, formatData: { format } } };
}

const publishedContentsGqlMock = {
  fetch: () =>
    of({
      data: {
        questionnairePublishedContentsByQuestionnaireId: {
          edges: [
            contentNode('content1', 'content1', ContentType.Text),
            contentNode('content2', 'content2', ContentType.Choice),
            contentNode('content3', 'content3', ContentType.Scale),
            contentNode('content4', 'content4', ContentType.Wordcloud),
          ],
        },
      },
    }),
};

class MockRoutingService {
  getRoute() {
    return 'https://link-to-template/templateId1';
  }
}

class MockContentService {
  getTypeIcons() {
    return new Map<ContentType, string>([
      [ContentType.Choice, 'list'],
      [ContentType.Scale, 'mood'],
      [ContentType.Binary, 'rule'],
      [ContentType.Text, 'description'],
      [ContentType.Wordcloud, 'cloud'],
      [ContentType.Sort, 'move_up'],
      [ContentType.Prioritization, 'sort'],
      [ContentType.Slide, 'info'],
      [ContentType.Flashcard, 'school'],
    ]);
  }
}

class MockContentGroupService {
  private typeIcons = new Map<QuestionnaireType, string>([
    [QuestionnaireType.Mixed, 'dashboard'],
    [QuestionnaireType.Quiz, 'sports_esports'],
    [QuestionnaireType.Survey, 'tune'],
    [QuestionnaireType.Flashcards, 'school'],
  ]);
  getQuestionnaireTypeIcons() {
    return this.typeIcons;
  }
}

class MockAuthenticationService {
  getCurrentAuthentication() {
    return of(new AuthenticatedUser('userId', true, 'displayId'));
  }
}

export default {
  component: ContentGroupTemplatePreviewComponent,
  title: 'ContentGroupTemplatePreview',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [
        ContentGroupTemplatePreviewComponent,
        AddTemplateButtonComponent,
      ],
      providers: [
        {
          provide: TemplateByIdGql,
          useValue: templateByIdGqlMock,
        },
        {
          provide: QuestionnairePublishedContentsByQuestionnaireIdGql,
          useValue: publishedContentsGqlMock,
        },
        {
          provide: ContentService,
          useClass: MockContentService,
        },
        {
          provide: RoutingService,
          useClass: MockRoutingService,
        },
        {
          provide: RoomMembershipService,
          useClass: MockService,
        },
        {
          provide: AuthenticationService,
          useClass: MockAuthenticationService,
        },
        {
          provide: ContentGroupService,
          useClass: MockContentGroupService,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentGroupTemplatePreviewComponent>;

export const ContentGroupTemplatePreview: Story = {
  args: {
    templateId: 'templateId1',
  },
};
