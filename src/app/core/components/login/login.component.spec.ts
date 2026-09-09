import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { ActivatedRouteStub } from '@testing/test-helpers';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, first, of } from 'rxjs';
import {
  ApiConfig,
  AuthenticationProvider,
  AuthenticationProviderRole,
  AuthenticationProviderType,
} from '@app/core/models/api-config';
import { AuthenticationStatus } from '@app/core/models/client-authentication-result';
import { NotificationService } from '@app/core/services/util/notification.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { RoutingService } from '@app/core/services/util/routing.service';

/**
 * Id of an additional username/password provider, e.g. an LDAP registration. The backend keys
 * those by UUID, unlike the legacy 'user-db' id of the local one.
 */
const LDAP_PROVIDER_ID = '9d1f8e4c-6a2b-4c8d-9f3e-1b7a5c2d4e60';

const LOCAL_PROVIDER: AuthenticationProvider = {
  id: 'user-db',
  title: 'arsnova',
  type: AuthenticationProviderType.USERNAME_PASSWORD,
  order: 0,
  allowedRoles: [
    AuthenticationProviderRole.MODERATOR,
    AuthenticationProviderRole.PARTICIPANT,
  ],
};

const LDAP_PROVIDER: AuthenticationProvider = {
  id: LDAP_PROVIDER_ID,
  title: 'LDAP',
  type: AuthenticationProviderType.USERNAME_PASSWORD,
  order: 0,
  allowedRoles: [
    AuthenticationProviderRole.MODERATOR,
    AuthenticationProviderRole.PARTICIPANT,
  ],
};

class MockAuthenticationService {
  private auth$$ = new BehaviorSubject<any>(undefined);

  readonly login = jasmine
    .createSpy('login')
    .and.returnValue(of({ status: AuthenticationStatus.SUCCESS }));

  getAuthenticatedUserChanges() {
    return this.auth$$.asObservable();
  }

  getCurrentAuthentication() {
    return this.auth$$.pipe(first());
  }

  isLoggedIn() {
    return false;
  }
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authenticationService: MockAuthenticationService;
  let loader: HarnessLoader;

  const router = jasmine.createSpyObj('Router', ['navigateByUrl']);
  const notificationService = jasmine.createSpyObj('NotificationService', [
    'showAdvanced',
  ]);
  const dialogService = jasmine.createSpyObj('DialogService', [
    'openUserActivationDialog',
  ]);
  const routingService = jasmine.createSpyObj('RoutingService', [
    'redirect',
    'setRedirect',
  ]);

  async function createComponent(
    authenticationProviders: AuthenticationProvider[]
  ) {
    const apiConfig: ApiConfig = {
      authenticationProviders,
      features: {},
      ui: {},
      readOnly: false,
    };

    await configureTestModule(
      [BrowserAnimationsModule, getTranslocoModule(), LoginComponent],
      [
        {
          provide: ActivatedRoute,
          // The component reads the config from route data, where ApiConfigResolver puts it.
          useValue: new ActivatedRouteStub(undefined, { apiConfig }),
        },
        {
          provide: AuthenticationService,
          useClass: MockAuthenticationService,
        },
        {
          provide: Router,
          useValue: router,
        },
        {
          provide: NotificationService,
          useValue: notificationService,
        },
        {
          provide: DialogService,
          useValue: dialogService,
        },
        // MatDialog is deliberately left alone: CoreModule pulls MatDialogModule into the
        // component's standalone injector, so the component gets a real MatDialog no matter what
        // is provided here, and that instance picks up whatever this injector holds as its
        // skipSelf parent. A stub without MatDialog's internal state breaks its closeAll().
        {
          provide: RoutingService,
          useValue: routingService,
        },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authenticationService = TestBed.inject(
      AuthenticationService
    ) as unknown as MockAuthenticationService;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  }

  /**
   * Fills in credentials on the component rather than through the input harnesses: the subject of
   * these tests is which provider the submit buttons select, not the form bindings.
   */
  function enterCredentials(loginId: string, password: string) {
    component.username = loginId;
    component.loginIdFormControl.setValue(loginId);
    component.passwordEntry.password = password;
  }

  function getSubmitButtons(): Promise<MatButtonHarness[]> {
    return loader.getAllHarnesses(
      MatButtonHarness.with({ selector: 'app-loading-button button' })
    );
  }

  beforeEach(() => {
    router.navigateByUrl.calls.reset();
    notificationService.showAdvanced.calls.reset();
    routingService.redirect.and.returnValue(false);
  });

  it('should create', async () => {
    await createComponent([LOCAL_PROVIDER]);
    expect(component).toBeTruthy();
  });

  describe('with the local provider only', () => {
    beforeEach(async () => {
      await createComponent([LOCAL_PROVIDER]);
    });

    it('should label the login id field as an e-mail address', async () => {
      expect(
        await loader.getAllHarnesses(
          MatFormFieldHarness.with({ floatingLabelText: 'login.email' })
        )
      ).toHaveSize(1);
      expect(
        await loader.getAllHarnesses(
          MatFormFieldHarness.with({ floatingLabelText: 'login.username' })
        )
      ).toHaveSize(0);
    });

    it('should render a single unqualified submit button', async () => {
      const buttons = await getSubmitButtons();
      expect(buttons).toHaveSize(1);
      expect(await buttons[0].getText()).toBe('login.login');
    });

    it('should log in without a provider id of its own', async () => {
      enterCredentials('user@example.com', 'secret');
      const buttons = await getSubmitButtons();
      await buttons[0].click();
      expect(authenticationService.login).toHaveBeenCalledWith(
        'user@example.com',
        'secret',
        'user-db'
      );
    });
  });

  describe('with an additional username/password provider', () => {
    beforeEach(async () => {
      await createComponent([LOCAL_PROVIDER, LDAP_PROVIDER]);
    });

    it('should label the login id field as a user id', async () => {
      expect(
        await loader.getAllHarnesses(
          MatFormFieldHarness.with({ floatingLabelText: 'login.username' })
        )
      ).toHaveSize(1);
      expect(
        await loader.getAllHarnesses(
          MatFormFieldHarness.with({ floatingLabelText: 'login.email' })
        )
      ).toHaveSize(0);
    });

    it('should accept a login id which is not an e-mail address', () => {
      component.loginIdFormControl.setValue('ldap-user');
      expect(component.loginIdFormControl.valid).toBeTrue();
      component.loginIdFormControl.setValue('');
      expect(component.loginIdFormControl.valid).toBeFalse();
    });

    it('should render one submit button per provider', async () => {
      const buttons = await getSubmitButtons();
      expect(buttons).toHaveSize(2);
      expect(await buttons[0].getText()).toMatch(
        /^login\.login-with\s+arsnova$/
      );
      expect(await buttons[1].getText()).toMatch(/^login\.login-with\s+LDAP$/);
    });

    it('should log in with the id of the selected provider', async () => {
      enterCredentials('ldap-user', 'secret');
      const buttons = await getSubmitButtons();
      await buttons[1].click();
      expect(authenticationService.login).toHaveBeenCalledWith(
        'ldap-user',
        'secret',
        LDAP_PROVIDER_ID
      );
    });
  });
});
