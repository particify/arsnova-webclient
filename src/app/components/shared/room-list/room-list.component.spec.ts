import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RoomListComponent } from './room-list.component';
import { Router } from '@angular/router';
import { NotificationService } from '@arsnova/app/services/util/notification.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
  JsonTranslationLoader,
  MockNotificationService,
  MockGlobalStorageService
} from '@arsnova/testing/test-helpers';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { RoutingService } from '@arsnova/app/services/util/routing.service';
import { DialogService } from '@arsnova/app/services/util/dialog.service';
import { EventService } from '@arsnova/app/services/util/event.service';
import { MockEventService, MockRouter } from '@arsnova/testing/test-helpers';
import { of } from 'rxjs';
import { RoomService } from '@arsnova/app/services/http/room.service';
import { RoomMembershipService } from '@arsnova/app/services/room-membership.service';
import { AuthenticationService } from '@arsnova/app/services/http/authentication.service';
import { SplitShortIdPipe } from '@arsnova/app/pipes/split-short-id.pipe';
import { ClientAuthentication } from '@arsnova/app/models/client-authentication';
import { AuthProvider } from '@arsnova/app/models/auth-provider';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('RoomListComponent', () => {
  let component: RoomListComponent;
  let fixture: ComponentFixture<RoomListComponent>;

  const mockRoutingService = jasmine.createSpyObj(['getRoleString']);

  const mockRoomService = jasmine.createSpyObj(['getRoom', 'deleteRoom', 'transferRoom']);

  const mockRoomMembershipService = jasmine.createSpyObj(['getMembershipChanges', 'getMembershipsForAuthentication', 'cancelMembership', 'requestMembership']);
  mockRoomMembershipService.getMembershipChanges.and.returnValue(of([]));
  mockRoomMembershipService.getMembershipsForAuthentication.and.returnValue(of([]));

  const mockAuthenticationService = jasmine.createSpyObj(['fetchGuestAuthentication', 'getGuestToken']);
  const auth = new ClientAuthentication('1234', 'guest1234', AuthProvider.ARSNOVA_GUEST, 'token');
  mockAuthenticationService.fetchGuestAuthentication.and.returnValue(of(auth));

  const mockDialogService = jasmine.createSpyObj(['openRoomCreateDialog', 'openDeleteDialog']);

  const mockSplitShortId = new SplitShortIdPipe();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        RoomListComponent,
        SplitShortIdPipe
      ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader
          },
          isolate: true
        }),
        MatMenuModule
      ],
      providers: [
        {
          provide: RoomService,
          useValue: mockRoomService
        },
        {
          provide: RoomMembershipService,
          useValue: mockRoomMembershipService
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService
        },
        {
          provide: EventService,
          useClass: MockEventService
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService
        },
        {
          provide: RoutingService,
          useValue: mockRoutingService
        },
        {
          provide: DialogService,
          useValue: mockDialogService
        },
        {
          provide: Router,
          useClass: MockRouter
        },
        {
          provide: SplitShortIdPipe,
          useValue: mockSplitShortId
        }
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomListComponent);
    component = fixture.componentInstance;
    component.auth = new ClientAuthentication('1234', 'a@b.cd', AuthProvider.ARSNOVA, 'token');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
