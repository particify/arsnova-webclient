import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

import { MatMenuModule } from '@angular/material/menu';
import { ExtensionPointModule } from '@projects/extension-point/src/public-api';
import { FlexModule } from '@angular/flex-layout';
import { UiConfig } from '@app/core/models/api-config';
import { FooterLinksComponent } from '@app/standalone/footer-links/footer-links.component';
import { Subject, takeUntil } from 'rxjs';
import { RoutingService } from '@app/core/services/util/routing.service';

@Component({
  imports: [
    TranslocoModule,
    MatMenuModule,
    ExtensionPointModule,
    FlexModule,
    RouterModule,
    FooterLinksComponent,
  ],
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnDestroy, OnInit {
  destroyed$ = new Subject();
  uiConfig?: UiConfig;
  referenceUrl =
    'https://particify.de/?mtm_campaign=powered-by&mtm_source=webclient';
  showFooterLinks = false;

  constructor(
    private route: ActivatedRoute,
    private routingService: RoutingService
  ) {}

  ngOnInit() {
    this.route.data.subscribe((data) => {
      this.uiConfig = data.apiConfig.ui;
    });
    this.routingService
      .showFooterLinks()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((showFooterLinks) => {
        this.showFooterLinks = showFooterLinks;
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(null);
  }
}
