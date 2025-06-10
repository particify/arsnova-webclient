import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { ContentGroupsComponent } from './content-groups.component';
import { RoutingService } from '@app/core/services/util/routing.service';

import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { ContentGroup, GroupType } from '@app/core/models/content-group';
import { ContentGroupService } from '@app/core/services/http/content-group.service';

class MockRoutingService {}
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
  component: ContentGroupsComponent,
  title: 'ContentGroups',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentGroupsComponent],
      providers: [
        ContentPublishService,
        {
          provide: RoutingService,
          useClass: MockRoutingService,
        },
        {
          provide: ContentGroupService,
          useClass: MockContentGroupService,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentGroupsComponent>;

const group = new ContentGroup();
group.name = 'Quiz';
group.contentIds = ['0', '1', '2', '3', '4', '5'];

export const ContentGroups: Story = {
  args: {
    contentGroup: group,
  },
};
