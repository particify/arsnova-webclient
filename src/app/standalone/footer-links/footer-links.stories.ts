import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { FooterLinksComponent } from '@app/standalone/footer-links/footer-links.component';
import { ConsentService } from '@app/core/services/util/consent.service';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { AuthenticatedUser } from '@app/core/models/authenticated-user';
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
      imports: [FooterLinksComponent],
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
  ],
} as Meta;

type Story = StoryObj<FooterLinksComponent>;

export const FooterLinks: Story = {
  args: {
    auth: new AuthenticatedUser(
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
