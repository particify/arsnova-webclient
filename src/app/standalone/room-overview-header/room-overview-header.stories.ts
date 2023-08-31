import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { TranslocoModule } from '@ngneat/transloco';
import { RoomOverviewHeaderComponent } from '@app/standalone/room-overview-header/room-overview-header.component';
import { RouterTestingModule } from '@angular/router/testing';
import { RoutingService } from '@app/core/services/util/routing.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { Observable, of } from 'rxjs';

class MockRoutingService {}
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
      imports: [
        TranslocoModule,
        RoomOverviewHeaderComponent,
        RouterTestingModule,
      ],
      providers: [
        {
          provide: RoutingService,
          useClass: MockRoutingService,
        },
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
  ],
} as Meta;

type Story = StoryObj<RoomOverviewHeaderComponent>;

export const RoomOverviewHeader: Story = {
  args: {
    name: 'Room name',
    shortId: '12345678',
    description: '*This is a room description.*',
    renderedDescription: '<b>This is a room description.</b>',
  },
};
