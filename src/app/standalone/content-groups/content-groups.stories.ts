import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';
import { ContentGroupsComponent } from './content-groups.component';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { RouterTestingModule } from '@angular/router/testing';
import { RoutingService } from '@app/core/services/util/routing.service';
import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { ContentGroup } from '@app/core/models/content-group';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { NotificationService } from '@app/core/services/util/notification.service';

class MockGlobalStorageService {}
class MockRoutingService {}
class MockService {}

export default {
  component: ContentGroupsComponent,
  title: 'ContentGroups',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentGroupsComponent, RouterTestingModule],
      providers: [
        ContentPublishService,
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
        {
          provide: RoutingService,
          useClass: MockRoutingService,
        },
        {
          provide: ContentGroupService,
          useClass: MockService,
        },
        {
          provide: NotificationService,
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

type Story = StoryObj<ContentGroupsComponent>;

const group = new ContentGroup();
group.name = 'Quiz';
group.contentIds = ['0', '1', '2', '3', '4', '5'];

export const ContentGroups: Story = {
  args: {
    contentGroup: group,
  },
};
