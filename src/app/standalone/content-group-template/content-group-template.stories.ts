import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { ContentGroupTemplateComponent } from './content-group-template.component';
import {
  QuestionnaireType,
  TemplateDetailsFragment,
} from '@gql/generated/graphql';

export default {
  component: ContentGroupTemplateComponent,
  title: 'ContentGroupTemplate',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentGroupTemplateComponent],
      providers: [],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentGroupTemplateComponent>;

const tags: TemplateDetailsFragment['tags'] = [
  { __typename: 'TemplateTag', id: 'tagId1', name: 'tag 1', verified: true },
  { __typename: 'TemplateTag', id: 'tagId2', name: 'tag 2', verified: true },
  { __typename: 'TemplateTag', id: 'tagId3', name: 'tag 3', verified: true },
];

const CC_BY = {
  __typename: 'TemplateLicense' as const,
  id: 'CC-BY-4.0',
  name: 'CC BY 4.0',
  url: 'https://creativecommons.org/licenses/by/4.0/',
};

function template(
  changes: Partial<TemplateDetailsFragment>
): TemplateDetailsFragment {
  return {
    __typename: 'Template',
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
        __typename: 'TemplateLicense',
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
          __typename: 'TemplateTag',
          id: 'tagId1',
          name: 'This is a longer tag',
          verified: true,
        },
        {
          __typename: 'TemplateTag',
          id: 'tagId2',
          name: 'This tag is even longer than the first one',
          verified: true,
        },
        {
          __typename: 'TemplateTag',
          id: 'tagId3',
          name: 'This is long as well',
          verified: true,
        },
      ],
    }),
  },
};
