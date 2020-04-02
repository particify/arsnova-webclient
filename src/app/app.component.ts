import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SwUpdate } from '@angular/service-worker';
import { NotificationService } from './services/util/notification.service';
import { CustomIconService } from './services/util/custom-icon.service';
import { ApiConfigService } from './services/http/api-config.service';
import { TrackingService } from './services/util/tracking.service';

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
              private trackingService: TrackingService) {
    translationService.setDefaultLang(this.translationService.getBrowserLang());
    customIconService.init();
  }

  title = 'ARSnova';

  ngOnInit(): void {
    this.update.available.subscribe(update => {
      let install: string;
      this.translationService.get('home-page.install').subscribe(msg => {
        install = msg;
      });
      this.translationService.get('home-page.update-available').subscribe(msg => {
        this.notification.show(msg, install, {
          duration: 10000
        });
      });
      this.notification.snackRef.afterDismissed().subscribe(info => {
        if (info.dismissedByAction === true) {
          window.location.reload();
        }
      });
    });
    this.apiConfigService.load();
    this.apiConfigService.getApiConfig$().subscribe(config => {
      const tracking = config.ui.tracking;
      if (tracking.url && tracking.provider === 'matomo') {
        this.trackingService.init(tracking);
      }
    });
  }
}
