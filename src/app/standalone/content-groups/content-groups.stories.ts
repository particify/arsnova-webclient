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

class MockGlobalStorageService {}
class MockRoutingService {}

export default {
  component: ContentGroupsComponent,
  title: 'ContentGroups',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentGroupsComponent, RouterTestingModule],
      providers: [
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
        {
          provide: RoutingService,
          useClass: MockRoutingService,
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

export const ContentGroups: Story = {
  args: {
    contentGroupName: 'series',
    length: 7,
    isLocked: false,
  },
};
