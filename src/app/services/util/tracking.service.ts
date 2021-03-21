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
import { ClientAuthentication } from '../../models/client-authentication';
import { Subscription, timer } from 'rxjs';
import { environment } from '../../../environments/environment';

const HEARTBEAT_INVERVAL = 150;

/* This enum maps to Matomo dimension IDs for visits. */
enum VisitDimension {
  UI_LANGUAGE = 1,
  THEME = 2,
  AUTH_PROVIDER = 5,
  APP_VERSION = 6
}

/* This enum maps to Matomo dimension IDs for actions. */
enum ActionDimension {
  ROOM_ROLE = 3,
  SPECIAL_ROOM = 4
}

enum EventCategory {
  APP_UPDATE = 'App Update',
  ERROR = 'Error',
  ACCOUNT = 'Account',
  USER_DATA_ROOM = 'User data - Room',
  USER_DATA_COMMENT = 'User data - Comment',
  USER_DATA_CONTENT = 'User data - Content',
  FEATURE_USAGE_SURVEY = 'Feature usage - Survey'
}

@Injectable()
export class TrackingService {

  _paq: any[];
  loaded: boolean;
  consentGiven: boolean;
  uiConfig: any;
  previousAuth: ClientAuthentication;
  firstAuth = true;
  pingSubscription: Subscription;

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
      this._paq.push(['enableHeartBeatTimer']);
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
    this.router.events.pipe(
        filter(event => (event instanceof ActivationEnd && !!event.snapshot.component)),
        filter(event => (event as ActivationEnd).snapshot.outlet === 'primary'))
        .subscribe((event: ActivationEnd) => this.addRoute(this.router.url, event.snapshot));
    this.translateService.onLangChange
        .subscribe((event: LangChangeEvent) => this.setVisitDimension(VisitDimension.UI_LANGUAGE, event.lang));
    this.themeService.getTheme().subscribe((themeName) => this.setVisitDimension(VisitDimension.THEME, themeName));
    this.setVisitDimension(VisitDimension.UI_LANGUAGE, this.translateService.currentLang);
    this.setVisitDimension(VisitDimension.APP_VERSION, environment.version.commitHash);
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

  setupPingSubscription() {
    this.pingSubscription?.unsubscribe();
    this.pingSubscription = timer((45 + 45 * Math.random()) * 1000, HEARTBEAT_INVERVAL * 1000).subscribe(() => this.sendPing());
  }

  setupTrackingSubscriptions() {
    this.authenticationService.getAuthenticationChanges().subscribe(auth => {
      if (auth) {
        if (!this.previousAuth || auth.userId !== this.previousAuth.userId) {
          this.setVisitDimension(VisitDimension.AUTH_PROVIDER, auth.authProvider.toString().toLowerCase());
          if (!this.firstAuth) {
            this.addEvent(EventCategory.ACCOUNT, 'User logged in', auth.authProvider.toString().toLowerCase());
          }
        }
      } else {
        if (this.previousAuth) {
          this.addEvent(EventCategory.ACCOUNT, 'User logged out');
        }
      }
      this.previousAuth = auth;
      this.firstAuth = false;
    });
    this.eventService.on<any>('UpdateInstalled')
        .subscribe(e => this.addEvent(EventCategory.APP_UPDATE, 'Update loading finished', `Update from ${e.oldId}-${e.oldHash} to`
            + ` ${e.newId}-${e.newHash} (${e.importance.toString().toLowerCase()})`, e.loadTime));
    this.eventService.on<any>('HttpRequestFailed')
        .subscribe(e => this.addEvent(EventCategory.ERROR, 'HTTP request failed', `Status code ${e.status}`, undefined, e.url));
    this.eventService.on<any>('AccountCreated')
        .subscribe(e => this.addEvent(EventCategory.ACCOUNT, 'Account created'));
    this.eventService.on<any>('AccountDeleted')
        .subscribe(e => this.addEvent(EventCategory.ACCOUNT, 'Account deleted'));
    this.eventService.on<any>('RoomCreated')
        .subscribe(e => this.addEvent(EventCategory.USER_DATA_ROOM, 'Room created'));
    this.eventService.on<any>('CommentCreated')
        .subscribe(e => this.addEvent(EventCategory.USER_DATA_COMMENT, 'Comment created'));
    this.eventService.on<any>('ContentCreated')
        .subscribe(e => this.addEvent(EventCategory.USER_DATA_CONTENT, 'Content created', e.format.toString().toLowerCase()));
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
    this.setupPingSubscription();
  }

  addEvent(category: EventCategory, action: string, name?: string, value?: number, url?: string) {
    this._paq.push(['setCustomUrl', this.stripIdsFromUri(url ?? this.router.url)]);
    const event: (string|number)[] = ['trackEvent', category, action];
    /* Check for undefined explicitly because 0 is a valid value */
    if (name || typeof value !== 'undefined') {
      event.push(name);
      if (typeof value !== 'undefined') {
        event.push(value);
      }
    }
    this._paq.push(event);
  }

  sendPing() {
    if (!document.visibilityState || document.visibilityState === 'visible') {
      this._paq.push(['ping']);
    }
  }

  /**
   * Replaces IDs in a URI to protect the user's privacy.
   */
  stripIdsFromUri(uri: string) {
    return uri.replace(/\/room\/[0-9]+(\/|$)/, '/room/__ROOM_SHORT_ID__$1')
        .replace(/\/~.*?(\/|$)/, '/__ALIAS__$1')
        .replace(/\/[0-9a-f]{32}(\/|$)/, '/__ID__$1')
        .replace(/\/[0-9]{1,4}(\/|$)/, '/__INDEX__$1')
        .replace(/\/group\/[^\/]+/, '/group/__GROUP__');
  }
}
