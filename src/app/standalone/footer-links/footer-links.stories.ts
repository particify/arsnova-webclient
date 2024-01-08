import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';
import { FooterLinksComponent } from '@app/standalone/footer-links/footer-links.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ConsentService } from '@app/core/services/util/consent.service';
import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { AuthProvider } from '@app/core/models/auth-provider';

class MockConsentService {}
class MockAuthenticationService {
  hasAdminRole() {
    return true;
  }
}

export default {
  component: FooterLinksComponent,
  title: 'FooterLinks',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [
        FooterLinksComponent,
        RouterTestingModule,
        BrowserAnimationsModule,
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
      ],
    }),
    applicationConfig({
      providers: [
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<FooterLinksComponent>;

export const FooterLinks: Story = {
  args: {
    auth: new ClientAuthentication(
      'userId',
      'loginId',
      AuthProvider.ARSNOVA,
      'token'
    ),
    uiConfig: {
      links: {
        imprint: {
          url: 'imprint',
        },
        accessibility: {
          url: 'accessibility',
        },
        privacy: {
          url: 'privacy',
        },
        help: {
          url: 'help',
        },
      },
    },
    showHelp: true,
  },
};
