import { Component, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  ActivationEnd,
  Router,
  RouterModule,
} from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { Room } from '@app/core/models/room';
import { ConsentService } from '@app/core/services/util/consent.service';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { ExtensionPointModule } from '@projects/extension-point/src/public-api';
import { FlexModule } from '@angular/flex-layout';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    MatMenuModule,
    ExtensionPointModule,
    FlexModule,
    RouterModule,
  ],
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  public room: Room;

  privacyUrl: string;
  imprintUrl: string;
  accessibilityUrl: string;
  referenceUrl = 'https://particify.de';
  showToolbar = true;
  viewWidth: number;

  constructor(
    public router: Router,
    private consentService: ConsentService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.viewWidth = innerWidth;
    if (this.consentService.consentRequired()) {
      this.consentService.openDialog();
    }
    this.route.data.subscribe((data) => {
      this.privacyUrl = data.apiConfig.ui.links?.privacy?.url;
      this.imprintUrl = data.apiConfig.ui.links?.imprint?.url;
      this.accessibilityUrl = data.apiConfig.ui.links?.accessibility?.url;
    });
    this.checkToolbarCondition(this.router.url);
    this.router.events
      .pipe(
        filter((event) => event instanceof ActivationEnd),
        filter(
          (event) => (event as ActivationEnd).snapshot.outlet === 'primary'
        )
      )
      .subscribe((activationEndEvent) => {
        if ((<ActivationEnd>activationEndEvent).snapshot.component) {
          this.checkToolbarCondition(this.router.url);
        }
      });
  }

  openUrlInNewTab(url: string) {
    window.open(url, '_blank');
  }

  showAccessibilityStatement() {
    this.openUrlInNewTab(this.accessibilityUrl);
  }

  showImprint() {
    this.openUrlInNewTab(this.imprintUrl);
  }

  showDataProtection() {
    this.openUrlInNewTab(this.privacyUrl);
  }

  showCookieSettings() {
    this.consentService.openDialog();
  }

  checkToolbarCondition(url: string) {
    this.showToolbar = this.viewWidth > 1000 || !url.match(/\/[0-9]+\/[^/]+/);
  }
}
