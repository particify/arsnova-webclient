import { LanguageService } from '../../../services/util/language.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Room } from '../../../models/room';
import { ConsentService } from '../../../services/util/consent.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  public room: Room;

  privacyUrl: string;
  imprintUrl: string;
  feedbackUrl: string;
  referenceUrl = 'https://particify.de';
  showToolbar = true;
  viewWidth: number;

  constructor(
    public router: Router,
    private translateService: TranslateService,
    private langService: LanguageService,
    private consentService: ConsentService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.viewWidth = innerWidth;
    this.langService.langEmitter.subscribe(lang => this.translateService.use(lang));
    if (this.consentService.consentRequired()) {
      this.consentService.openDialog();
    }
    this.route.data.subscribe(data => {
      this.privacyUrl = data.apiConfig.ui.links?.privacy?.url;
      this.imprintUrl = data.apiConfig.ui.links?.imprint?.url ;
      this.feedbackUrl = data.apiConfig.ui.links?.feedback?.url;
    });
    this.checkToolbarCondition(this.router.url);
    this.router.events.pipe(
      filter(event => (event instanceof ActivationEnd)),
      filter(event => (event as ActivationEnd).snapshot.outlet === 'primary')
    ).subscribe((activationEndEvent: ActivationEnd) => {
      if (activationEndEvent.snapshot.component) {
        this.checkToolbarCondition(this.router.url);
      }
    });
  }

  openUrlInNewTab(url: string) {
    window.open(url, '_blank');
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
    this.showToolbar = this.viewWidth > 1000 || !url.match(/\/room\/[0-9]+\/[^\/]+/);
  }
}
