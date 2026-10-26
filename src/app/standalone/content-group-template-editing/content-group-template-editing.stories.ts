import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { ContentGroupTemplateEditingComponent } from './content-group-template-editing.component';

import { RoutingService } from '@app/core/services/util/routing.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import {
  TemplateLicensesGql,
  TemplateTagsByLanguageGql,
} from '@gql/generated/graphql';
import { of } from 'rxjs';

class MockService {}

const templateLicensesGqlMock = {
  fetch: () =>
    of({
      data: {
        templateLicenses: [
          {
            id: 'CC0-1.0',
            name: 'CC0 1.0',
            url: 'https://creativecommons.org/publicdomain/zero/1.0/',
          },
          {
            id: 'CC-BY-4.0',
            name: 'CC BY 4.0',
            url: 'https://creativecommons.org/licenses/by/4.0/',
          },
        ],
      },
    }),
};

const templateTagsByLanguageGqlMock = {
  fetch: () =>
    of({
      data: {
        templateTagsByLanguage: [
          { id: 'tagId1', name: 'tag 1', verified: true },
          { id: 'tagId2', name: 'tag 2', verified: true },
          { id: 'tagId3', name: 'tag 3', verified: true },
        ],
      },
    }),
};

export default {
  component: ContentGroupTemplateEditingComponent,
  title: 'ContentGroupTemplateEditing',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentGroupTemplateEditingComponent],
      providers: [
        {
          provide: TemplateLicensesGql,
          useValue: templateLicensesGqlMock,
        },
        {
          provide: TemplateTagsByLanguageGql,
          useValue: templateTagsByLanguageGqlMock,
        },
        {
          provide: RoutingService,
          useClass: MockService,
        },
        {
          provide: AnnounceService,
          useClass: MockService,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentGroupTemplateEditingComponent>;

export const ContentGroupTemplateEditing: Story = {
  args: {
    name: 'Template name',
  },
};
