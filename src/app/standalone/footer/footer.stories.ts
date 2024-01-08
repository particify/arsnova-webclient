import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';
import { FooterComponent } from '@app/standalone/footer/footer.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { ExtensionPointModule } from '@projects/extension-point/src/public-api';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';
import { ENVIRONMENT } from '@environments/environment-token';
import { ApiConfig } from '@app/core/models/api-config';
import { of } from 'rxjs';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { RoutingService } from '@app/core/services/util/routing.service';

class MockRoutingService {
  showFooterLinks() {
    return of(false);
  }
}
class MockFeatureFlagService {}
class MockApiConfigService {
  getApiConfig$() {
    return of(new ApiConfig([], {}, {}));
  }
}

export default {
  component: FooterComponent,
  title: 'Footer',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [FooterComponent, RouterTestingModule, ExtensionPointModule],
      providers: [
        {
          provide: RoutingService,
          useClass: MockRoutingService,
        },
        {
          provide: FeatureFlagService,
          useClass: MockFeatureFlagService,
        },
      ],
    }),
    applicationConfig({
      providers: [
        {
          provide: ApiConfigService,
          useClass: MockApiConfigService,
        },
        {
          provide: ENVIRONMENT,
          useValue: { features: [] },
        },
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<FooterComponent>;

export const Footer: Story = {};
