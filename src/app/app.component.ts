import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SwUpdate } from '@angular/service-worker';
import { NotificationService } from './services/util/notification.service';
import { Rescale } from './models/rescale';
import { CustomIconService } from './services/util/custom-icon.service';
import { ApiConfigService } from './services/http/api-config.service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  private static scrollAnimation = true;

  constructor(private translationService: TranslateService,
              private update: SwUpdate,
              public notification: NotificationService,
              private customIconService: CustomIconService,
              private matIconRegistry: MatIconRegistry,
              private domSanitizer: DomSanitizer,
              private apiConfigService: ApiConfigService) {
    translationService.setDefaultLang(this.translationService.getBrowserLang());
    sessionStorage.setItem('currentLang', this.translationService.getBrowserLang());
    customIconService.init();
  }

  public static rescale: Rescale = new Rescale();

  title = 'ARSnova';

  public static scrollTop() {
    const sc: HTMLElement = document.getElementById('scroll_container');
    if (AppComponent.scrollAnimation) {
      sc.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      sc.scrollTop = 0;
    }
  }

  public static isScrolledTop(): boolean {
    return document.getElementById('scroll_container').scrollTop === 0;
  }

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
  }

  public getRescale(): Rescale {
    return AppComponent.rescale;
  }
}
