import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, ActivationEnd, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ConsentService } from './consent.service';
import { StorageItemCategory } from '../../models/storage';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '../http/authentication.service';
import { EventService } from './event.service';
import { ThemeService } from '../../../theme/theme.service';
import { UserRole } from '../../models/user-roles.enum';

const HEARTBEAT_INVERVAL = 60;

/* This enum maps to Matomo dimension IDs for visits. */
enum VisitDimension {
  UI_LANGUAGE = 1,
  THEME = 2,
  AUTH_PROVIDER = 5,
}

/* This enum maps to Matomo dimension IDs for actions. */
enum ActionDimension {
  ROOM_ROLE = 3,
  SPECIAL_ROOM = 4
}

enum EventCategory {
  ACCOUNT = 'Account',
  USER_DATA_ROOM = 'User data - Room',
  FEATURE_USAGE_SURVEY = 'Feature usage - Survey'
}

@Injectable()
export class TrackingService {

  _paq: any[];
  loaded: boolean;
  consentGiven: boolean;
  uiConfig: any;

  constructor(
    private consentService: ConsentService,
    private router: Router,
    private eventService: EventService,
    private authenticationService: AuthenticationService,
    private translateService: TranslateService,
    private themeService: ThemeService
  ) {
    window['_paq'] = window['_paq'] || [];
    this._paq = window['_paq'];
    this.consentGiven = this.consentService.consentGiven(StorageItemCategory.STATISTICS);
  }

  init(uiConfig: any) {
    this.uiConfig = uiConfig;

    if (uiConfig.tracking.heartbeat) {
      this._paq.push(['enableHeartBeatTimer', HEARTBEAT_INVERVAL]);
    }
    this._paq.push(['enableLinkTracking']);
    this._paq.push(['setTrackerUrl', uiConfig.tracking.url + 'matomo.php']);
    this._paq.push(['setSiteId', uiConfig.tracking.site.id]);

    if (this.router.url === location.pathname) {
      this.addRoute(this.router.url);
    }

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
    this.router.events.pipe(filter(event => (event instanceof ActivationEnd && !!event.snapshot.component)))
        .subscribe((event: ActivationEnd) => this.addRoute(this.router.url, event.snapshot));
    this.translateService.onLangChange
        .subscribe((event: LangChangeEvent) => this.setVisitDimension(VisitDimension.UI_LANGUAGE, event.lang));
    this.themeService.getTheme().subscribe((themeName) => this.setVisitDimension(VisitDimension.THEME, themeName));
    this.setVisitDimension(VisitDimension.UI_LANGUAGE, this.translateService.currentLang);
    this.setupTrackingSubscriptions();
  }

  loadTrackerScript() {
    if (this.loaded) {
      return;
    }

    const trackerScript = document.createElement('script');
    trackerScript.src = this.uiConfig.tracking.url + 'matomo.js';
    trackerScript.async = true;
    trackerScript.defer = true;
    trackerScript.onload = () => this._paq = window['_paq'];
    document.body.appendChild(trackerScript);

    this.loaded = true;
  }

  setupTrackingSubscriptions() {
    this.authenticationService.getAuthenticationChanges().subscribe(auth => {
      if (auth) {
        this.setVisitDimension(VisitDimension.AUTH_PROVIDER, auth.authProvider.toString().toLowerCase());
        this.addEvent(EventCategory.ACCOUNT, 'User logged in', auth.authProvider.toString().toLowerCase());
      } else {
        this.addEvent(EventCategory.ACCOUNT, 'User logged out');
      }
    });
    this.eventService.on<any>('AccountCreated')
        .subscribe(e => this.addEvent(EventCategory.ACCOUNT, 'Account created'));
    this.eventService.on<any>('AccountDeleted')
        .subscribe(e => this.addEvent(EventCategory.ACCOUNT, 'Account deleted'));
    this.eventService.on<any>('RoomCreated')
        .subscribe(e => this.addEvent(EventCategory.USER_DATA_ROOM, 'Room created'));
    this.eventService.on<any>('SurveyStarted')
        .subscribe(e => this.addEvent(EventCategory.FEATURE_USAGE_SURVEY, 'Survey started'));
  }

  setVisitDimension(dimension: VisitDimension, value: string) {
    this._paq.push(['setCustomDimension', dimension, value]);
  }

  addRoute(uri: string, route?: ActivatedRouteSnapshot) {
    const titleMatches = document.title.match(/^(.+?)( [|–•].*)?$/);
    const title = titleMatches ? titleMatches[1] : '';
    const dimensions = {};
    if (route) {
      const shortId = route.paramMap.get('shortId');
      const role: UserRole = route.data.viewRole;
      if (role) {
        dimensions['dimension' + ActionDimension.ROOM_ROLE] = role.toString().toLowerCase();
        if (shortId === this.uiConfig.demo) {
          dimensions['dimension' + ActionDimension.SPECIAL_ROOM] = 'Demo';
        }
      }
    }
    this._paq.push(['setCustomUrl', this.stripIdsFromUri(uri)]);
    this._paq.push(['trackPageView', title, dimensions]);
  }

  addEvent(category: EventCategory, action: string, name?: string, value?: number) {
    const event = ['trackEvent', category, action];
    this._paq.push(['trackEvent', category, action, name, value]);
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
