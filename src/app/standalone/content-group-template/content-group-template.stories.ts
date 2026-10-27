import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { ContentGroupTemplateComponent } from './content-group-template.component';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import {
  QuestionnaireType,
  TemplateDetailsFragment,
} from '@gql/generated/graphql';

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
  component: ContentGroupTemplateComponent,
  title: 'ContentGroupTemplate',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentGroupTemplateComponent],
      providers: [
        {
          provide: ContentGroupService,
          useClass: MockContentGroupService,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentGroupTemplateComponent>;

const tags = [
  { id: 'tagId1', name: 'tag 1', verified: true },
  { id: 'tagId2', name: 'tag 2', verified: true },
  { id: 'tagId3', name: 'tag 3', verified: true },
];

const CC_BY = {
  id: 'CC-BY-4.0',
  name: 'CC BY 4.0',
  url: 'https://creativecommons.org/licenses/by/4.0/',
};

function template(
  changes: Partial<TemplateDetailsFragment>
): TemplateDetailsFragment {
  return {
    id: 'templateId',
    aiGenerated: false,
    attribution: 'Attribution',
    contentCount: 4,
    createdByCurrentUser: false,
    description: 'This is a description.',
    language: 'en',
    license: CC_BY,
    name: 'Template name',
    published: true,
    questionnaireId: 'templateId',
    questionnaireType: QuestionnaireType.Mixed,
    tags,
    ...changes,
  };
}

export const ContentGroupTemplatePrivate: Story = {
  args: {
    template: template({ published: false, license: null, attribution: null }),
  },
};

export const ContentGroupTemplateWithAttribution: Story = {
  args: {
    template: template({}),
  },
};

export const ContentGroupTemplateWithoutAttribution: Story = {
  args: {
    template: template({
      attribution: null,
      license: {
        id: 'CC0-1.0',
        name: 'CC0 1.0',
        url: 'https://creativecommons.org/publicdomain/zero/1.0/',
      },
    }),
  },
};

export const ContentGroupTemplateWithAttributionAiGenerated: Story = {
  args: {
    template: template({
      aiGenerated: true,
      questionnaireType: QuestionnaireType.Survey,
    }),
  },
};

export const ContentGroupTemplateWithOneTemplate: Story = {
  args: {
    template: template({
      contentCount: 1,
      questionnaireType: QuestionnaireType.Quiz,
    }),
  },
};

export const ContentGroupTemplateWithManyLongTags: Story = {
  args: {
    template: template({
      questionnaireType: QuestionnaireType.Quiz,
      tags: [
        {
          id: 'tagId1',
          name: 'This is a longer tag',
          verified: true,
        },
        {
          id: 'tagId2',
          name: 'This tag is even longer than the first one',
          verified: true,
        },
        {
          id: 'tagId3',
          name: 'This is long as well',
          verified: true,
        },
      ],
    }),
  },
};
