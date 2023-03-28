import { Component, EventEmitter, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '@core/services/util/language.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@core/services/util/global-storage.service';
import { Router } from '@angular/router';
import { SystemInfoService } from '@arsnova/app/services/http/system-info.service';
import { catchError, Observable, of, shareReplay } from 'rxjs';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss'],
})
export class AdminHomeComponent implements OnInit {
  routePrefix = '/admin/';
  currentPage: string;
  pageChanged = new EventEmitter<string>();

  healthInfo: Observable<object>;

  constructor(
    protected langService: LanguageService,
    protected translateService: TranslateService,
    protected globalStorageService: GlobalStorageService,
    protected router: Router,
    protected systemInfoService: SystemInfoService
  ) {
    langService.langEmitter.subscribe((lang) => translateService.use(lang));
  }

  ngOnInit() {
    this.translateService.use(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
    this.healthInfo = this.getHealthInfo();
    const url = this.router.url;
    this.currentPage = url.slice(this.routePrefix.length, url.length);
    setTimeout(() => {
      this.emitPageChange();
    }, 0);
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
