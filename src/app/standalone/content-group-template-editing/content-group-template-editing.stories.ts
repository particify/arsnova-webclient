import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { ContentGroupTemplateEditingComponent } from './content-group-template-editing.component';

import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { of } from 'rxjs';

class MockService {}

class MockTemplateService {
  getTemplateTags() {
    return of([
      { id: 'tagId1', name: 'tag 1', verified: true },
      { id: 'tagId2', name: 'tag 2', verified: true },
      { id: 'tagId3', name: 'tag 3', verified: true },
    ]);
  }
}

export default {
  component: ContentGroupTemplateEditingComponent,
  title: 'ContentGroupTemplateEditing',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentGroupTemplateEditingComponent],
      providers: [
        {
          provide: BaseTemplateService,
          useClass: MockTemplateService,
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
