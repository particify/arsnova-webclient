import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RoomListComponent } from './room-list.component';
import { Router } from '@angular/router';
import { NotificationService } from '@app/core/services/util/notification.service';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import {
  MockNotificationService,
  MockGlobalStorageService,
  MockFeatureFlagService,
  MockEventService,
  MockRouter,
} from '@testing/test-helpers';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { EventService } from '@app/core/services/util/event.service';
import { of } from 'rxjs';
import { RoomService } from '@app/core/services/http/room.service';
import { RoomMembershipService } from '@app/core/services/room-membership.service';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { SplitShortIdPipe } from '@app/core/pipes/split-short-id.pipe';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { AuthProvider } from '@app/core/models/auth-provider';
import { MatMenuModule } from '@angular/material/menu';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';

describe('RoomListComponent', () => {
  let component: RoomListComponent;
  let fixture: ComponentFixture<RoomListComponent>;

  const mockRoutingService = jasmine.createSpyObj(['getRoleString']);

  const mockRoomService = jasmine.createSpyObj([
    'getRoom',
    'deleteRoom',
    'transferRoom',
  ]);

  const mockRoomMembershipService = jasmine.createSpyObj([
    'getMembershipChanges',
    'getMembershipsForAuthentication',
    'cancelMembership',
    'requestMembership',
  ]);
  mockRoomMembershipService.getMembershipChanges.and.returnValue(of([]));
  mockRoomMembershipService.getMembershipsForAuthentication.and.returnValue(
    of([])
  );

  const mockAuthenticationService = jasmine.createSpyObj([
    'fetchGuestAuthentication',
    'getGuestToken',
  ]);
  const auth = new ClientAuthentication(
    '1234',
    'guest1234',
    AuthProvider.ARSNOVA_GUEST,
    'token'
  );
  mockAuthenticationService.fetchGuestAuthentication.and.returnValue(of(auth));

  const mockDialogService = jasmine.createSpyObj([
    'openRoomCreateDialog',
    'openDeleteDialog',
  ]);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        getTranslocoModule(),
        MatMenuModule,
        RoomListComponent,
        SplitShortIdPipe,
      ],
      providers: [
        {
          provide: RoomService,
          useValue: mockRoomService,
        },
        {
          provide: RoomMembershipService,
          useValue: mockRoomMembershipService,
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService,
        },
        {
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
        {
          provide: RoutingService,
          useValue: mockRoutingService,
        },
        {
          provide: DialogService,
          useValue: mockDialogService,
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: FeatureFlagService,
          useClass: MockFeatureFlagService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomListComponent);
    component = fixture.componentInstance;
    component.auth = new ClientAuthentication(
      '1234',
      'a@b.cd',
      AuthProvider.ARSNOVA,
      'token'
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
