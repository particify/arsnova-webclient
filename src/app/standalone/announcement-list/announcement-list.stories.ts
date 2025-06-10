import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { Observable, of } from 'rxjs';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { AuthProvider } from '@app/core/models/auth-provider';
import { AnnouncementListComponent } from '@app/standalone/announcement-list/announcement-list.component';
import { UserAnnouncement } from '@app/core/models/user-announcement';
import { AnnouncementService } from '@app/core/services/http/announcement.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AnnouncementComponent } from '@app/standalone/announcement/announcement.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { FormattingService } from '@app/core/services/http/formatting.service';

class MockService {}

class MockDialogRef {
  beforeClosed() {
    return of({});
  }

  close() {}
}

class MockAnnouncementService {
  getByUserId(): Observable<UserAnnouncement[]> {
    return of([
      new UserAnnouncement(
        '1',
        'My awesome announcement',
        'This is my awesome and very important announcement body.',
        'Awesome room'
      ),
      new UserAnnouncement(
        '1',
        'Another awesome announcement',
        'This is my even more awesome and very very important announcement body.',
        'Awesome room'
      ),
      new UserAnnouncement(
        '2',
        'Announcement from another room',
        'This is an announcement from another room which is awesome as well.',
        'Another room'
      ),
    ]);
  }
}

class MockAuthenticationService {
  getCurrentAuthentication() {
    return of(
      new ClientAuthentication(
        'userId',
        'loginid',
        AuthProvider.ARSNOVA,
        'token'
      )
    );
  }
}

export default {
  component: AnnouncementListComponent,
  title: 'AnnouncementList',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [
        AnnouncementListComponent,
        AnnouncementComponent,
        LoadingIndicatorComponent,
      ],
      providers: [
        {
          provide: AnnouncementService,
          useClass: MockAnnouncementService,
        },
        {
          provide: AuthenticationService,
          useClass: MockAuthenticationService,
        },
        {
          provide: MatDialogRef,
          useClass: MockDialogRef,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { state: {} },
        },
        {
          provide: FormattingService,
          useClass: MockService,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<AnnouncementListComponent>;

export const AnnouncementList: Story = {};
