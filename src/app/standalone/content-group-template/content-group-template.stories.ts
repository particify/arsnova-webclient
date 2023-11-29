import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';

import { ContentGroupTemplateComponent } from './content-group-template.component';
import { importProvidersFrom } from '@angular/core';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { HttpClientModule } from '@angular/common/http';
import { ContentGroupTemplate } from '@app/core/models/content-group-template';
import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { RoomMembershipService } from '@app/core/services/room-membership.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { RoutingService } from '@app/core/services/util/routing.service';

class MockService {}

export default {
  component: ContentGroupTemplateComponent,
  title: 'ContentGroupTemplate',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentGroupTemplateComponent],
      providers: [
        {
          provide: BaseTemplateService,
          useClass: MockService,
        },
        {
          provide: NotificationService,
          useClass: MockService,
        },
        {
          provide: RoomMembershipService,
          useClass: MockService,
        },
        {
          provide: GlobalStorageService,
          useClass: MockService,
        },
        {
          provide: RoutingService,
          useClass: MockService,
        },
      ],
    }),
    applicationConfig({
      providers: [
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
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

export const ContentGroupTemplateWithAttribution: Story = {
  args: {
    template: new ContentGroupTemplate(
      'Template name',
      'This is a description.',
      'en',
      tags,
      'CC-BY-4.0',
      false,
      'Attribution',
      ['templateId1', 'templateId2', 'templateId3', 'templateId4']
    ),
  },
};

export const ContentGroupTemplateWithoutAttribution: Story = {
  args: {
    template: new ContentGroupTemplate(
      'Template name',
      'This is a description.',
      'en',
      tags,
      'CC0-1.0',
      false,
      undefined,
      ['templateId1', 'templateId2', 'templateId3', 'templateId4']
    ),
  },
};

export const ContentGroupTemplateWithAttributionAiGenerated: Story = {
  args: {
    template: new ContentGroupTemplate(
      'Template name',
      'This is a description.',
      'en',
      tags,
      'CC-BY-4.0',
      true,
      'Attribution',
      ['templateId1', 'templateId2', 'templateId3', 'templateId4']
    ),
  },
};

export const ContentGroupTemplateWithOneTemplate: Story = {
  args: {
    template: new ContentGroupTemplate(
      'Template name',
      'This is a description.',
      'en',
      tags,
      'CC-BY-4.0',
      false,
      'Attribution',
      ['templateId1']
    ),
  },
};

const longTags = [
  { id: 'tagId1', name: 'This is a longer tag', verified: true },
  {
    id: 'tagId2',
    name: 'This tag is even longer than the first one',
    verified: true,
  },
  { id: 'tagId3', name: 'This is long as well', verified: true },
];

export const ContentGroupTemplateWithManyLongTags: Story = {
  args: {
    template: new ContentGroupTemplate(
      'Template name',
      'This is a description.',
      'en',
      longTags,
      'CC-BY-4.0',
      false,
      'Attribution',
      ['templateId1', 'templateId2', 'templateId3', 'templateId4']
    ),
  },
};
