import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { Observable, of } from 'rxjs';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { AuthenticatedUser } from '@app/core/models/authenticated-user';
import { AuthProvider } from '@app/core/models/auth-provider';
import { ContentWaitingComponent } from '@app/standalone/content-waiting/content-waiting.component';
import { ContentStepInfoComponent } from '@app/standalone/content-step-info/content-step-info.component';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { RoomUserAlias } from '@app/core/models/room-user-alias';
import { RoomUserAliasService } from '@app/core/services/http/room-user-alias.service';

class MockRoomUserAliasService {
  updateAlias(): Observable<RoomUserAlias> {
    return of({ id: '1', alias: 'My Alias', seed: 1111 });
  }

  generateAlias(): Observable<RoomUserAlias> {
    return of({ id: '1', alias: 'Happy Hippo', seed: 2222 });
  }
}

class MockAuthenticationService {
  getCurrentAuthentication() {
    return of(
      new AuthenticatedUser('userId', 'loginid', AuthProvider.ARSNOVA, 'token')
    );
  }
}

export default {
  component: ContentWaitingComponent,
  title: 'ContentWaiting',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [
        ContentWaitingComponent,
        ContentStepInfoComponent,
        LoadingButtonComponent,
      ],
      providers: [
        {
          provide: RoomUserAliasService,
          useClass: MockRoomUserAliasService,
        },
        {
          provide: AuthenticationService,
          useClass: MockAuthenticationService,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ContentWaitingComponent>;

export const ContentWaiting: Story = {
  args: {
    current: 1,
    totalCount: 5,
    roomId: 'roomId',
  },
};

export const ContentWaitingParticipant: Story = {
  args: {
    current: 1,
    totalCount: 5,
    roomId: 'roomId',
    alias: { id: '', alias: 'Happy Hippo', seed: 2222 },
  },
};

export const ContentWaitingParticipantWithAlias: Story = {
  args: {
    current: 1,
    totalCount: 5,
    roomId: 'roomId',
    alias: { id: '1', alias: 'My Alias', seed: 1111 },
  },
};
