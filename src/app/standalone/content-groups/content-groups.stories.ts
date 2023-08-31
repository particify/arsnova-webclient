import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslocoModule } from '@ngneat/transloco';
import { ContentGroupsComponent } from './content-groups.component';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { RouterTestingModule } from '@angular/router/testing';
import { RoutingService } from '@app/core/services/util/routing.service';

class MockGlobalStorageService {}
class MockRoutingService {}

export default {
  component: ContentGroupsComponent,
  title: 'ContentGroups',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [
        TranslocoModule,
        ContentGroupsComponent,
        BrowserAnimationsModule,
        RouterTestingModule,
      ],
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
