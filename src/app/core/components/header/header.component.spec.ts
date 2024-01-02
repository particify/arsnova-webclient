import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import {
  MockEventService,
  MockRouter,
  MockMatDialog,
  MockFeatureFlagService,
  MockNotificationService,
} from '@testing/test-helpers';
import { NotificationService } from '@app/core/services/util/notification.service';
import { Router } from '@angular/router';
import { EventService } from '@app/core/services/util/event.service';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { DialogService } from '@app/core/services/util/dialog.service';
import { NO_ERRORS_SCHEMA, Renderer2 } from '@angular/core';
import { RoutingService } from '@app/core/services/util/routing.service';
import { MatMenuModule } from '@angular/material/menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { AuthProvider } from '@app/core/models/auth-provider';
import { BehaviorSubject, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Room } from '@app/core/models/room';
import { RoomService } from '@app/core/services/http/room.service';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';

export class MockAuthenticationService {
  private auth$$ = new BehaviorSubject<any>({ loginId: 'test@test.de' });

  getAuthenticationChanges() {
    return this.auth$$.asObservable();
  }
}

class MockRoutingService {
  goBack() {}

  getIsPreview() {
    return of({});
  }

  getRole() {
    return of({});
  }
}

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  let routerSpy = jasmine.createSpyObj('MockRouter', [
    'navigate',
    'navigateByUrl',
  ]);
  const dialogService = jasmine.createSpyObj('DialogService', [
    'openUpdateInfoDialog',
    'openDeleteDialog',
  ]);
  const announcementService = jasmine.createSpyObj('AnnouncementService', [
    'getStateByUserId',
  ]);
  announcementService.getStateByUserId.and.returnValue(of({}));
  const roomService = jasmine.createSpyObj('RoomService', [
    'getCurrentRoomStream',
  ]);
  roomService.getCurrentRoomStream.and.returnValue(of(new Room()));
  let loader: HarnessLoader;
  let userButton: MatButtonHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      imports: [
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatMenuModule,
        getTranslocoModule(),
        HttpClientTestingModule,
      ],
      providers: [
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: AuthenticationService,
          useClass: MockAuthenticationService,
        },
        {
          provide: DialogService,
          useValue: dialogService,
        },
        {
          provide: RoutingService,
          useClass: MockRoutingService,
        },
        {
          provide: MatDialog,
          useClass: MockMatDialog,
        },
        {
          provide: AnnounceService,
          useValue: announcementService,
        },
        {
          provide: RoomService,
          useValue: roomService,
        },
        {
          provide: FeatureFlagService,
          useClass: MockFeatureFlagService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    routerSpy = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // # If logged in

  it('should display user menu button if logged in', async () => {
    component.auth = new ClientAuthentication(
      '1234',
      'a@b.cd',
      AuthProvider.ARSNOVA,
      'token'
    );
    userButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#menu-button' })
    );
    expect(userButton).not.toBeNull();
  });

  // # If not logged in

  it('should display user menu button if not logged in', async () => {
    component.auth = undefined;
    userButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '#menu-button' })
    );
    expect(userButton).not.toBeNull();
  });
});
