import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { EventService } from '@app/core/services/util/event.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import {
  ActivatedRouteStub,
  MockEventService,
  MockMatDialog,
  MockNotificationService,
  MockRouter,
  JsonTranslationLoader,
} from '@testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AuthProvider } from '@app/core/models/auth-provider';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  const mockAuthenticationService = jasmine.createSpyObj([
    'getCurrentAuthentication',
    'isLoggedIn',
    'login',
    'loginViaSso',
  ]);
  mockAuthenticationService.getCurrentAuthentication.and.returnValue(of({}));

  const mockDialogService = jasmine.createSpyObj(['openUserActivationDialog']);

  const mockRoutingService = jasmine.createSpyObj(['redirect']);

  const data = {
    apiConfig: {
      authenticationProviders: [] as AuthProvider[],
    },
  };

  const activatedRouteStub = new ActivatedRouteStub(undefined, data);

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
      ],
      providers: [
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService,
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: MatDialog,
          useClass: MockMatDialog,
        },
        {
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: DialogService,
          useValue: mockDialogService,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
        {
          provide: RoutingService,
          useValue: mockRoutingService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
