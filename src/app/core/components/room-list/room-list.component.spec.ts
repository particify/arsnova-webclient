import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RoomListComponent } from './room-list.component';
import { Router } from '@angular/router';
import { NotificationService } from '@core/services/util/notification.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
  JsonTranslationLoader,
  MockNotificationService,
  MockGlobalStorageService,
} from '@testing/test-helpers';
import { GlobalStorageService } from '@core/services/util/global-storage.service';
import { RoutingService } from '@core/services/util/routing.service';
import { DialogService } from '@core/services/util/dialog.service';
import { EventService } from '@core/services/util/event.service';
import { MockEventService, MockRouter } from '@testing/test-helpers';
import { of } from 'rxjs';
import { RoomService } from '@core/services/http/room.service';
import { RoomMembershipService } from '@core/services/room-membership.service';
import { AuthenticationService } from '@core/services/http/authentication.service';
import { SplitShortIdPipe } from '@core/pipes/split-short-id.pipe';
import { ClientAuthentication } from '@core/models/client-authentication';
import { AuthProvider } from '@core/models/auth-provider';
import { MatMenuModule } from '@angular/material/menu';
import { NO_ERRORS_SCHEMA } from '@angular/core';

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

  const mockSplitShortId = new SplitShortIdPipe();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RoomListComponent, SplitShortIdPipe],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
        MatMenuModule,
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
          provide: SplitShortIdPipe,
          useValue: mockSplitShortId,
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
