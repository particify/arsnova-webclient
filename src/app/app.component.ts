import { Component, OnInit } from '@angular/core';
import { ApiConfigService } from './services/http/api-config.service';
import { TrackingService } from './services/util/tracking.service';
import { ConsentService } from './services/util/consent.service';
import { UpdateService } from './services/util/update.service';
import { RoutingService } from './services/util/routing.service';
import { LanguageService } from './services/util/language.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(private languageService: LanguageService,
              private apiConfigService: ApiConfigService,
              private trackingService: TrackingService,
              private consentService: ConsentService,
              private updateService: UpdateService,
              private routingService: RoutingService,
              public route: ActivatedRoute,
              private router: Router) {
  }

  title = 'ARSnova';
  isPresentation = false;

  ngOnInit(): void {
    this.languageService.init();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
        this.checkRoute(event.url);
      });
    this.routingService.subscribeActivatedRoute();
    this.apiConfigService.getApiConfig$().subscribe(config => {
      if (config.ui.tracking?.url && config.ui.tracking?.provider === 'matomo') {
        this.trackingService.init(config.ui);
      }
      this.consentService.setConfig(config);
      this.updateService.handleUpdate(config.ui.versions);
    });
  }

  checkRoute(url: string) {
    this.isPresentation = this.routingService.isPresentation(url);
  }
}
