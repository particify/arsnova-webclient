import { Injectable, inject } from '@angular/core';
import { AbstractHttpService } from '@app/core/services/http/abstract-http.service';
import { HttpHeaders } from '@angular/common/http';
import {
  catchError,
  filter,
  map,
  shareReplay,
  switchMap,
  take,
} from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { CookiesComponent } from '@app/core/components//_dialogs/cookies/cookies.component';
import { StorageItemCategory } from '@app/core/models/storage';
import { ApiConfig, Feature } from '@app/core/models/api-config';
import { ConsentChangedEvent } from '@app/core/models/events/consent-changed';
import { GlobalStorageService, STORAGE_KEYS } from './global-storage.service';
import { ActivationEnd, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

export const CONSENT_VERSION = 1;

export interface ConsentGiven {
  [key: string]: boolean;
}

export interface CookieCategory {
  key: StorageItemCategory;
  id: string;
  required: boolean;
  consent?: boolean;
  disabled?: boolean;
}

export interface ConsentSettings {
  id?: string;
  version: number;
  timestamp: Date;
  consentGiven: { [key: string]: boolean };
}

const httpOptions = {
  headers: new HttpHeaders({}),
};

@Injectable()
export class ConsentService extends AbstractHttpService<ConsentSettings> {
  dialog = inject(MatDialog);
  private globalStorageService = inject(GlobalStorageService);
  private router = inject(Router);

  private essentialCategory: CookieCategory = {
    key: StorageItemCategory.REQUIRED,
    id: 'essential',
    consent: true,
    required: true,
  };
  private functionalCategory: CookieCategory = {
    key: StorageItemCategory.FUNCTIONAL,
    id: 'functional',
    consent: true,
    required: false,
  };
  private statisticsCategory: CookieCategory = {
    key: StorageItemCategory.STATISTICS,
    id: 'statistics',
    consent: undefined,
    required: false,
  };
  private readonly categories: CookieCategory[] = [
    this.essentialCategory,
    this.functionalCategory,
    this.statisticsCategory,
  ];
  private readonly categoryMap: Map<StorageItemCategory, CookieCategory> =
    this.categories.reduce((map, category) => {
      map.set(category.key, category);
      return map;
    }, new Map());
  private consentSettings?: ConsentSettings;
  private privacyUrl?: string;
  private consentRecording?: Feature;
  private skipConsent$: Observable<boolean>;
  private consentInitialized$ = new BehaviorSubject(false);

  constructor() {
    super('/consent');
    this.skipConsent$ = this.router.events.pipe(
      filter((event) => event instanceof ActivationEnd),
      map((event) => event as ActivationEnd),
      filter((event) => event.snapshot.outlet === 'primary'),
      take(1),
      map((event) => event.snapshot.data['skipConsent']),
      shareReplay()
    );
  }

  init(apiConfig: ApiConfig) {
    this.setConfig(apiConfig);
    this.initConsent();
    this.consentRequired().subscribe((consentRequired) => {
      if (consentRequired) {
        this.openDialog();
      }
    });
  }

  setConfig(apiConfig: ApiConfig) {
    this.privacyUrl = apiConfig.ui.links?.privacy?.url;
    this.consentRecording = apiConfig.features?.consentRecording;
    if (navigator.doNotTrack === '1' || !apiConfig.ui.tracking?.url) {
      this.statisticsCategory.disabled = true;
    }
  }

  initConsent() {
    const settings = this.globalStorageService.getItem(
      STORAGE_KEYS.COOKIE_CONSENT
    );
    if (this.validateSettings(settings)) {
      this.consentSettings = settings;
    }
    this.loadLocalSettings();
    this.consentInitialized$.next(true);
    const event = new ConsentChangedEvent(
      this.categories,
      this.consentSettings
    );
    this.eventService.broadcast(event.type, event.payload);
  }

  /**
   * Loads consent settings from local storage.
   */
  loadLocalSettings() {
    const consentGiven = this.getConsentSettings().consentGiven;
    this.categories.forEach((item) => {
      item.consent = consentGiven[item.id] ?? item.consent;
    });
  }

  /**
   * Tells if the user still needs to give their consent.
   */
  consentRequired(): Observable<boolean> {
    return this.consentInitialized().pipe(
      switchMap(() => this.skipConsent$),
      map(
        (skip) =>
          !skip &&
          this.categories
            .filter((c) => !c.disabled)
            .some((c) => c.consent === undefined)
      )
    );
  }

  /** Returns an Observable which completes once consent has been initialized. */
  consentInitialized(): Observable<boolean> {
    return this.consentInitialized$.pipe(
      filter((i) => i),
      take(1)
    );
  }

  /**
   * Checks if the basic structure of the settings is valid.
   *
   * @param consentSettings
   */
  validateSettings(consentSettings: ConsentSettings) {
    return !!consentSettings?.consentGiven;
  }

  /**
   * Checks consent for a cookie category.
   *
   * @param categoryKey Key of the cookie category
   */
  consentGiven(categoryKey: StorageItemCategory) {
    return this.categoryMap.get(categoryKey)?.consent ?? false;
  }

  /**
   * Opens the cookie settings dialog.
   */
  openDialog() {
    const dialogRef = this.dialog.open(CookiesComponent, {
      width: '90%',
      maxWidth: '600px',
      data: { categories: this.categories, privacyUrl: this.privacyUrl },
    });
    dialogRef.disableClose = true;
    dialogRef.afterClosed().subscribe((res: ConsentGiven) => {
      this.updateConsentSettings(res);
    });
  }

  /**
   * Returns the current consent settings.
   */
  getConsentSettings(): ConsentSettings {
    return (
      this.consentSettings || {
        version: CONSENT_VERSION,
        timestamp: new Date(),
        consentGiven: {},
      }
    );
  }

  getInternalSettings(): CookieCategory[] {
    return this.categories;
  }

  /**
   * Updates consent settings locally and reports them to the backend if the
   * feature flag is set.
   *
   * @param consentGiven Consent values for each category
   */
  updateConsentSettings(consentGiven: ConsentGiven) {
    this.consentSettings = this.getConsentSettings();
    this.consentSettings.version = CONSENT_VERSION;
    this.consentSettings.timestamp = new Date();
    this.consentSettings.consentGiven = consentGiven;
    if (this.consentRecording?.enabled) {
      this.recordConsentSettings(this.consentSettings).subscribe(() => {
        const event = new ConsentChangedEvent(
          this.categories,
          this.consentSettings
        );
        this.eventService.broadcast(event.type, event.payload);
      });
    } else {
      const event = new ConsentChangedEvent(
        this.categories,
        this.consentSettings
      );
      this.eventService.broadcast(event.type, event.payload);
    }
  }

  /**
   * Reports the consent settings to the backend for record keeping.
   *
   * @param consentSettings Settings to report
   */
  recordConsentSettings(consentSettings: ConsentSettings) {
    const connectionUrl = this.buildUri('');
    return this.http
      .post<ConsentSettings>(connectionUrl, consentSettings, httpOptions)
      .pipe(
        catchError(this.handleError<ConsentSettings>('recordConsentSettings'))
      );
  }
}
