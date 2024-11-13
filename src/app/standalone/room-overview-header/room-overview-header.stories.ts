import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';

import { RoomOverviewHeaderComponent } from '@app/standalone/room-overview-header/room-overview-header.component';
import { RouterTestingModule } from '@angular/router/testing';
import { NotificationService } from '@app/core/services/util/notification.service';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { Observable, of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { TranslocoRootModule } from '@app/transloco-root.module';

class MockNotificationService {}
class MockFormattingService {
  postString(text: string): Observable<string> {
    return of(text);
  }
}

export default {
  component: RoomOverviewHeaderComponent,
  title: 'RoomOverviewHeader',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [RoomOverviewHeaderComponent, RouterTestingModule],
      providers: [
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: FormattingService,
          useClass: MockFormattingService,
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

type Story = StoryObj<RoomOverviewHeaderComponent>;

export const RoomOverviewHeader: Story = {
  args: {
    name: 'Room name',
    shortId: '12345678',
    description: '*This is a room description.*',
    renderedDescription: '<b>This is a room description.</b>',
    roomJoinUrl: 'https://awesome-room-join-url.de',
  },
};
