import { ErrorHandler, Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, ActivationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { ConsentService } from './consent.service';
import { StorageItemCategory } from '@app/core/models/storage';
import { TranslocoService } from '@ngneat/transloco';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { EventService } from './event.service';
import { ThemeService } from '@app/core/theme/theme.service';
import { UserRole } from '@app/core/models/user-roles.enum';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { Subscription, timer } from 'rxjs';
import { environment } from '@environments/environment';
import { ConsentChangedEvent } from '@app/core/models/events/consent-changed';
import { GlobalStorageService, STORAGE_KEYS } from './global-storage.service';
import { AppErrorHandler } from '@app/app-error-handler';

const HEARTBEAT_INVERVAL = 150;

/* This enum maps to Matomo dimension IDs for visits. */
enum VisitDimension {
  UI_LANGUAGE = 1,
  THEME = 2,
  AUTH_PROVIDER = 5,
  APP_VERSION = 6,
  ENTRY = 7,
  UI_ERROR_COUNT = 8,
  HTTP_ERROR_COUNT = 9,
  HOTKEYS = 10,
}

/* This enum maps to Matomo dimension IDs for actions. */
enum ActionDimension {
  ROOM_ROLE = 3,
  SPECIAL_ROOM = 4,
}

export enum EventCategory {
  UI_DIALOG = 'UI dialog',
  UI_INTERACTION = 'UI interaction',
  BROSWER = 'Browser',
  APP_UPDATE = 'App Update',
  ERROR = 'Error',
  ACCOUNT = 'Account',
  USER_DATA_ROOM = 'User data - Room',
  USER_DATA_COMMENT = 'User data - Comment',
  USER_DATA_CONTENT = 'User data - Content',
  FEATURE_USAGE_SURVEY = 'Feature usage - Survey',
}

@Injectable()
export class TrackingService {
  _paq: any[];
  loaded = false;
  consentGiven?: boolean;
  uiConfig: any;
  previousAuth?: ClientAuthentication;
  firstAuth = true;
  pingSubscription?: Subscription;
  specialRooms = new Map<string, string>();
  appErrorHandler: AppErrorHandler;

  constructor(
    private consentService: ConsentService,
    private router: Router,
    private eventService: EventService,
    private authenticationService: AuthenticationService,
    private translateService: TranslocoService,
    private themeService: ThemeService,
    private globalStorageService: GlobalStorageService,
    errorHandler: ErrorHandler,
    @Inject(Window) private _window: { [key: string]: object }
  ) {
    this.appErrorHandler = errorHandler as AppErrorHandler;
    _window['_paq'] = _window['_paq'] || [];
    this._paq = _window['_paq'] as any[];
    this.consentService
      .consentInitialized()
      .subscribe(
        () =>
          (this.consentGiven = this.consentService.consentGiven(
            StorageItemCategory.STATISTICS
          ))
      );
  }

  // eslint-disable-next-line complexity
  init(uiConfig: any) {
    this.uiConfig = uiConfig;
    if (
      navigator.doNotTrack === '1' ||
      !uiConfig.tracking?.url ||
      uiConfig.tracking?.provider !== 'matomo'
    ) {
      return;
    }

    const feedbackRoomShortId =
      uiConfig.links?.feedback?.url?.match(/\/([0-9]{8})$/)?.[1];
    if (feedbackRoomShortId) {
      this.specialRooms.set(feedbackRoomShortId, 'Feedback');
    }

    if (uiConfig.tracking.heartbeat) {
      this._paq.push(['enableHeartBeatTimer']);
    }
    this._paq.push(['enableLinkTracking']);
    this._paq.push(['setTrackerUrl', uiConfig.tracking.url + 'matomo.php']);
    this._paq.push(['setSiteId', uiConfig.tracking.site.id]);

    if (this.router.url === location.pathname) {
      this.addRoute(this.router.url);
    }

    this.trackEntryOrReload();

    this.consentService.consentRequired().subscribe((consentRequired) => {
      if (!consentRequired) {
        if (!this.consentGiven) {
          this._paq.unshift(['disableCookies']);
        }
        this.loadTrackerScript();
      }
    });

    /* Defer loading of tracking script if consent have not been given (yet). */
    this.eventService
      .on<ConsentChangedEvent>('ConsentChangedEvent')
      .subscribe(() => {
        this.consentGiven = this.consentService.consentGiven(
          StorageItemCategory.STATISTICS
        );
        if (!this.consentGiven) {
          if (this._paq.unshift) {
            this._paq.unshift(['disableCookies']);
          } else {
            // We cannot use unshift once the Matomo script has loaded.
            this._paq.push(['disableCookies']);
          }
        }
        this.loadTrackerScript();
      });
    this.router.events
      .pipe(
        filter(
          (event) =>
            event instanceof ActivationEnd && !!event.snapshot.component
        ),
        map((event) => event as ActivationEnd),
        filter((event) => event.snapshot.outlet === 'primary'),
        filter((event) => !event.snapshot.routeConfig?.children)
      )
      .subscribe((event) => {
        this.addRoute(this.router.url, event.snapshot);
      });
    this.translateService.langChanges$.subscribe((lang: string) =>
      this.setVisitDimension(VisitDimension.UI_LANGUAGE, lang)
    );
    this.themeService.getCurrentTheme$().subscribe((themeName) => {
      this.setVisitDimension(VisitDimension.THEME, themeName);
    });
    this.appErrorHandler.uiErrorCount$.subscribe((count) =>
      this.setVisitDimension(VisitDimension.UI_ERROR_COUNT, count.toString())
    );
    this.appErrorHandler.httpErrorCount$.subscribe((count) =>
      this.setVisitDimension(VisitDimension.HTTP_ERROR_COUNT, count.toString())
    );
    this.setVisitDimension(
      VisitDimension.UI_LANGUAGE,
      this.translateService.getActiveLang()
    );
    this.setVisitDimension(
      VisitDimension.APP_VERSION,
      environment.version.commitHash
    );
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
    trackerScript.onload = () => (this._paq = this._window['_paq'] as any[]);
    document.body.appendChild(trackerScript);

    this.loaded = true;
  }

  setupPingSubscription() {
    this.pingSubscription?.unsubscribe();
    this.pingSubscription = timer(
      (45 + 45 * Math.random()) * 1000,
      HEARTBEAT_INVERVAL * 1000
    ).subscribe(() => this.sendPing());
  }

  setupTrackingSubscriptions() {
    this.authenticationService.getAuthenticationChanges().subscribe((auth) => {
      if (auth) {
        if (!this.previousAuth || auth.userId !== this.previousAuth.userId) {
          this.setVisitDimension(
            VisitDimension.AUTH_PROVIDER,
            auth.authProvider.toString().toLowerCase()
          );
          if (!this.firstAuth) {
            this.addEvent(
              EventCategory.ACCOUNT,
              'User logged in',
              auth.authProvider.toString().toLowerCase()
            );
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
    this.eventService.on<any>('UpdateInstalled').subscribe((e) => {
      if (e.oldHash) {
        const updateTo = e.newHash
          ? ` to ${e.newId}-${e.newHash} (${e.importance
              .toString()
              .toLowerCase()})`
          : '';
        this.addEvent(
          EventCategory.APP_UPDATE,
          'Update loading finished',
          `Update from ${e.oldId}-${e.oldHash}${updateTo}`,
          e.loadTime
        );
      } else {
        this.addEvent(
          EventCategory.APP_UPDATE,
          'Update activated',
          `Update to ${e.newId}-${e.newHash}`
        );
      }
    });
    this.eventService
      .on<any>('HttpRequestFailed')
      .subscribe((e) =>
        this.addEvent(
          EventCategory.ERROR,
          'HTTP request failed',
          `Status code ${e.status}`,
          undefined,
          e.url
        )
      );
    this.eventService
      .on<any>('AccountCreated')
      .subscribe(() => this.addEvent(EventCategory.ACCOUNT, 'Account created'));
    this.eventService
      .on<any>('AccountDeleted')
      .subscribe(() => this.addEvent(EventCategory.ACCOUNT, 'Account deleted'));
    this.eventService
      .on<any>('RoomCreated')
      .subscribe(() =>
        this.addEvent(EventCategory.USER_DATA_ROOM, 'Room created')
      );
    this.eventService.on<any>('DemoRoomCreated').subscribe((e) => {
      this.addEvent(EventCategory.USER_DATA_ROOM, 'Demo room created');
      this.specialRooms.set(e.shortId, 'Demo');
    });
    this.eventService
      .on<any>('CommentCreated')
      .subscribe(() =>
        this.addEvent(EventCategory.USER_DATA_COMMENT, 'Comment created')
      );
    this.eventService
      .on<any>('ContentCreated')
      .subscribe((e) =>
        this.addEvent(
          EventCategory.USER_DATA_CONTENT,
          'Content created',
          e.format.toString().toLowerCase()
        )
      );
    this.eventService
      .on<any>('SurveyStarted')
      .subscribe(() =>
        this.addEvent(EventCategory.FEATURE_USAGE_SURVEY, 'Survey started')
      );
    this.eventService
      .on<any>('HotkeyActivated')
      .subscribe((e) =>
        this.setVisitDimension(VisitDimension.HOTKEYS, e.count.toString())
      );
  }

  setVisitDimension(dimension: VisitDimension, value: string) {
    if (!environment.production) {
      console.log(
        `Tracking: setVisitDimension(dimension=${dimension}, value=${value})`
      );
    }
    this._paq.push(['setCustomDimension', dimension, value]);
  }

  addRoute(uri: string, route?: ActivatedRouteSnapshot) {
    const titleMatches = document.title.match(/^(.+?)( [|–•].*)?$/);
    let title = titleMatches ? titleMatches[1] : '';
    const dimensions: { [key: string]: string } = {};
    if (route) {
      if (route.title) {
        title = route.title;
      }
      const shortId = route.paramMap.get('shortId');
      const role: UserRole = route.data.viewRole;
      if (role) {
        dimensions['dimension' + ActionDimension.ROOM_ROLE] = role
          .toString()
          .toLowerCase();
        if (shortId && this.specialRooms.has(shortId)) {
          const specialRoom = this.specialRooms.get(shortId);
          if (specialRoom) {
            dimensions['dimension' + ActionDimension.SPECIAL_ROOM] =
              specialRoom;
          }
        }
      }
    }
    this._paq.push(['setCustomUrl', this.stripIdsFromUri(uri)]);
    this._paq.push(['trackPageView', title, dimensions]);
    this.setupPingSubscription();
  }

  addEvent(
    category: EventCategory,
    action: string,
    name?: string,
    value?: number,
    url?: string
  ) {
    if (!environment.production) {
      console.log(
        `Tracking: addEvent(category=${category}, action=${action}, name=${name}, value=${value}, url=${url})`
      );
    }
    this._paq.push([
      'setCustomUrl',
      this.stripIdsFromUri(url ?? this.router.url),
    ]);
    const event: (string | number)[] = ['trackEvent', category, action];
    /* Check for undefined explicitly because 0 is a valid value */
    if (name || typeof value !== 'undefined') {
      event.push(name || 'No name defined');
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
    return uri
      .replace(/\/[0-9]+(\/|\?|$)/, '/__ROOM_SHORT_ID__$1')
      .replace(/\/~.*?(\/|\?|$)/, '/__ALIAS__$1')
      .replace(/\/[0-9a-f]{32}(\/|\?|$)/, '/__ID__$1')
      .replace(/\/[0-9]{1,4}(\/|\?|$)/, '/__INDEX__$1')
      .replace(/\/series\/[^/]+/, '/series/__SERIES__')
      .replace(/\/present\/[0-9]+(\/|\?|$)/, '/present/__ROOM_SHORT_ID__$1')
      .replace(/\/[^/?]+@[^/?]+/, '/__MAIL__');
  }

  private trackEntryOrReload() {
    const queryParams = new URL(document.location.href).searchParams;
    const entry = queryParams.get('entry');
    if (
      this.globalStorageService.getItem(
        STORAGE_KEYS.BROWSER_SESSION_INITIALIZED
      )
    ) {
      this.addEvent(EventCategory.BROSWER, 'App reinitialized');
    } else if (entry) {
      this.setVisitDimension(VisitDimension.ENTRY, entry);
    }
    this.globalStorageService.setItem(
      STORAGE_KEYS.BROWSER_SESSION_INITIALIZED,
      true
    );
  }
}
