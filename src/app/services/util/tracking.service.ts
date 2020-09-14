import { Injectable } from '@angular/core';
import { ConsentService } from './consent.service';
import { StorageItemCategory } from '../../models/storage';


@Injectable()
export class TrackingService {

  _paq: any[];
  loaded: boolean;
  consentGiven: boolean;
  config: any;

  constructor(private consentService: ConsentService) {
    window['_paq'] = window['_paq'] || [];
    this._paq = window['_paq'];
    this.consentGiven = this.consentService.consentGiven(StorageItemCategory.STATISTICS);
  }

  init(config: any) {
    this.config = config;

    this._paq.push(['trackPageView']);
    this._paq.push(['enableLinkTracking']);
    this._paq.push(['setTrackerUrl', config.url + 'matomo.php']);
    this._paq.push(['setSiteId', config.site.id]);

    if (this.consentGiven) {
      this.loadTrackerScript();
    }
    /* Defer loading of tracking script if consent have not been given (yet). */
    this.consentService.subscribeToChanges(() => {
      this.consentGiven = this.consentService.consentGiven(StorageItemCategory.STATISTICS);
      if (this.consentGiven) {
        this.loadTrackerScript();
      }
    });
  }

  loadTrackerScript() {
    if (this.loaded) {
      return;
    }

    const trackerScript = document.createElement('script');
    trackerScript.src = this.config.url + 'matomo.js';
    trackerScript.async = true;
    trackerScript.defer = true;
    trackerScript.onload = () => this._paq = window['_paq'];
    document.body.appendChild(trackerScript);

    this.loaded = true;
  }

  addRoute(route: string, title: string) {
    if (this.consentGiven) {
      this._paq.push(['setCustomUrl', route]);
      this._paq.push(['setDocumentTitle', title]);
      this._paq.push(['trackPageView']);
    }
  }
}
