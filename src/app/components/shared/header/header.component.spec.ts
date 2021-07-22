import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { AuthenticationService } from '@arsnova/app/services/http/authentication.service';
import {
  ActivatedRouteStub,
  JsonTranslationLoader,
  MockEventService,
  MockGlobalStorageService,
  MockLangService,
  MockRenderer2,
  MockRouter,
  MockThemeService
} from '@arsnova/testing/test-helpers';
import { AdvancedSnackBarTypes, NotificationService } from '@arsnova/app/services/util/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '@arsnova/app/services/util/event.service';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '@arsnova/app/services/util/language.service';
import { UserService } from '@arsnova/app/services/http/user.service';
import { DialogService } from '@arsnova/app/services/util/dialog.service';
import { Renderer2 } from '@angular/core';
import { ThemeService } from '@arsnova/theme/theme.service';
import { RoutingService } from '@arsnova/app/services/util/routing.service';
import { ConsentService } from '@arsnova/app/services/util/consent.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatMenuHarness, MatMenuItemHarness } from '@angular/material/menu/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { ClientAuthentication } from '@arsnova/app/models/client-authentication';
import { AuthProvider } from '@arsnova/app/models/auth-provider';
import { MatSelectModule } from '@angular/material/select';
import { BehaviorSubject } from 'rxjs';

export class MockAuthenticationService {
  private auth$$ = new BehaviorSubject<any>({});

  getAuthenticationChanges() {
    return this.auth$$.asObservable();
  }

  hasAdminRole(){
  }

  logout() {
  }
}

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  const activatedRoute = new ActivatedRouteStub(null, { apiConfig: { ui: { demo: '27273589' } } });
  let notificationService = jasmine.createSpyObj('NotificationService', ['showAdvanced']);

  let routerSpy = jasmine.createSpyObj('MockRouter', ['navigate', 'navigateByUrl']);
  let userService = jasmine.createSpyObj('UserService', ['delete']);
  let dialogService = jasmine.createSpyObj('DialogService', ['openUpdateInfoDialog', 'openDeleteDialog']);
  const routingService = jasmine.createSpyObj('RoutingService', ['goBack']);
  const consentService = jasmine.createSpyObj('ConsentService', ['openDialog']);
  let loader: HarnessLoader;
  let userButton: MatButtonHarness;
  let loginButton: MatButtonHarness;
  let userMenu: MatMenuHarness;
  let userMenuItems: MatMenuItemHarness[];

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [ HeaderComponent ],
      imports: [
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatMenuModule,
        MatSelectModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader
          },
          isolate: true
        })
      ],
      providers: [
        {
          provide: Router,
          useClass: MockRouter
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService
        },
        {
          provide: LanguageService,
          useClass: MockLangService
        },
        {
          provide: Renderer2,
          useClass: MockRenderer2
        },
        {
          provide: EventService,
          useClass: MockEventService
        },
        {
          provide: ThemeService,
          useClass: MockThemeService
        },
        {
          provide: AuthenticationService,
          useClass: MockAuthenticationService
        },
        {
          provide: NotificationService,
          useValue: notificationService
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRoute
        },
        {
          provide: UserService,
          useValue: userService
        },
        {
          provide: DialogService,
          useValue: dialogService
        },
        {
          provide: RoutingService,
          useValue: routingService
        },
        {
          provide: ConsentService,
          useValue: consentService
        }
      ]
    })
    .compileComponents();
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
    component.auth = new ClientAuthentication('1234', 'a@b.cd', AuthProvider.ARSNOVA, 'token');
    userButton = await loader.getHarness(MatButtonHarness.with({selector: '#menu-button'}));
    expect(userButton).not.toBeNull();
  });

  it('should display user menu if user button has been clicked', async () => {
    component.auth = new ClientAuthentication('1234', 'a@b.cd', AuthProvider.ARSNOVA, 'token');
    userButton = await loader.getHarness(MatButtonHarness.with({selector: '#menu-button'}));
    await userButton.click();
    userMenu = await loader.getHarness(MatMenuHarness);
    const isOpen = await userMenu.isOpen();
    expect(isOpen).toBe(true, 'UserMenu should be open after click');
  });

  // ## Logged in with E-Mail

  it('should display user menu with 5 items: AuthProvider: ARSNOVA, isAdmin: false, deviceWidth: 1001, ' +
    'missing helpUrl', async () => {
    component.auth = new ClientAuthentication('1234', 'a@b.cd', AuthProvider.ARSNOVA, 'token');
    component.isAdmin = false;
    component.deviceWidth = 1001;
    userButton = await loader.getHarness(MatButtonHarness.with({selector: '#menu-button'}));
    await userButton.click();
    userMenu = await loader.getHarness(MatMenuHarness);
    userMenuItems = await userMenu.getItems();
    const myRooms = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#my-rooms-button'}));
    expect(myRooms).not.toBeUndefined('Header should contain item "My Rooms"');
    const theme = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#theme-menu'}));
    expect(theme).not.toBeUndefined('Header should contain item "Theme"');
    const language = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#language-menu'}));
    expect(language).not.toBeUndefined('Header should contain item "Language"');
    const deleteAccount = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#delete-account-button'}));
    expect(deleteAccount).not.toBeUndefined('Header should contain item "Delete account"');
    const logout = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#logout-button'}));
    expect(logout).not.toBeUndefined('Header should contain item "Logout"');
  });

  it('should display user menu with 6 items: AuthProvider: ARSNOVA, isAdmin: false, deviceWidth: 1001', async () => {
    component.auth = new ClientAuthentication('1234', 'a@b.cd', AuthProvider.ARSNOVA, 'token');
    component.isAdmin = false;
    component.deviceWidth = 1001;
    component.helpUrl = 'help';
    userButton = await loader.getHarness(MatButtonHarness.with({selector: '#menu-button'}));
    await userButton.click();
    userMenu = await loader.getHarness(MatMenuHarness);
    userMenuItems = await userMenu.getItems();
    const myRooms = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#my-rooms-button'}));
    expect(myRooms).not.toBeUndefined('Header should contain item "My Rooms"');
    const help = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#help-button'}));
    expect(help).not.toBeUndefined('Header should contain item "Help"');
    const theme = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#theme-menu'}));
    expect(theme).not.toBeUndefined('Header should contain item "Theme"');
    const language = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#language-menu'}));
    expect(language).not.toBeUndefined('Header should contain item "Language"');
    const deleteAccount = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#delete-account-button'}));
    expect(deleteAccount).not.toBeUndefined('Header should contain item "Delete account"');
    const logout = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#logout-button'}));
    expect(logout).not.toBeUndefined('Header should contain item "Logout"');
  });

  it('should display user menu with 7 items: AuthProvider: ARSNOVA, isAdmin: true, deviceWidth: 1001', async () => {
    component.auth = new ClientAuthentication('1234', 'a@b.cd', AuthProvider.ARSNOVA, 'token');
    component.isAdmin = true;
    component.deviceWidth = 1001;
    component.helpUrl = 'help';
    userButton = await loader.getHarness(MatButtonHarness.with({selector: '#menu-button'}));
    await userButton.click();
    userMenu = await loader.getHarness(MatMenuHarness);
    userMenuItems = await userMenu.getItems();
    const myRooms = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#my-rooms-button'}));
    expect(myRooms).not.toBeUndefined('Header should contain item "My Rooms"');
    const help = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#help-button'}));
    expect(help).not.toBeUndefined('Header should contain item "Help"');
    const theme = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#theme-menu'}));
    expect(theme).not.toBeUndefined('Header should contain item "Theme"');
    const language = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#language-menu'}));
    expect(language).not.toBeUndefined('Header should contain item "Language"');
    const admin = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#admin-button'}));
    expect(admin).not.toBeUndefined('Header should contain item "Administration"');
    const deleteAccount = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#delete-account-button'}));
    expect(deleteAccount).not.toBeUndefined('Header should contain item "Delete account"');
    const logout = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#logout-button'}));
    expect(logout).not.toBeUndefined('Header should contain item "Logout"');
  });

  it('should display user menu with 9 items: AuthProvider: ARSNOVA, isAdmin: true, deviceWidth: 420', async () => {
    component.auth = new ClientAuthentication('1234', 'a@b.cd', AuthProvider.ARSNOVA, 'token');
    component.isAdmin = true;
    component.deviceWidth = 420;
    component.helpUrl = 'help';
    component.privacyUrl = 'privacy';
    component.imprintUrl = 'imprint';
    userButton = await loader.getHarness(MatButtonHarness.with({selector: '#menu-button'}));
    await userButton.click();
    userMenu = await loader.getHarness(MatMenuHarness);
    userMenuItems = await userMenu.getItems();
    const myRooms = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#my-rooms-button'}));
    expect(myRooms).not.toBeUndefined('Header should contain item "My Rooms"');
    const help = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#help-button'}));
    expect(help).not.toBeUndefined('Header should contain item "Help"');
    const privacy = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#privacy-button'}));
    expect(privacy).not.toBeUndefined('Header should contain item "Privacy"');
    const imprint = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#imprint-button'}));
    expect(imprint).not.toBeUndefined('Header should contain item "Imprint"');
    const theme = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#theme-menu'}));
    expect(theme).not.toBeUndefined('Header should contain item "Theme"');
    const language = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#language-menu'}));
    expect(language).not.toBeUndefined('Header should contain item "Language"');
    const admin = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#admin-button'}));
    expect(admin).not.toBeUndefined('Header should contain item "Administration"');
    const deleteAccount = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#delete-account-button'}));
    expect(deleteAccount).not.toBeUndefined('Header should contain item "Delete account"');
    const logout = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#logout-button'}));
    expect(logout).not.toBeUndefined('Header should contain item "Logout"');
  });

  it('should display user menu with 8 items: AuthProvider: ARSNOVA, isAdmin: false, deviceWidth: 420', async () => {
    component.auth = new ClientAuthentication('1234', 'a@b.cd', AuthProvider.ARSNOVA, 'token');
    component.isAdmin = false;
    component.deviceWidth = 420;
    component.helpUrl = 'help';
    component.privacyUrl = 'privacy';
    component.imprintUrl = 'imprint';
    userButton = await loader.getHarness(MatButtonHarness.with({selector: '#menu-button'}));
    await userButton.click();
    userMenu = await loader.getHarness(MatMenuHarness);
    userMenuItems = await userMenu.getItems();
    const myRooms = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#my-rooms-button'}));
    expect(myRooms).not.toBeUndefined('Header should contain item "My Rooms"');
    const help = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#help-button'}));
    expect(help).not.toBeUndefined('Header should contain item "Help"');
    const privacy = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#privacy-button'}));
    expect(privacy).not.toBeUndefined('Header should contain item "Privacy"');
    const imprint = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#imprint-button'}));
    expect(imprint).not.toBeUndefined('Header should contain item "Imprint"');
    const theme = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#theme-menu'}));
    expect(theme).not.toBeUndefined('Header should contain item "Theme"');
    const language = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#language-menu'}));
    expect(language).not.toBeUndefined('Header should contain item "Language"');
    const deleteAccount = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#delete-account-button'}));
    expect(deleteAccount).not.toBeUndefined('Header should contain item "Delete account"');
    const logout = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#logout-button'}));
    expect(logout).not.toBeUndefined('Header should contain item "Logout"');
  });

  // ## Logged in as guest

  it('should display user menu with 4 items: ARSNOVA_GUEST, isGuest: true, deviceWidth: 1001,'  +
    'missing helpUrl', async () => {
    component.auth = new ClientAuthentication('1234', 'guest', AuthProvider.ARSNOVA_GUEST, 'token');
    component.isGuest = true;
    component.deviceWidth = 1001;
    userButton = await loader.getHarness(MatButtonHarness.with({selector: '#menu-button'}));
    await userButton.click();
    userMenu = await loader.getHarness(MatMenuHarness);
    userMenuItems = await userMenu.getItems();
    const myRooms = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#my-rooms-button'}));
    expect(myRooms).not.toBeUndefined('Header should contain item "My Rooms"');
    const login = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#menu-login-button'}));
    expect(login).not.toBeUndefined('Header should contain item "Login"');
    const theme = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#theme-menu'}));
    expect(theme).not.toBeUndefined('Header should contain item "Theme"');
    const language = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#language-menu'}));
    expect(language).not.toBeUndefined('Header should contain item "Language"');
  });

  it('should display user menu with 5 items: AuthProvider: ARSNOVA_GUEST, isGuest: true, deviceWidth: 1001', async () => {
    component.auth = new ClientAuthentication('1234', 'guest', AuthProvider.ARSNOVA_GUEST, 'token');
    component.isGuest = true;
    component.deviceWidth = 1001;
    component.helpUrl = 'help';
    userButton = await loader.getHarness(MatButtonHarness.with({selector: '#menu-button'}));
    await userButton.click();
    userMenu = await loader.getHarness(MatMenuHarness);
    userMenuItems = await userMenu.getItems();
    const myRooms = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#my-rooms-button'}));
    expect(myRooms).not.toBeUndefined('Header should contain item "My Rooms"');
    const login = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#menu-login-button'}));
    expect(login).not.toBeUndefined('Header should contain item "Login"');
    const help = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#help-button'}));
    expect(help).not.toBeUndefined('Header should contain item "Help"');
    const theme = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#theme-menu'}));
    expect(theme).not.toBeUndefined('Header should contain item "Theme"');
    const language = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#language-menu'}));
    expect(language).not.toBeUndefined('Header should contain item "Language"');
  });

  it('should display user menu with 7 items: AuthProvider: ARSNOVA_GUEST, isGuest: true, deviceWidth: 420', async () => {
    component.auth = new ClientAuthentication('1234', 'guest', AuthProvider.ARSNOVA_GUEST, 'token');
    component.isGuest = true;
    component.deviceWidth = 420;
    component.helpUrl = 'help';
    component.privacyUrl = 'privacy';
    component.imprintUrl = 'imprint';
    userButton = await loader.getHarness(MatButtonHarness.with({selector: '#menu-button'}));
    await userButton.click();
    userMenu = await loader.getHarness(MatMenuHarness);
    userMenuItems = await userMenu.getItems();
    const myRooms = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#my-rooms-button'}));
    expect(myRooms).not.toBeUndefined('Header should contain item "My Rooms"');
    const login = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#menu-login-button'}));
    expect(login).not.toBeUndefined('Header should contain item "Login"');
    const help = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#help-button'}));
    expect(help).not.toBeUndefined('Header should contain item "Help"');
    const privacy = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#privacy-button'}));
    expect(privacy).not.toBeUndefined('Header should contain item "Privacy"');
    const imprint = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#imprint-button'}));
    expect(imprint).not.toBeUndefined('Header should contain item "Imprint"');
    const theme = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#theme-menu'}));
    expect(theme).not.toBeUndefined('Header should contain item "Theme"');
    const language = await userMenu.getHarness(MatMenuItemHarness.with({selector: '#language-menu'}));
    expect(language).not.toBeUndefined('Header should contain item "Language"');
  });

  // ## Navigate to user overview

  it('should navigate to user overview', async () => {
    component.auth = new ClientAuthentication('1234', 'a@b.cd', AuthProvider.ARSNOVA, 'token');
    userButton = await loader.getHarness(MatButtonHarness.with({selector: '#menu-button'}));
    await userButton.click();
    userMenu = await loader.getHarness(MatMenuHarness);
    userMenuItems = await userMenu.getItems({selector: '#my-rooms-button'});
    await userMenuItems[0].click();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['user']);
  });

  // ## Logout

  it('should navigate to home and display "Logged out" notification', async () => {
    component.auth = new ClientAuthentication('1234', 'a@b.cd', AuthProvider.ARSNOVA, 'token');
    userButton = await loader.getHarness(MatButtonHarness.with({selector: '#menu-button'}));
    await userButton.click();
    userMenu = await loader.getHarness(MatMenuHarness);
    userMenuItems = await userMenu.getItems({selector: '#logout-button'});
    await userMenuItems[0].click();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('home');
    expect(notificationService.showAdvanced).toHaveBeenCalledWith(jasmine.any(String), AdvancedSnackBarTypes.SUCCESS);
  });

  // # If not logged in

  it('should display login button if not logged in', async () => {
    component.auth = null;
    loginButton = await loader.getHarness(MatButtonHarness.with({selector: '#login-button'}));
    expect(loginButton).not.toBeNull();
  });

  it('should navigate to login route after when clicking login button', async () => {
    component.auth = null;
    loginButton = await loader.getHarness(MatButtonHarness.with({selector: '#login-button'}));
    await loginButton.click();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('login');
  });
});

