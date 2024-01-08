import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';
import { AppComponent } from '@app/app.component';
import { ConsentService } from '@app/core/services/util/consent.service';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LanguageService } from '@app/core/services/util/language.service';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { of } from 'rxjs';
import { ApiConfig } from '@app/core/models/api-config';
import { TrackingService } from '@app/core/services/util/tracking.service';
import { UpdateService } from '@app/core/services/util/update.service';
import { GlobalStorageService } from '@app/core/services/util/global-storage.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { ActivatedRoute } from '@angular/router';
import { RoomService } from '@app/core/services/http/room.service';
import { Theme, ThemeService } from '@app/core/theme/theme.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { ENVIRONMENT } from '@environments/environment-token';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';
import { LanguageCategory } from '@app/core/models/language-category.enum';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { importProvidersFrom } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { RouterTestingModule } from '@angular/router/testing';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { HttpClientModule } from '@angular/common/http';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { AuthProvider } from '@app/core/models/auth-provider';
import { FooterLinksComponent } from '@app/standalone/footer-links/footer-links.component';
import { MatDrawer } from '@angular/material/sidenav';
import { DrawerService } from '@app/core/services/util/drawer.service';

class MockConsentService {
  setConfig() {}
  consentRequired() {
    return false;
  }
}
class MockAuthenticationService {
  getAuthenticationChanges() {
    return of(
      new ClientAuthentication(
        'userId',
        'loginId',
        AuthProvider.ARSNOVA,
        'token'
      )
    );
  }
  hasAdminRole() {
    return true;
  }
}
class MockService {}
class MockApiConfigService {
  getApiConfig$() {
    return of(new ApiConfig([], {}, {}));
  }
}

class MockThemeService {
  getCurrentTheme() {
    return Theme.LIGHT;
  }
  getThemes() {
    return [Theme.LIGHT, Theme.DARK];
  }
}

class MockLangService {
  getLangs() {
    return [
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
    ];
  }
  init() {}
}

class MockRoutingService {
  subscribeActivatedRoute() {}
}

class MockRoomService {
  getCurrentRoomStream() {
    return of(null);
  }
}

class MockFeatureFlagService {
  isEnabled() {
    return true;
  }
}

class MockUpdateService {
  handleUpdate() {}
}

class MockDrawerService {
  setDrawer(drawer: MatDrawer): void {
    drawer.toggle();
  }
}

export default {
  component: AppComponent,
  title: 'MainDrawer',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        CoreModule,
        RouterTestingModule,
        getTranslocoModule(),
        FooterLinksComponent,
      ],
      providers: [
        {
          provide: ConsentService,
          useClass: MockConsentService,
        },
        {
          provide: AuthenticationService,
          useClass: MockAuthenticationService,
        },
        {
          provide: LanguageService,
          useClass: MockLangService,
        },
        {
          provide: ApiConfigService,
          useClass: MockApiConfigService,
        },
        {
          provide: TrackingService,
          useClass: MockService,
        },
        {
          provide: UpdateService,
          useClass: MockUpdateService,
        },
        {
          provide: GlobalStorageService,
          useClass: MockService,
        },
        {
          provide: RoutingService,
          useClass: MockRoutingService,
        },
        {
          provide: ActivatedRoute,
          useClass: MockService,
        },
        {
          provide: RoomService,
          useClass: MockRoomService,
        },
        {
          provide: ThemeService,
          useClass: MockThemeService,
        },
        {
          provide: NotificationService,
          useClass: MockService,
        },
        {
          provide: FeatureFlagService,
          useClass: MockFeatureFlagService,
        },
        {
          provide: DrawerService,
          useClass: MockDrawerService,
        },
        {
          provide: ENVIRONMENT,
          useValue: { features: [] },
        },
      ],
    }),
    applicationConfig({
      providers: [
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
      ],
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

type Story = StoryObj<AppComponent>;

export const MainDrawer: Story = {};
