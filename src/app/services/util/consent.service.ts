import { Injectable } from '@angular/core';
import { GlobalStorageService, STORAGE_KEYS } from './global-storage.service';
import { DialogService } from './dialog.service';
import { BaseHttpService } from '../http/base-http.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { ApiConfigService } from '../http/api-config.service';

export const CONSENT_VERSION = 1;

export interface ConsentGiven {
  [key: string]: boolean
}

export interface CookieCategory {
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

const httpOptions = {
  headers: new HttpHeaders({})
};

@Injectable()
export class ConsentService extends BaseHttpService {
  private readonly categories: CookieCategory[] = [
    {id: 'essential', consent: true, required: true},
    {id: 'functional', consent: false, required: false},
    {id: 'statistics', consent: false, required: false}
  ];

  private apiUrl = {
    base: '/api',
    consent: '/consent'
  };

  constructor(
    private globalStorageService: GlobalStorageService,
    private dialogService: DialogService,
    private http: HttpClient,
    private config: ApiConfigService
  ) {
    super();
  }

  /**
   * Tells if the user still needs to give their consent.
   */
  consentRequired() {
    return !this.globalStorageService.getItem(STORAGE_KEYS.COOKIE_CONSENT);
  }

  /**
   * Opens the cookie settings dialog.
   */
  openDialog() {
    const dialogRef = this.dialogService.openCookieDialog(this.categories);
    dialogRef.disableClose = true;
    dialogRef.afterClosed().subscribe((res: ConsentGiven) => {
      this.updateConsentSettings(res);
    });
  }

  /**
   * Returns the current consent settings.
   */
  getConsentSettings(): ConsentSettings {
    const consentSettings = this.globalStorageService.getItem(STORAGE_KEYS.COOKIE_CONSENT);
    return consentSettings || {
      version: CONSENT_VERSION,
      timestamp: new Date(),
      consentGiven: {}
    };
  }

  /**
   * Updates consent settings locally and reports them to the backend if the
   * feature flag is set.
   *
   * @param consentGiven Consent values for each category
   */
  updateConsentSettings(consentGiven: ConsentGiven) {
    const consentSettings: ConsentSettings = this.getConsentSettings();
    consentSettings.timestamp = new Date();
    consentSettings.consentGiven = consentGiven;
    const consentRecording = this.config.getFeatureConfig('consentRecording');
    if (consentRecording?.enabled) {
      this.recordConsentSettings(consentSettings).subscribe((persistedConsentSettings) => {
        this.globalStorageService.setItem(STORAGE_KEYS.COOKIE_CONSENT, persistedConsentSettings);
      });
    } else {
      this.globalStorageService.setItem(STORAGE_KEYS.COOKIE_CONSENT, consentSettings);
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
