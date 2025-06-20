import { Component, OnInit, inject } from '@angular/core';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { Router, RouterOutlet } from '@angular/router';
import { SystemInfoService } from '@app/core/services/http/system-info.service';
import { catchError, map, Observable, of, shareReplay } from 'rxjs';
import { LanguageService } from '@app/core/services/util/language.service';
import { SystemHealth } from '@app/admin/_models/system-health';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';
import {
  NavButton,
  NavButtonSection,
  NavigationDrawerComponent,
} from '@app/standalone/navigation-drawer/navigation-drawer.component';
import { FlexModule } from '@angular/flex-layout';
import { ExtensionPointComponent } from '@projects/extension-point/src/lib/extension-point.component';
import { SummaryBarComponent } from '@app/admin/summary-bar/summary-bar.component';
@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss'],
  imports: [
    NavigationDrawerComponent,
    FlexModule,
    ExtensionPointComponent,
    SummaryBarComponent,
    RouterOutlet,
    TranslocoPipe,
  ],
})
export class AdminHomeComponent implements OnInit {
  protected langService = inject(LanguageService);
  protected translateService = inject(TranslocoService);
  protected globalStorageService = inject(GlobalStorageService);
  protected router = inject(Router);
  protected systemInfoService = inject(SystemInfoService);
  protected featureFlagService = inject(FeatureFlagService);

  healthInfo: Observable<SystemHealth>;
  navButtonSection: NavButtonSection[] = [];

  constructor() {
    const langService = this.langService;
    const translateService = this.translateService;

    langService.langEmitter.subscribe((lang) => {
      translateService.setActiveLang(lang);
    });
    this.healthInfo = this.getHealthInfo();
  }

  ngOnInit() {
    this.translateService.setActiveLang(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
    this.navButtonSection.push(
      new NavButtonSection(this.getButtons(), 'admin.admin-area.general')
    );
  }

  getButtons(): NavButton[] {
    return [
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
        this.healthInfo.pipe(map((h) => !!h?.details))
      ),
    ];
  }

  getHealthInfo() {
    return this.systemInfoService.getHealthInfo().pipe(
      catchError((response) => of(response.error)),
      shareReplay()
    );
  }
}
