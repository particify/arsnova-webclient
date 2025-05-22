import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { FooterComponent } from '@app/standalone/footer/footer.component';
import { ExtensionPointModule } from '@projects/extension-point/src/public-api';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';
import { of } from 'rxjs';
import { RoutingService } from '@app/core/services/util/routing.service';

class MockRoutingService {
  showFooterLinks() {
    return of(false);
  }
}
class MockFeatureFlagService {}

export default {
  component: FooterComponent,
  title: 'Footer',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [FooterComponent, ExtensionPointModule],
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
  ],
} as Meta;

type Story = StoryObj<FooterComponent>;

export const Footer: Story = {};
