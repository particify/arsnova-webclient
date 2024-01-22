import { getTranslocoModule } from '@testing/transloco-testing.module';
import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { TrackingService } from '@app/core/services/util/tracking.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConsentService } from '@app/core/services/util/consent.service';
import { UpdateService } from '@app/core/services/util/update.service';
import { UpdateImportance } from '@app/core/models/version-info';
import { LanguageService } from '@app/core/services/util/language.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import {
  ActivatedRouteStub,
  MockFeatureFlagService,
  MockRouter,
} from '@testing/test-helpers';
import { Room } from '@app/core/models/room';
import { RoomService } from '@app/core/services/http/room.service';
import { AuthProvider } from './core/models/auth-provider';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { Theme, ThemeService } from '@app/core/theme/theme.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';
import { MatMenuModule } from '@angular/material/menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { MatButtonHarness } from '@angular/material/button/testing';
import {
  MatMenuHarness,
  MatMenuItemHarness,
} from '@angular/material/menu/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { LanguageCategory } from '@app/core/models/language-category.enum';
import { By } from '@angular/platform-browser';

describe('AppComponent', () => {
  let component: AppComponent;
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
  languageService.getLangs.and.returnValue([
    {
      key: 'de',
      name: 'Deutsch',
      category: LanguageCategory.OFFICIAL,
    },
    {
      key: 'en',
      name: 'English',
      category: LanguageCategory.OFFICIAL,
    },
    {
      key: 'es',
      name: 'Español',
      category: LanguageCategory.COMMUNITY,
    },
  ]);

  const themeService = jasmine.createSpyObj('ThemeService', [
    'getCurrentTheme',
    'getThemes',
    'toggleTheme',
  ]);
  themeService.getCurrentTheme.and.returnValue(Theme.LIGHT);
  themeService.getThemes.and.returnValue([Theme.LIGHT, Theme.DARK]);

  const roomService = jasmine.createSpyObj('RoomService', [
    'getCurrentRoomStream',
  ]);
  roomService.getCurrentRoomStream.and.returnValue(of(new Room()));

  const authenticationService = jasmine.createSpyObj('AuthenticationService', [
    'getAuthenticationChanges',
    'logout',
  ]);
  authenticationService.getAuthenticationChanges.and.returnValue(
    of({ loginId: 'test@test.de' })
  );

  const notificationService = jasmine.createSpyObj('NotificationService', [
    'showAdvanced',
  ]);

  const activatedRoute = new ActivatedRouteStub(undefined);

  let routerSpy = jasmine.createSpyObj('MockRouter', [
    'navigate',
    'navigateByUrl',
  ]);

  let loader: HarnessLoader;
  let langBtn: MatButtonHarness;
  let themeBtn: MatButtonHarness;
  let accountSettingsBtn: MatButtonHarness;
  let myRoomsBtn: MatButtonHarness;
  let templatesBtn: MatButtonHarness;
  let logoutBtn: MatButtonHarness;
  let loginBtn: MatButtonHarness;
  let langMenu: MatMenuHarness;
  let langMenuItems: MatMenuItemHarness[];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
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
          useValue: themeService,
        },
        {
          provide: NotificationService,
          useValue: notificationService,
        },
        {
          provide: FeatureFlagService,
          useClass: MockFeatureFlagService,
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRoute,
        },
      ],
      imports: [
        getTranslocoModule(),
        HttpClientTestingModule,
        BrowserAnimationsModule,
        MatMenuModule,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    routerSpy = TestBed.inject(Router);
    fixture.detectChanges();
  }));

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should have a title', () => {
    expect(component.title).toEqual('ARSnova');
  });

  it('should call the API config', async () => {
    expect(apiConfigService.getApiConfig$).toHaveBeenCalled();
  });

  it('should call the tracking service init on getting a tracking config', () => {
    expect(trackingService.init).toHaveBeenCalled();
  });

  it('should call the update service to handle update', () => {
    expect(updateService.handleUpdate).toHaveBeenCalled();
  });

  it('default lang should has been set after init', () => {
    expect(languageService.init).toHaveBeenCalled();
  });

  it('should call the routing service to start route subscription', () => {
    expect(routingService.subscribeActivatedRoute).toHaveBeenCalled();
  });

  it('should display following items no matter if logged in or not:', async () => {
    component.auth = new ClientAuthentication(
      '1234',
      'a@b.cd',
      AuthProvider.ARSNOVA,
      'token'
    );
    fixture.detectChanges();
    langBtn = await loader.getHarness(
      MatButtonHarness.with({ selector: '#lang-btn' })
    );
    expect(langBtn).not.toBeNull('Language button');
    themeBtn = await loader.getHarness(
      MatButtonHarness.with({ selector: '#theme-btn' })
    );
    expect(themeBtn).not.toBeNull('Theme button');
    component.auth = undefined;
    fixture.detectChanges();
    langBtn = await loader.getHarness(
      MatButtonHarness.with({ selector: '#lang-btn' })
    );
    expect(langBtn).not.toBeNull('Language button');
    themeBtn = await loader.getHarness(
      MatButtonHarness.with({ selector: '#theme-btn' })
    );
    expect(themeBtn).not.toBeNull('Theme button');
  });

  it('should display menu with language selection if language button clicked', async () => {
    langBtn = await loader.getHarness(
      MatButtonHarness.with({ selector: '#lang-btn' })
    );
    await langBtn.click();
    langMenu = await loader.getHarness(
      MatMenuHarness.with({ selector: '#lang-btn' })
    );
    expect(langMenu).not.toBeNull('Language menu should be displayed');
    component.translateUrl = undefined;
    langMenuItems = await langMenu.getItems();
    fixture.detectChanges();
    expect(langMenuItems.length).toBe(
      component.langs.length,
      'Lang menu should be contain items for all langs'
    );
    component.translateUrl = 'https://translate.url';
    langMenuItems = await langMenu.getItems();
    fixture.detectChanges();
    expect(langMenuItems.length).toBe(
      component.langs.length + 1,
      'Lang menu should be contain items for all langs and a link item to translate server'
    );
  });

  it('should toggle theme if theme button clicked', async () => {
    themeBtn = await loader.getHarness(
      MatButtonHarness.with({ selector: '#theme-btn' })
    );
    await themeBtn.click();
    expect(themeService.toggleTheme).toHaveBeenCalled();
  });

  it('should display footer links if ui config is provided', () => {
    const footerLinks = fixture.debugElement.query(By.css('app-footer-links'));
    expect(footerLinks).toBeTruthy();
  });

  // # If logged in

  it('should display following items for user if logged in:', async () => {
    component.auth = new ClientAuthentication(
      '1234',
      'a@b.cd',
      AuthProvider.ARSNOVA,
      'token'
    );
    fixture.detectChanges();
    accountSettingsBtn = await loader.getHarness(
      MatButtonHarness.with({ selector: '#account-settings-btn' })
    );
    expect(accountSettingsBtn).not.toBeNull('Account settings button');
    myRoomsBtn = await loader.getHarness(
      MatButtonHarness.with({ selector: '#my-rooms-btn' })
    );
    expect(myRoomsBtn).not.toBeNull('"My rooms" button');
    templatesBtn = await loader.getHarness(
      MatButtonHarness.with({ selector: '#templates-btn' })
    );
    expect(templatesBtn).not.toBeNull('Templates button');
    logoutBtn = await loader.getHarness(
      MatButtonHarness.with({ selector: '#logout-btn' })
    );
    expect(logoutBtn).not.toBeNull('Logout button');
  });

  it('should navigate to user home when clicking my rooms button', async () => {
    component.auth = new ClientAuthentication(
      '1234',
      'a@b.cd',
      AuthProvider.ARSNOVA,
      'token'
    );
    fixture.detectChanges();
    myRoomsBtn = await loader.getHarness(
      MatButtonHarness.with({ selector: '#my-rooms-btn' })
    );
    await myRoomsBtn.click();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('user');
  });

  it('should navigate to user home when clicking my rooms button', async () => {
    component.auth = new ClientAuthentication(
      '1234',
      'a@b.cd',
      AuthProvider.ARSNOVA,
      'token'
    );
    fixture.detectChanges();
    templatesBtn = await loader.getHarness(
      MatButtonHarness.with({ selector: '#templates-btn' })
    );
    await templatesBtn.click();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('templates');
  });

  it('should call logout function and navigate to home when clicking logout button', async () => {
    component.auth = new ClientAuthentication(
      '1234',
      'a@b.cd',
      AuthProvider.ARSNOVA,
      'token'
    );
    fixture.detectChanges();
    logoutBtn = await loader.getHarness(
      MatButtonHarness.with({ selector: '#logout-btn' })
    );
    await logoutBtn.click();
    expect(authenticationService.logout).toHaveBeenCalled();
    expect(notificationService.showAdvanced).toHaveBeenCalledWith(
      jasmine.any(String),
      AdvancedSnackBarTypes.SUCCESS
    );
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('');
  });

  it('should call logout function and navigate to home when clicking logout button', async () => {
    component.auth = new ClientAuthentication(
      '1234',
      'a@b.cd',
      AuthProvider.ARSNOVA,
      'token'
    );
    fixture.detectChanges();
    logoutBtn = await loader.getHarness(
      MatButtonHarness.with({ selector: '#logout-btn' })
    );
    await logoutBtn.click();
    expect(authenticationService.logout).toHaveBeenCalled();
    expect(notificationService.showAdvanced).toHaveBeenCalledWith(
      jasmine.any(String),
      AdvancedSnackBarTypes.SUCCESS
    );
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('');
  });

  // # If not logged in

  it('should display following items for user if not logged in:', async () => {
    component.auth = undefined;
    fixture.detectChanges();
    loginBtn = await loader.getHarness(
      MatButtonHarness.with({ selector: '#login-btn' })
    );
    expect(loginBtn).not.toBeNull('Login button');
  });

  it('should navigate to login rout when clicking login button', async () => {
    component.auth = undefined;
    fixture.detectChanges();
    loginBtn = await loader.getHarness(
      MatButtonHarness.with({ selector: '#login-btn' })
    );
    await loginBtn.click();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('login');
  });
});
