import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { ContentGroupTemplateSelectionComponent } from './content-group-template-selection.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AddTemplateButtonComponent } from '@app/standalone/add-template-button/add-template-button.component';
import { RoomMembershipService } from '@app/core/services/room-membership.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { TemplateTagSelectionComponent } from '@app/standalone/template-tag-selection/template-tag-selection.component';
import { TemplateLanguageSelectionComponent } from '@app/standalone/template-language-selection/template-language-selection.component';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import {
  CurrentUserTemplatesGql,
  PublishedTemplatesGql,
  QuestionnaireType,
  TemplateDetailsFragment,
  TemplateTagsByLanguageGql,
} from '@gql/generated/graphql';

class MockService {}

const tags = [
  { id: 'tagId1', name: 'tag 1', verified: true },
  { id: 'tagId2', name: 'tag 2', verified: true },
  { id: 'tagId3', name: 'tag 3', verified: true },
  { id: 'tagId4', name: 'tag 4', verified: true },
  { id: 'tagId5', name: 'tag 5', verified: true },
];

function template(
  id: string,
  changes: Partial<TemplateDetailsFragment>
): TemplateDetailsFragment {
  return {
    id,
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
    questionnaireId: id,
    questionnaireType: QuestionnaireType.Mixed,
    tags: tags.slice(0, 3),
    ...changes,
  };
}

const templates = [
  template('templateId1', {}),
  template('templateId2', {
    name: 'Another template name',
    description: 'This is another description.',
    attribution: null,
    license: {
      id: 'CC0-1.0',
      name: 'CC0 1.0',
      url: 'https://creativecommons.org/publicdomain/zero/1.0/',
    },
    tags: tags.slice(2),
    questionnaireType: QuestionnaireType.Quiz,
  }),
  template('templateId3', {
    aiGenerated: true,
    contentCount: 3,
    questionnaireType: QuestionnaireType.Survey,
  }),
];

function connection(nodes: TemplateDetailsFragment[]) {
  return {
    edges: nodes.map((node) => ({ node, cursor: node.id })),
    pageInfo: { hasNextPage: false, hasPreviousPage: false },
  };
}

const publishedTemplatesGqlMock = {
  fetch: () => of({ data: { publishedTemplates: connection(templates) } }),
};

const currentUserTemplatesGqlMock = {
  fetch: () =>
    of({ data: { currentUserTemplates: connection(templates.slice(0, 1)) } }),
};

const templateTagsByLanguageGqlMock = {
  fetch: () => of({ data: { templateTagsByLanguage: tags } }),
};

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

export default {
  component: ContentGroupTemplateSelectionComponent,
  title: 'ContentGroupTemplateSelection',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [
        ContentGroupTemplateSelectionComponent,
        AddTemplateButtonComponent,
        TemplateLanguageSelectionComponent,
        TemplateTagSelectionComponent,
      ],
      providers: [
        {
          provide: PublishedTemplatesGql,
          useValue: publishedTemplatesGqlMock,
        },
        {
          provide: CurrentUserTemplatesGql,
          useValue: currentUserTemplatesGqlMock,
        },
        {
          provide: TemplateTagsByLanguageGql,
          useValue: templateTagsByLanguageGqlMock,
        },
        {
          provide: RoomMembershipService,
          useClass: MockService,
        },
        {
          provide: AnnounceService,
          useClass: MockService,
        },
        {
          provide: RoutingService,
          useClass: MockService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { data: {}, queryParams: { lang: 'en' } },
          },
        },
        {
          provide: ContentGroupService,
          useClass: MockContentGroupService,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentGroupTemplateSelectionComponent>;

export const ContentGroupTemplateSelection: Story = {};
