import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';

import { ContentGroupInfoComponent } from '@app/standalone/content-group-info/content-group-info.component';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { GroupType } from '@app/core/models/content-group';
import { ContentGroupService } from '@app/core/services/http/content-group.service';

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
  component: ContentGroupInfoComponent,
  title: 'ContentGroupInfo',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentGroupInfoComponent],
      providers: [
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

type Story = StoryObj<ContentGroupInfoComponent>;

export const ContentGroupLockedMixed: Story = {
  args: {
    groupType: GroupType.MIXED,
    contentCount: 3,
    published: false,
  },
};

export const ContentGroupPublishedMixed: Story = {
  args: {
    groupType: GroupType.MIXED,
    contentCount: 3,
    published: true,
  },
};

export const ContentGroupPublishedQuiz: Story = {
  args: {
    groupType: GroupType.QUIZ,
    contentCount: 5,
    published: true,
  },
};
