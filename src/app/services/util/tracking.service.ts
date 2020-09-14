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
      this._paq.push(['setCustomUrl', this.stripIdsFromUri(route)]);
      this._paq.push(['setDocumentTitle', title]);
      this._paq.push(['trackPageView']);
    }
  }

  /**
   * Replaces IDs in a URI to protect the user's privacy.
   */
  stripIdsFromUri(uri: string) {
    let strippedUri = uri.replace(/\/room\/[0-9]+/, '/room/__ROOM_SHORT_ID__');
    strippedUri = strippedUri.replace(/[0-9a-f]{32}/, '__ID__');
    return strippedUri;
  }
}
