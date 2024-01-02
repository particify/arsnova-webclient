import { getTranslocoModule } from '@testing/transloco-testing.module';
import {
  TestBed,
  ComponentFixture,
  waitForAsync,
  fakeAsync,
} from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { TrackingService } from '@app/core/services/util/tracking.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConsentService } from '@app/core/services/util/consent.service';
import { UpdateService } from '@app/core/services/util/update.service';
import { UpdateImportance } from '@app/core/models/version-info';
import { LanguageService } from '@app/core/services/util/language.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import {
  MockFeatureFlagService,
  MockNotificationService,
  MockThemeService,
} from '@testing/test-helpers';
import { Room } from '@app/core/models/room';
import { RoomService } from '@app/core/services/http/room.service';
import { AuthProvider } from './core/models/auth-provider';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { ThemeService } from '@app/core/theme/theme.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';
import { MatMenuModule } from '@angular/material/menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Stub for downstream template
@Component({ selector: 'app-header', template: '' })
class HeaderStubComponent {}

// Stub for downstream template
@Component({ selector: 'app-footer', template: '' })
class FooterStubComponent {}

describe('AppComponent', () => {
  let appComponent: AppComponent;
  // let's you access the debug elements to gain control over injected services etc.
  let fixture: ComponentFixture<AppComponent>;

  const updateService = jasmine.createSpyObj('UpdateService', ['handleUpdate']);
  const trackingService = jasmine.createSpyObj('TrackingService', ['init']);
  const testApiConfig = {
    ui: {
      tracking: {
        url: 'mock-tracker',
        provider: 'matomo',
      },
      versions: [
        {
          id: 100001,
          commitHash: '1111111111111111111111111111111111111111',
          importance: UpdateImportance.RECOMMENDED,
          changes: {
            en: ['a change entry'],
          },
        },
        {
          id: 100000,
          commitHash: '0000000000000000000000000000000000000000',
          importance: UpdateImportance.RECOMMENDED,
          changes: {
            en: ['a change entry'],
          },
        },
      ],
    },
    authenticationProvider: [] as AuthProvider[],
    features: {},
  };
  const apiConfigService = jasmine.createSpyObj('ApiConfigService', [
    'getApiConfig$',
  ]);
  apiConfigService.getApiConfig$.and.returnValue(of(testApiConfig));
  const consentService = jasmine.createSpyObj('ConsentService', [
    'setConfig',
    'consentRequired',
    'openDialog',
  ]);
  consentService.consentRequired.and.returnValue(true);
  const routingService = jasmine.createSpyObj('RoutingService', [
    'subscribeActivatedRoute',
  ]);
  const languageService = jasmine.createSpyObj('LanguageService', [
    'init',
    'getLangs',
    'setLang',
  ]);
  languageService.getLangs.and.returnValue([]);

  const roomService = jasmine.createSpyObj('RoomService', [
    'getCurrentRoomStream',
  ]);
  roomService.getCurrentRoomStream.and.returnValue(of(new Room()));

  const authenticationService = jasmine.createSpyObj('AuthenticationService', [
    'getAuthenticationChanges',
  ]);
  authenticationService.getAuthenticationChanges.and.returnValue(
    of({ loginId: 'test@test.de' })
  );

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent, HeaderStubComponent, FooterStubComponent],
      providers: [
        {
          provide: ApiConfigService,
          useValue: apiConfigService,
        },
        {
          provide: TrackingService,
          useValue: trackingService,
        },
        {
          provide: ConsentService,
          useValue: consentService,
        },
        {
          provide: UpdateService,
          useValue: updateService,
        },
        {
          provide: RoutingService,
          useValue: routingService,
        },
        {
          provide: LanguageService,
          useValue: languageService,
        },
        {
          provide: RoomService,
          useValue: roomService,
        },
        {
          provide: AuthenticationService,
          useValue: authenticationService,
        },
        {
          provide: ThemeService,
          useClass: MockThemeService,
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
        {
          provide: FeatureFlagService,
          useClass: MockFeatureFlagService,
        },
      ],
      imports: [
        getTranslocoModule(),
        RouterTestingModule,
        HttpClientTestingModule,
        BrowserAnimationsModule,
        MatMenuModule,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(AppComponent);
    appComponent = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create the app', () => {
    fixture.detectChanges();
    expect(appComponent).toBeTruthy();
  });

  it('should have a title', () => {
    fixture.detectChanges();
    expect(appComponent.title).toEqual('ARSnova');
  });

  it('should call the API config', fakeAsync(() => {
    fixture.detectChanges();
    expect(apiConfigService.getApiConfig$).toHaveBeenCalled();
  }));

  it('should call the tracking service init on getting a tracking config', () => {
    fixture.detectChanges();
    expect(trackingService.init).toHaveBeenCalled();
  });

  it('should call the update service to handle update', () => {
    fixture.detectChanges();
    expect(updateService.handleUpdate).toHaveBeenCalled();
  });

  it('should call the consent service to set settings', () => {
    fixture.detectChanges();
    expect(consentService.setConfig).toHaveBeenCalled();
  });

  it('default lang should has been set after init', () => {
    fixture.detectChanges();
    expect(languageService.init).toHaveBeenCalled();
  });

  it('should call the routing service to start route subscription', () => {
    fixture.detectChanges();
    expect(routingService.subscribeActivatedRoute).toHaveBeenCalled();
  });

  // // # If logged in

  // it('should display user menu button if logged in', async () => {
  //   component.auth = new ClientAuthentication(
  //     '1234',
  //     'a@b.cd',
  //     AuthProvider.ARSNOVA,
  //     'token'
  //   );
  //   userButton = await loader.getHarness(
  //     MatButtonHarness.with({ selector: '#menu-button' })
  //   );
  //   expect(userButton).not.toBeNull();
  // });

  // it('should display user menu if user button has been clicked', async () => {
  //   component.auth = new ClientAuthentication(
  //     '1234',
  //     'a@b.cd',
  //     AuthProvider.ARSNOVA,
  //     'token'
  //   );
  //   userButton = await loader.getHarness(
  //     MatButtonHarness.with({ selector: '#menu-button' })
  //   );
  //   await userButton.click();
  //   userMenu = await loader.getHarness(
  //     MatMenuHarness.with({ selector: '#menu-button' })
  //   );
  //   const isOpen = await userMenu.isOpen();
  //   expect(isOpen).toBe(true, 'UserMenu should be open after click');
  // });

  // // ## Logged in with E-Mail

  // it(
  //   'should display user menu with 5 items: AuthProvider: ARSNOVA, isAdmin: false, deviceWidth: 1001, ' +
  //     'missing helpUrl',
  //   async () => {
  //     component.auth = new ClientAuthentication(
  //       '1234',
  //       'a@b.cd',
  //       AuthProvider.ARSNOVA,
  //       'token'
  //     );
  //     component.deviceWidth = 1001;
  //     userButton = await loader.getHarness(
  //       MatButtonHarness.with({ selector: '#menu-button' })
  //     );
  //     await userButton.click();
  //     userMenu = await loader.getHarness(
  //       MatMenuHarness.with({ selector: '#menu-button' })
  //     );
  //     userMenuItems = await userMenu.getItems();
  //     const myRooms = await userMenu.getHarness(
  //       MatMenuItemHarness.with({ selector: '#my-rooms-button' })
  //     );
  //     expect(myRooms).not.toBeUndefined(
  //       'Header should contain item "My Rooms"'
  //     );
  //     const theme = await userMenu.getHarness(
  //       MatMenuItemHarness.with({ selector: '#theme-switcher' })
  //     );
  //     expect(theme).not.toBeUndefined(
  //       'Header should contain item "Dark mode"/"Light mode"'
  //     );
  //     const language = await userMenu.getHarness(
  //       MatMenuItemHarness.with({ selector: '#language-menu' })
  //     );
  //     expect(language).not.toBeUndefined(
  //       'Header should contain item "Language"'
  //     );
  //     const myAccount = await userMenu.getHarness(
  //       MatMenuItemHarness.with({ selector: '#user-profile-button' })
  //     );
  //     expect(myAccount).not.toBeUndefined(
  //       'Header should contain item "My account"'
  //     );
  //     const logout = await userMenu.getHarness(
  //       MatMenuItemHarness.with({ selector: '#logout-button' })
  //     );
  //     expect(logout).not.toBeUndefined('Header should contain item "Logout"');
  //   }
  // );

  // it('should display user menu with 6 items: AuthProvider: ARSNOVA, isAdmin: false, deviceWidth: 1001', async () => {
  //   component.auth = new ClientAuthentication(
  //     '1234',
  //     'a@b.cd',
  //     AuthProvider.ARSNOVA,
  //     'token'
  //   );
  //   component.deviceWidth = 1001;
  //   component.helpUrl = 'help';
  //   userButton = await loader.getHarness(
  //     MatButtonHarness.with({ selector: '#menu-button' })
  //   );
  //   await userButton.click();
  //   userMenu = await loader.getHarness(
  //     MatMenuHarness.with({ selector: '#menu-button' })
  //   );
  //   userMenuItems = await userMenu.getItems();
  //   const myRooms = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#my-rooms-button' })
  //   );
  //   expect(myRooms).not.toBeUndefined('Header should contain item "My Rooms"');
  //   const help = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#help-button' })
  //   );
  //   expect(help).not.toBeUndefined('Header should contain item "Help"');
  //   const theme = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#theme-switcher' })
  //   );
  //   expect(theme).not.toBeUndefined(
  //     'Header should contain item "Dark mode"/"Light mode"'
  //   );
  //   const language = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#language-menu' })
  //   );
  //   expect(language).not.toBeUndefined('Header should contain item "Language"');
  //   const myAccount = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#user-profile-button' })
  //   );
  //   expect(myAccount).not.toBeUndefined(
  //     'Header should contain item "My account"'
  //   );
  //   const logout = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#logout-button' })
  //   );
  //   expect(logout).not.toBeUndefined('Header should contain item "Logout"');
  // });

  // it('should display user menu with 7 items: AuthProvider: ARSNOVA, isAdmin: true, deviceWidth: 1001', async () => {
  //   component.auth = new ClientAuthentication(
  //     '1234',
  //     'a@b.cd',
  //     AuthProvider.ARSNOVA,
  //     'ADMIN_TOKEN'
  //   );
  //   component.deviceWidth = 1001;
  //   component.helpUrl = 'help';
  //   userButton = await loader.getHarness(
  //     MatButtonHarness.with({ selector: '#menu-button' })
  //   );
  //   await userButton.click();
  //   userMenu = await loader.getHarness(
  //     MatMenuHarness.with({ selector: '#menu-button' })
  //   );
  //   userMenuItems = await userMenu.getItems();
  //   const myRooms = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#my-rooms-button' })
  //   );
  //   expect(myRooms).not.toBeUndefined('Header should contain item "My Rooms"');
  //   const help = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#help-button' })
  //   );
  //   expect(help).not.toBeUndefined('Header should contain item "Help"');
  //   const theme = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#theme-switcher' })
  //   );
  //   expect(theme).not.toBeUndefined(
  //     'Header should contain item "Dark mode"/"Light mode"'
  //   );
  //   const language = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#language-menu' })
  //   );
  //   expect(language).not.toBeUndefined('Header should contain item "Language"');
  //   const admin = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#admin-button' })
  //   );
  //   expect(admin).not.toBeUndefined(
  //     'Header should contain item "Administration"'
  //   );
  //   const myAccount = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#user-profile-button' })
  //   );
  //   expect(myAccount).not.toBeUndefined(
  //     'Header should contain item "My account"'
  //   );
  //   const logout = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#logout-button' })
  //   );
  //   expect(logout).not.toBeUndefined('Header should contain item "Logout"');
  // });

  // it('should display user menu with 9 items: AuthProvider: ARSNOVA, isAdmin: true, deviceWidth: 420', async () => {
  //   component.auth = new ClientAuthentication(
  //     '1234',
  //     'a@b.cd',
  //     AuthProvider.ARSNOVA,
  //     'ADMIN_TOKEN'
  //   );
  //   component.deviceWidth = 420;
  //   component.helpUrl = 'help';
  //   component.privacyUrl = 'privacy';
  //   component.imprintUrl = 'imprint';
  //   userButton = await loader.getHarness(
  //     MatButtonHarness.with({ selector: '#menu-button' })
  //   );
  //   await userButton.click();
  //   userMenu = await loader.getHarness(
  //     MatMenuHarness.with({ selector: '#menu-button' })
  //   );
  //   userMenuItems = await userMenu.getItems();
  //   const myRooms = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#my-rooms-button' })
  //   );
  //   expect(myRooms).not.toBeUndefined('Header should contain item "My Rooms"');
  //   const help = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#help-button' })
  //   );
  //   expect(help).not.toBeUndefined('Header should contain item "Help"');
  //   const privacy = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#privacy-button' })
  //   );
  //   expect(privacy).not.toBeUndefined('Header should contain item "Privacy"');
  //   const imprint = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#imprint-button' })
  //   );
  //   expect(imprint).not.toBeUndefined('Header should contain item "Imprint"');
  //   const theme = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#theme-switcher' })
  //   );
  //   expect(theme).not.toBeUndefined(
  //     'Header should contain item "Dark mode"/"Light mode"'
  //   );
  //   const language = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#language-menu' })
  //   );
  //   expect(language).not.toBeUndefined('Header should contain item "Language"');
  //   const admin = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#admin-button' })
  //   );
  //   expect(admin).not.toBeUndefined(
  //     'Header should contain item "Administration"'
  //   );
  //   const myAccount = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#user-profile-button' })
  //   );
  //   expect(myAccount).not.toBeUndefined(
  //     'Header should contain item "My account"'
  //   );
  //   const logout = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#logout-button' })
  //   );
  //   expect(logout).not.toBeUndefined('Header should contain item "Logout"');
  // });

  // it('should display user menu with 8 items: AuthProvider: ARSNOVA, isAdmin: false, deviceWidth: 420', async () => {
  //   component.auth = new ClientAuthentication(
  //     '1234',
  //     'a@b.cd',
  //     AuthProvider.ARSNOVA,
  //     'token'
  //   );
  //   component.deviceWidth = 420;
  //   component.helpUrl = 'help';
  //   component.privacyUrl = 'privacy';
  //   component.imprintUrl = 'imprint';
  //   userButton = await loader.getHarness(
  //     MatButtonHarness.with({ selector: '#menu-button' })
  //   );
  //   await userButton.click();
  //   userMenu = await loader.getHarness(
  //     MatMenuHarness.with({ selector: '#menu-button' })
  //   );
  //   userMenuItems = await userMenu.getItems();
  //   const myRooms = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#my-rooms-button' })
  //   );
  //   expect(myRooms).not.toBeUndefined('Header should contain item "My Rooms"');
  //   const help = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#help-button' })
  //   );
  //   expect(help).not.toBeUndefined('Header should contain item "Help"');
  //   const privacy = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#privacy-button' })
  //   );
  //   expect(privacy).not.toBeUndefined('Header should contain item "Privacy"');
  //   const imprint = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#imprint-button' })
  //   );
  //   expect(imprint).not.toBeUndefined('Header should contain item "Imprint"');
  //   const theme = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#theme-switcher' })
  //   );
  //   expect(theme).not.toBeUndefined(
  //     'Header should contain item "Dark mode"/"Light mode"'
  //   );
  //   const language = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#language-menu' })
  //   );
  //   expect(language).not.toBeUndefined('Header should contain item "Language"');
  //   const myAccount = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#user-profile-button' })
  //   );
  //   expect(myAccount).not.toBeUndefined(
  //     'Header should contain item "My account"'
  //   );
  //   const logout = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#logout-button' })
  //   );
  //   expect(logout).not.toBeUndefined('Header should contain item "Logout"');
  // });

  // // ## Logged in as guest

  // it(
  //   'should display user menu with 4 items: ARSNOVA_GUEST, isGuest: true, deviceWidth: 1001,' +
  //     'missing helpUrl',
  //   async () => {
  //     component.auth = new ClientAuthentication(
  //       '1234',
  //       'guest',
  //       AuthProvider.ARSNOVA_GUEST,
  //       'token'
  //     );
  //     component.deviceWidth = 1001;
  //     userButton = await loader.getHarness(
  //       MatButtonHarness.with({ selector: '#menu-button' })
  //     );
  //     await userButton.click();
  //     userMenu = await loader.getHarness(
  //       MatMenuHarness.with({ selector: '#menu-button' })
  //     );
  //     userMenuItems = await userMenu.getItems();
  //     const myRooms = await userMenu.getHarness(
  //       MatMenuItemHarness.with({ selector: '#my-rooms-button' })
  //     );
  //     expect(myRooms).not.toBeUndefined(
  //       'Header should contain item "My Rooms"'
  //     );
  //     const login = await userMenu.getHarness(
  //       MatMenuItemHarness.with({ selector: '#login-button' })
  //     );
  //     expect(login).not.toBeUndefined('Header should contain item "Login"');
  //     const theme = await userMenu.getHarness(
  //       MatMenuItemHarness.with({ selector: '#theme-switcher' })
  //     );
  //     expect(theme).not.toBeUndefined(
  //       'Header should contain item "Dark mode"/"Light mode"'
  //     );
  //     const language = await userMenu.getHarness(
  //       MatMenuItemHarness.with({ selector: '#language-menu' })
  //     );
  //     expect(language).not.toBeUndefined(
  //       'Header should contain item "Language"'
  //     );
  //   }
  // );

  // it('should display user menu with 5 items: AuthProvider: ARSNOVA_GUEST, isGuest: true, deviceWidth: 1001', async () => {
  //   component.auth = new ClientAuthentication(
  //     '1234',
  //     'guest',
  //     AuthProvider.ARSNOVA_GUEST,
  //     'token'
  //   );
  //   component.deviceWidth = 1001;
  //   component.helpUrl = 'help';
  //   userButton = await loader.getHarness(
  //     MatButtonHarness.with({ selector: '#menu-button' })
  //   );
  //   await userButton.click();
  //   userMenu = await loader.getHarness(
  //     MatMenuHarness.with({ selector: '#menu-button' })
  //   );
  //   userMenuItems = await userMenu.getItems();
  //   const myRooms = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#my-rooms-button' })
  //   );
  //   expect(myRooms).not.toBeUndefined('Header should contain item "My Rooms"');
  //   const login = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#login-button' })
  //   );
  //   expect(login).not.toBeUndefined('Header should contain item "Login"');
  //   const help = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#help-button' })
  //   );
  //   expect(help).not.toBeUndefined('Header should contain item "Help"');
  //   const theme = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#theme-switcher' })
  //   );
  //   expect(theme).not.toBeUndefined(
  //     'Header should contain item "Dark mode"/"Light mode"'
  //   );
  //   const language = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#language-menu' })
  //   );
  //   expect(language).not.toBeUndefined('Header should contain item "Language"');
  // });

  // it('should display user menu with 7 items: AuthProvider: ARSNOVA_GUEST, isGuest: true, deviceWidth: 420', async () => {
  //   component.auth = new ClientAuthentication(
  //     '1234',
  //     'guest',
  //     AuthProvider.ARSNOVA_GUEST,
  //     'token'
  //   );
  //   component.deviceWidth = 420;
  //   component.helpUrl = 'help';
  //   component.privacyUrl = 'privacy';
  //   component.imprintUrl = 'imprint';
  //   userButton = await loader.getHarness(
  //     MatButtonHarness.with({ selector: '#menu-button' })
  //   );
  //   await userButton.click();
  //   userMenu = await loader.getHarness(
  //     MatMenuHarness.with({ selector: '#menu-button' })
  //   );
  //   userMenuItems = await userMenu.getItems();
  //   const myRooms = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#my-rooms-button' })
  //   );
  //   expect(myRooms).not.toBeUndefined('Header should contain item "My Rooms"');
  //   const login = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#login-button' })
  //   );
  //   expect(login).not.toBeUndefined('Header should contain item "Login"');
  //   const help = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#help-button' })
  //   );
  //   expect(help).not.toBeUndefined('Header should contain item "Help"');
  //   const privacy = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#privacy-button' })
  //   );
  //   expect(privacy).not.toBeUndefined('Header should contain item "Privacy"');
  //   const imprint = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#imprint-button' })
  //   );
  //   expect(imprint).not.toBeUndefined('Header should contain item "Imprint"');
  //   const theme = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#theme-switcher' })
  //   );
  //   expect(theme).not.toBeUndefined(
  //     'Header should contain item "Dark mode"/"Light mode"'
  //   );
  //   const language = await userMenu.getHarness(
  //     MatMenuItemHarness.with({ selector: '#language-menu' })
  //   );
  //   expect(language).not.toBeUndefined('Header should contain item "Language"');
  // });

  // // ## Navigate to user overview

  // it('should navigate to user overview', async () => {
  //   component.auth = new ClientAuthentication(
  //     '1234',
  //     'a@b.cd',
  //     AuthProvider.ARSNOVA,
  //     'token'
  //   );
  //   userButton = await loader.getHarness(
  //     MatButtonHarness.with({ selector: '#menu-button' })
  //   );
  //   await userButton.click();
  //   userMenu = await loader.getHarness(
  //     MatMenuHarness.with({ selector: '#menu-button' })
  //   );
  //   userMenuItems = await userMenu.getItems({ selector: '#my-rooms-button' });
  //   await userMenuItems[0].click();
  //   expect(routerSpy.navigate).toHaveBeenCalledWith(['user']);
  // });

  // // ## Logout

  // it('should navigate to home and display "Logged out" notification', async () => {
  //   component.auth = new ClientAuthentication(
  //     '1234',
  //     'a@b.cd',
  //     AuthProvider.ARSNOVA,
  //     'token'
  //   );
  //   userButton = await loader.getHarness(
  //     MatButtonHarness.with({ selector: '#menu-button' })
  //   );
  //   await userButton.click();
  //   userMenu = await loader.getHarness(
  //     MatMenuHarness.with({ selector: '#menu-button' })
  //   );
  //   userMenuItems = await userMenu.getItems({ selector: '#logout-button' });
  //   await userMenuItems[0].click();
  //   expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('');
  //   expect(notificationService.showAdvanced).toHaveBeenCalledWith(
  //     jasmine.any(String),
  //     AdvancedSnackBarTypes.SUCCESS
  //   );
  // });

  // // # If not logged in

  // it('should display user menu button if not logged in', async () => {
  //   component.auth = undefined;
  //   userButton = await loader.getHarness(
  //     MatButtonHarness.with({ selector: '#menu-button' })
  //   );
  //   expect(userButton).not.toBeNull();
  // });

  // it('should navigate to login route after when clicking login button', async () => {
  //   component.auth = undefined;
  //   userButton = await loader.getHarness(
  //     MatButtonHarness.with({ selector: '#menu-button' })
  //   );
  //   await userButton.click();
  //   userMenu = await loader.getHarness(
  //     MatMenuHarness.with({ selector: '#menu-button' })
  //   );
  //   userMenuItems = await userMenu.getItems({ selector: '#login-button' });
  //   await userMenuItems[0].click();
  //   expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('login');
  // });
});
