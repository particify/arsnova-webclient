import { Component, EventEmitter, OnInit } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { Router } from '@angular/router';
import { SystemInfoService } from '@app/core/services/http/system-info.service';
import { catchError, map, Observable, of, shareReplay } from 'rxjs';
import { LanguageService } from '@app/core/services/util/language.service';
import { SystemHealth } from '@app/admin/_models/system-health';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';

class NavButton {
  name: string;
  i18nName: string;
  icon: string;
  display: Observable<boolean>;

  constructor(
    name: string,
    i18nName: string,
    icon: string,
    display = of(true)
  ) {
    this.name = name;
    this.i18nName = i18nName;
    this.icon = icon;
    this.display = display;
  }
}

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss'],
})
export class AdminHomeComponent implements OnInit {
  routePrefix = '/admin/';
  currentPage: string;
  pageChanged = new EventEmitter<string>();

  healthInfo: Observable<SystemHealth>;

  constructor(
    protected langService: LanguageService,
    protected translateService: TranslocoService,
    protected globalStorageService: GlobalStorageService,
    protected router: Router,
    protected systemInfoService: SystemInfoService,
    protected featureFlagService: FeatureFlagService
  ) {
    langService.langEmitter.subscribe((lang) => {
      translateService.setActiveLang(lang);
    });
  }

  ngOnInit() {
    this.translateService.setActiveLang(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
    this.healthInfo = this.getHealthInfo();
    const url = this.router.url;
    this.currentPage = url.slice(this.routePrefix.length, url.length);
    setTimeout(() => {
      this.emitPageChange();
    }, 0);
  }

  getButtons(): NavButton[] {
    return [
      new NavButton('stats', 'system-stats', 'insights'),
      new NavButton('users', 'user-management', 'people'),
      new NavButton('rooms', 'room-management', 'room_preferences'),
      new NavButton(
        'templates',
        'template-management',
        'text_snippet',
        of(this.featureFlagService.isEnabled('CONTENT_GROUP_TEMPLATES'))
      ),
      new NavButton(
        'status',
        'status-details',
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

  changePage(page: string) {
    this.router.navigate([this.routePrefix, page]);
    this.currentPage = page;
    this.emitPageChange();
  }

  emitPageChange() {
    this.pageChanged.emit(this.currentPage);
  }
}
