import { Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { RouterOutlet } from '@angular/router';
import { SystemInfoService } from '@app/core/services/http/system-info.service';
import { catchError, map, of, shareReplay } from 'rxjs';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';
import {
  NavButton,
  NavButtonSection,
  NavigationDrawerComponent,
} from '@app/standalone/navigation-drawer/navigation-drawer.component';
import { FlexModule } from '@angular/flex-layout';
import { ExtensionPointComponent } from '@projects/extension-point/src/lib/extension-point.component';
@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss'],
  imports: [
    NavigationDrawerComponent,
    FlexModule,
    ExtensionPointComponent,
    RouterOutlet,
    TranslocoPipe,
  ],
})
export class AdminHomeComponent {
  private readonly systemInfoService = inject(SystemInfoService);
  private readonly featureFlagService = inject(FeatureFlagService);

  navButtonSection: NavButtonSection[] = [
    new NavButtonSection([
      new NavButton('stats', 'admin.admin-area.system-stats', 'insights'),
      new NavButton('users', 'admin.admin-area.user-management', 'people'),
      new NavButton(
        'rooms',
        'admin.admin-area.room-management',
        'room_preferences'
      ),
      new NavButton(
        'templates',
        'admin.admin-area.template-management',
        'text_snippet',
        of(this.featureFlagService.isEnabled('CONTENT_GROUP_TEMPLATES'))
      ),
      new NavButton(
        'reports',
        'admin.admin-area.reported-contents',
        'flag',
        of(this.featureFlagService.isEnabled('CONTENT_GROUP_TEMPLATES'))
      ),
      new NavButton(
        'status',
        'admin.admin-area.status-details',
        'dns',
        this.systemInfoService
          .getHealthInfo()
          .pipe(
            catchError((response) => of(response.error)),
            shareReplay()
          )
          .pipe(map((h) => !!h.components))
      ),
    ]),
  ];
}
