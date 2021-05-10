import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ApiConfigService } from './services/http/api-config.service';
import { TrackingService } from './services/util/tracking.service';
import { ConsentService } from './services/util/consent.service';
import { UpdateService } from './services/util/update.service';
import { RoutingService } from './services/util/routing.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(private translationService: TranslateService,
              private apiConfigService: ApiConfigService,
              private trackingService: TrackingService,
              private consentService: ConsentService,
              private updateService: UpdateService,
              private routingService: RoutingService) {
  }

  title = 'ARSnova';

  ngOnInit(): void {
    this.translationService.setDefaultLang(this.translationService.getBrowserLang());
    this.routingService.subscribeActivatedRoute();
    this.apiConfigService.getApiConfig$().subscribe(config => {
      if (config.ui.tracking?.url && config.ui.tracking?.provider === 'matomo') {
        this.trackingService.init(config.ui);
      }
      this.consentService.setConfig(config);
      this.updateService.handleUpdate(config.ui.versions);
    });
  }
}
