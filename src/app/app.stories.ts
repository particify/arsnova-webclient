import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { AppComponent } from '@app/app.component';
import { ConsentService } from '@app/core/services/util/consent.service';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { of } from 'rxjs';
import { TrackingService } from '@app/core/services/util/tracking.service';
import { UpdateService } from '@app/core/services/util/update.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { ActivatedRoute } from '@angular/router';
import { RoomService } from '@app/core/services/http/room.service';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';
import { CoreModule } from '@app/core/core.module';
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
      imports: [CoreModule, FooterLinksComponent],
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
          provide: TrackingService,
          useClass: MockService,
        },
        {
          provide: UpdateService,
          useClass: MockUpdateService,
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
          provide: FeatureFlagService,
          useClass: MockFeatureFlagService,
        },
        {
          provide: DrawerService,
          useClass: MockDrawerService,
        },
      ],
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

type Story = StoryObj<AppComponent>;

export const MainDrawer: Story = {};
