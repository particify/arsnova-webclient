import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CustomIconService } from './services/util/custom-icon.service';
import { ApiConfigService } from './services/http/api-config.service';
import { TrackingService } from './services/util/tracking.service';
import { UpdateService } from './services/util/update-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(private translationService: TranslateService,
              private customIconService: CustomIconService,
              private apiConfigService: ApiConfigService,
              private trackingService: TrackingService,
              private updateService: UpdateService) {
    translationService.setDefaultLang(this.translationService.getBrowserLang());
    customIconService.init();
  }

  title = 'ARSnova';

  ngOnInit(): void {
    this.apiConfigService.load();
    this.apiConfigService.getApiConfig$().subscribe(config => {
      if (config.ui.tracking.url && config.ui.tracking.provider === 'matomo') {
        this.trackingService.init(config.ui);
      }
      this.updateService.handleUpdate(config.ui.versions);
    });
  }
}
