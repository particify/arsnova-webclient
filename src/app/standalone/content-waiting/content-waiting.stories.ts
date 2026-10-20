import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { of } from 'rxjs';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { AuthenticatedUser } from '@app/core/models/authenticated-user';
import { ContentWaitingComponent } from '@app/standalone/content-waiting/content-waiting.component';
import { ContentStepInfoComponent } from '@app/standalone/content-step-info/content-step-info.component';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import {
  RoomUserAliasByRoomIdGql,
  SetRoomUserAliasGql,
} from '@gql/generated/graphql';

const roomUserAliasByRoomIdGqlMock = {
  fetch: () =>
    of({
      data: {
        roomUserAliasByRoomId: { id: null, alias: 'Happy Hippo', seed: 2222 },
      },
    }),
};

const setRoomUserAliasGqlMock = {
  mutate: () =>
    of({
      data: {
        setRoomUserAlias: { id: '1', alias: 'My Alias', seed: 1111 },
      },
    }),
};

class MockAuthenticationService {
  getCurrentAuthentication() {
    return of(new AuthenticatedUser('userId', true, 'displayId'));
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
          provide: RoomUserAliasByRoomIdGql,
          useValue: roomUserAliasByRoomIdGqlMock,
        },
        {
          provide: SetRoomUserAliasGql,
          useValue: setRoomUserAliasGqlMock,
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
    alias: { id: null, alias: 'Happy Hippo', seed: 2222 },
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
