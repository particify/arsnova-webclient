import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RoomSelectionComponent } from '@app/standalone/_dialogs/room-selection/room-selection.component';
import { RoomService } from '@app/core/services/http/room.service';
import { RoomMembershipService } from '@app/core/services/room-membership.service';
import { of } from 'rxjs';
import { Membership } from '@app/core/models/membership';
import { UserRole } from '@app/core/models/user-roles.enum';
import { RoomSummary } from '@app/core/models/room-summary';

const membership1 = new Membership();
membership1.lastVisit = new Date().toDateString();
membership1.primaryRole = UserRole.EDITOR;
membership1.roles = [UserRole.EDITOR];
membership1.roomId = 'roomId1';
membership1.roomShortId = '11111111';

const membership2 = new Membership();
membership2.lastVisit = new Date().toDateString();
membership2.primaryRole = UserRole.EDITOR;
membership2.roles = [UserRole.EDITOR];
membership2.roomId = 'roomId2';
membership2.roomShortId = '22222222';

const summary1 = new RoomSummary();
summary1.id = 'roomId1';
summary1.name = 'Room 1';
summary1.shortId = '11111111';

const summary2 = new RoomSummary();
summary2.id = 'roomId2';
summary2.name = 'Room 2';
summary2.shortId = '22222222';

class MockMembershipService {
  getCurrentMemberships() {
    return of([membership1, membership2]);
  }
}

class MockRoomService {
  getRoomSummaries() {
    return of([summary1, summary2]);
  }
}

class MockMatDialogRef {}

export default {
  component: RoomSelectionComponent,
  title: 'RoomSelection',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [RoomSelectionComponent],
      providers: [
        {
          provide: RoomService,
          useClass: MockRoomService,
        },
        {
          provide: RoomMembershipService,
          useClass: MockMembershipService,
        },
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {},
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

type Story = StoryObj<RoomSelectionComponent>;

export const RoomSelection: Story = {};
