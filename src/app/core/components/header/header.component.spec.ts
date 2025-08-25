import { ComponentFixture } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import {
  MockRouter,
  MockMatDialog,
  MockFeatureFlagService,
} from '@testing/test-helpers';
import { Router } from '@angular/router';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { DialogService } from '@app/core/services/util/dialog.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { MatMenuModule } from '@angular/material/menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { AuthProvider } from '@app/core/models/auth-provider';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Room } from '@app/core/models/room';
import { RoomService } from '@app/core/services/http/room.service';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';
import { configureTestModule } from '@testing/test.setup';
import { AnnouncementService } from '@app/core/services/http/announcement.service';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { LocalFileService } from '@app/core/services/util/local-file.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiConfig } from '@app/core/models/api-config';
import { ErrorHandler, signal } from '@angular/core';

class MockErrorHandler {
  get uiErrorCount$(): Observable<number> {
    return of(0);
  }

  get httpErrorCount$(): Observable<number> {
    return of(0);
  }
}

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

  getRoomJoinUrl() {
    return 'awesome-url/p/12345678';
  }

  isHome() {
    return signal<boolean>(true);
  }
}

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

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

  const mockApiConfigService = jasmine.createSpyObj(ApiConfigService, [
    'getApiConfig$',
  ]);
  mockApiConfigService.getApiConfig$.and.returnValue(
    of(new ApiConfig([], {}, {}, false))
  );

  beforeEach(async () => {
    const testBed = configureTestModule(
      [
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatMenuModule,
        MatTooltipModule,
        getTranslocoModule(),
        HeaderComponent,
      ],
      [
        {
          provide: ErrorHandler,
          useClass: MockErrorHandler,
        },
        {
          provide: Router,
          useClass: MockRouter,
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
          provide: AnnouncementService,
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
        LocalFileService,
      ]
    );
    testBed.compileComponents();
    fixture = testBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
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
