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
import { DialogService } from '@app/core/services/util/dialog.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { GroupType } from '@app/core/models/content-group';

class MockService {}

class MockContentGroupService {
  private typeIcons: Map<GroupType, string> = new Map<GroupType, string>([
    [GroupType.MIXED, 'dashboard'],
    [GroupType.QUIZ, 'sports_esports'],
    [GroupType.SURVEY, 'tune'],
    [GroupType.FLASHCARDS, 'school'],
  ]);
  getTypeIcons() {
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
        {
          provide: DialogService,
          useClass: MockService,
        },
        {
          provide: ContentGroupService,
          useClass: MockContentGroupService,
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

const templateWithAttribution = new ContentGroupTemplate(
  'Template name',
  'This is a description.',
  'en',
  tags,
  'CC-BY-4.0',
  false,
  'Attribution',
  ['templateId1', 'templateId2', 'templateId3', 'templateId4']
);
templateWithAttribution.groupType = GroupType.MIXED;

export const ContentGroupTemplateWithAttribution: Story = {
  args: {
    template: templateWithAttribution,
  },
};

const templateWithoutAttribution = new ContentGroupTemplate(
  'Template name',
  'This is a description.',
  'en',
  tags,
  'CC0-1.0',
  false,
  undefined,
  ['templateId1', 'templateId2', 'templateId3', 'templateId4']
);
templateWithoutAttribution.groupType = GroupType.MIXED;

export const ContentGroupTemplateWithoutAttribution: Story = {
  args: {
    template: templateWithoutAttribution,
  },
};

const templateWithAttributionAiGenerated = new ContentGroupTemplate(
  'Template name',
  'This is a description.',
  'en',
  tags,
  'CC-BY-4.0',
  true,
  'Attribution',
  ['templateId1', 'templateId2', 'templateId3', 'templateId4']
);
templateWithAttributionAiGenerated.groupType = GroupType.SURVEY;

export const ContentGroupTemplateWithAttributionAiGenerated: Story = {
  args: {
    template: templateWithAttributionAiGenerated,
  },
};

const templateWithOneContent = new ContentGroupTemplate(
  'Template name',
  'This is a description.',
  'en',
  tags,
  'CC-BY-4.0',
  false,
  'Attribution',
  ['templateId1']
);
templateWithOneContent.groupType = GroupType.QUIZ;

export const ContentGroupTemplateWithOneTemplate: Story = {
  args: {
    template: templateWithOneContent,
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

const templateWithManyLongTags = new ContentGroupTemplate(
  'Template name',
  'This is a description.',
  'en',
  longTags,
  'CC-BY-4.0',
  false,
  'Attribution',
  ['templateId1', 'templateId2', 'templateId3', 'templateId4']
);
templateWithManyLongTags.groupType = GroupType.QUIZ;

export const ContentGroupTemplateWithManyLongTags: Story = {
  args: {
    template: templateWithManyLongTags,
  },
};
