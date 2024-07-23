import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';

import { AnnouncementComponent } from '@app/standalone/announcement/announcement.component';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { Announcement } from '@app/core/models/announcement';
import { UserRole } from '@app/core/models/user-roles.enum';
import { FormattingService } from '@app/core/services/http/formatting.service';

class MockService {}

export default {
  component: AnnouncementComponent,
  title: 'Announcement',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [AnnouncementComponent],
      providers: [
        {
          provide: FormattingService,
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

type Story = StoryObj<AnnouncementComponent>;

const announcement = new Announcement(
  'roomdId',
  'My awesome announcement title',
  'This is my awesome and very important announcement body.'
);
announcement.renderedBody =
  '<p>This is my awesome and very important announcement body.</p>';

export const AnnouncementOwner: Story = {
  args: {
    announcement: announcement,
    role: UserRole.OWNER,
  },
};

export const AnnouncementParticipant: Story = {
  args: {
    announcement: announcement,
    role: UserRole.PARTICIPANT,
    roomName: 'Awesome room',
  },
};
