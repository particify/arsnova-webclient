import { Injectable } from '@angular/core';


@Injectable()
export class TrackingService {

  _paq: any[];

  constructor() {
    window['_paq'] = window['_paq'] || [];
    this._paq = window['_paq'];
  }

  init(trackingInfo: any) {

    this._paq.push(['trackPageView']);
    this._paq.push(['enableLinkTracking']);
    this._paq.push(['setTrackerUrl', trackingInfo.url + 'matomo.php']);
    this._paq.push(['setSiteId', trackingInfo.site.id]);

    const trackerScript = document.createElement('script');
    trackerScript.src = trackingInfo.url + 'matomo.js';
    trackerScript.async = true;
    trackerScript.defer = true;
    document.body.appendChild(trackerScript);
  }
}
