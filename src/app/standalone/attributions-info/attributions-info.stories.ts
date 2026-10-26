import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { of } from 'rxjs';
import {
  QuestionnaireContentsByQuestionnaireIdGql,
  TemplateContentAttributionsByQuestionnaireIdGql,
} from '@gql/generated/graphql';
import { AttributionsInfoComponent } from './attributions-info.component';

const contentsMock = {
  watch: () => ({
    valueChanges: of({
      dataState: 'complete',
      data: {
        questionnaireContentsByQuestionnaireId: {
          edges: ['content1', 'content2', 'content3'].map((id) => ({
            node: { id },
          })),
        },
      },
    }),
  }),
};

const attributionsMock = {
  watch: () => ({
    valueChanges: of({
      dataState: 'complete',
      data: {
        templateContentAttributionsByQuestionnaireId: [
          {
            contentId: 'content1',
            templateId: 'template1',
            attribution: 'Albert Einstein',
            license: { id: 'CC0-1.0', name: 'CC0 1.0' },
            upstreamAttributions: [],
          },
          {
            contentId: 'content3',
            templateId: 'template1',
            attribution: null,
            license: { id: 'CC-BY-4.0', name: 'CC BY 4.0' },
            upstreamAttributions: [
              {
                templateId: 'template0',
                attribution: 'Marie Curie',
                license: { id: 'CC-BY-4.0', name: 'CC BY 4.0' },
              },
            ],
          },
        ],
      },
    }),
  }),
};

export default {
  component: AttributionsInfoComponent,
  title: 'AttributionsInfo',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [AttributionsInfoComponent],
      providers: [
        {
          provide: QuestionnaireContentsByQuestionnaireIdGql,
          useValue: contentsMock,
        },
        {
          provide: TemplateContentAttributionsByQuestionnaireIdGql,
          useValue: attributionsMock,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<AttributionsInfoComponent>;

export const AttributionsInfo: Story = {
  args: {
    questionnaireId: 'questionnaire1',
  },
};
