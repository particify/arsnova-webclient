import { HttpClientModule } from '@angular/common/http';
import { EventEmitter, importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ApiConfig } from '@app/core/models/api-config';
import { LanguageCategory } from '@app/core/models/language-category.enum';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import {
  STORAGE_CONFIG,
  STORAGECONFIG_PROVIDER_TOKEN,
} from '@app/core/services/util/global-storage.service';
import { LanguageService } from '@app/core/services/util/language.service';
import { ThemeService } from '@app/core/theme/theme.service';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { ENVIRONMENT } from '@environments/environment-token';
import { applicationConfig, type Preview } from '@storybook/angular';
import { MaterialCssVarsService } from 'angular-material-css-vars';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

class MockMaterialCssVarsService {
  setDarkTheme() {}
  setPrimaryColor() {}
  setAccentColor() {}
  setWarnColor() {}
}

class MockApiConfigService {
  getApiConfig$() {
    return of(new ApiConfig([], {}, {}, false));
  }
}

class MockLangService {
  langEmitter = new EventEmitter<string>();
  ensureValidLang(lang: string): string {
    return lang;
  }

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
  getIsoLanguages() {
    return of([
      { code: 'en', nativeName: 'English', localizedName: 'Englisch' },
      { code: 'de', nativeName: 'Deutsch', localizedName: 'German' },
      { code: 'es', nativeName: 'español', localizedName: 'Spanish' },
    ]);
  }
}

const preview: Preview = {
  parameters: {},
  decorators: [
    applicationConfig({
      providers: [
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
        importProvidersFrom(RouterTestingModule),
        provideAnimations(),
        ThemeService,
        {
          provide: STORAGECONFIG_PROVIDER_TOKEN,
          useValue: STORAGE_CONFIG,
        },
        {
          provide: AuthenticationService,
          useValue: {},
        },
        {
          provide: ApiConfigService,
          useClass: MockApiConfigService,
        },
        {
          provide: MaterialCssVarsService,
          useClass: MockMaterialCssVarsService,
        },
        {
          provide: LanguageService,
          useClass: MockLangService,
        },
        {
          provide: ENVIRONMENT,
          useValue: { features: [] },
        },
      ],
    }),
  ],
};

export default preview;
