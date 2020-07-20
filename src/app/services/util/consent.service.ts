import { Injectable, EventEmitter } from '@angular/core';
import { BaseHttpService } from '../http/base-http.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { ApiConfigService } from '../http/api-config.service';
import { MatDialog } from '@angular/material/dialog';
import { CookiesComponent } from 'app/components/home/_dialogs/cookies/cookies.component';
import { StorageItemCategory } from 'app/models/storage';

export const CONSENT_VERSION = 1;

export interface ConsentGiven {
  [key: string]: boolean
}

export interface CookieCategory {
  key: StorageItemCategory,
  id: string,
  required: boolean
  consent: boolean
}

export interface ConsentSettings {
  id?: string,
  version: number
  timestamp: Date
  consentGiven: { [key: string]: boolean }
}

export interface ConsentChangeEvent {
  categoriesSettings: CookieCategory[],
  consentSettings?: ConsentSettings
}

const httpOptions = {
  headers: new HttpHeaders({})
};

@Injectable()
export class ConsentService extends BaseHttpService {
  private readonly categories: CookieCategory[] = [
    {key: StorageItemCategory.REQUIRED, id: 'essential', consent: true, required: true},
    {key: StorageItemCategory.FUNCTIONAL, id: 'functional', consent: false, required: false},
    {key: StorageItemCategory.STATISTICS, id: 'statistics', consent: false, required: false}
  ];
  private readonly categoryMap: Map<StorageItemCategory, CookieCategory> = this.categories.reduce((map, category) => {
    map.set(category.key, category);
    return map;
  }, new Map());
  private consentSettings: ConsentSettings;

  private apiUrl = {
    base: '/api',
    consent: '/consent'
  };

  private settingsChanged: EventEmitter<ConsentChangeEvent> = new EventEmitter();

  constructor(
    public dialog: MatDialog,
    private http: HttpClient,
    private config: ApiConfigService
  ) {
    super();
  }

  init(consentSettings: ConsentSettings) {
    if (this.validateSettings(consentSettings)) {
      this.consentSettings = consentSettings;
    }
    this.loadLocalSettings();
  }

  /**
   * Loads consent settings from local storage.
   */
  loadLocalSettings() {
    const consentGiven = this.getConsentSettings().consentGiven;
    this.categories.forEach(item => {
      item.consent = consentGiven[item.id] ?? item.consent;
    })
  }

  /**
   * Tells if the user still needs to give their consent.
   */
  consentRequired() {
    return !this.consentSettings || this.consentSettings.version !== CONSENT_VERSION ;
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
   * Subscribes to changes in consent settings.
   */
  subscribeToChanges(callback: (event: ConsentChangeEvent) => void) {
    return this.settingsChanged.subscribe(callback);
  }

  /**
   * Opens the cookie settings dialog.
   */
  openDialog() {
    const dialogRef = this.dialog.open(CookiesComponent, {
      width: '600px',
      autoFocus: true,
      data: this.categories
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
    return this.consentSettings || {
      version: CONSENT_VERSION,
      timestamp: new Date(),
      consentGiven: {}
    };
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
    const consentRecording = this.config.getFeatureConfig('consentRecording');
    if (consentRecording?.enabled) {
      this.recordConsentSettings(this.consentSettings).subscribe((persistedConsentSettings) => {
        this.settingsChanged.emit({categoriesSettings: this.categories, consentSettings: this.consentSettings});
      });
    } else {
      this.settingsChanged.emit({categoriesSettings: this.categories, consentSettings: this.consentSettings});
    }
  }

  /**
   * Reports the consent settings to the backend for record keeping.
   *
   * @param consentSettings Settings to report
   */
  recordConsentSettings(consentSettings: ConsentSettings) {
    const connectionUrl = this.apiUrl.base + this.apiUrl.consent;
    return this.http.post<ConsentSettings>(connectionUrl, consentSettings, httpOptions).pipe(
      catchError(this.handleError<ConsentSettings>('recordConsentSettings'))
    );
  }
}
