import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SwUpdate } from '@angular/service-worker';
import { AdvancedSnackBarTypes, NotificationService } from './services/util/notification.service';
import { CustomIconService } from './services/util/custom-icon.service';
import { ApiConfigService } from './services/http/api-config.service';
import { TrackingService } from './services/util/tracking.service';
import { DialogService } from './services/util/dialog.service';
import { GlobalStorageService, STORAGE_KEYS } from './services/util/global-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(private translationService: TranslateService,
              private update: SwUpdate,
              public notification: NotificationService,
              private customIconService: CustomIconService,
              private apiConfigService: ApiConfigService,
              private trackingService: TrackingService,
              private dialogService: DialogService,
              private globalStorageService: GlobalStorageService,
              private window: Window) {
    translationService.setDefaultLang(this.translationService.getBrowserLang());
    customIconService.init();
  }

  title = 'ARSnova';

  ngOnInit(): void {
    this.apiConfigService.load();
    this.apiConfigService.getApiConfig$().subscribe(config => {
      const tracking = config.ui.tracking;
      if (tracking.url && tracking.provider === 'matomo') {
        this.trackingService.init(tracking);
      }
    });
    if (this.globalStorageService.getItem(STORAGE_KEYS.UPDATED)) {
      this.globalStorageService.removeItem(STORAGE_KEYS.UPDATED);
      this.translationService.get('home-page.update-successful').subscribe(msg => {
        this.notification.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
      });
    }
    this.update.available.subscribe(() => {
      const dialogRef = this.dialogService.openUpdateInfoDialog(false);
      dialogRef.afterClosed().subscribe(() => {
        this.globalStorageService.setItem(STORAGE_KEYS.UPDATED, true);
        this.window.location.reload();
      });
    });
  }
}
