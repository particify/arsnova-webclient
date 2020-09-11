import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseHttpService } from './base-http.service';
import { ApiConfig, AuthenticationProvider, Feature } from '../../models/api-config';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../util/notification.service';
import { shareReplay } from 'rxjs/operators';

@Injectable()
export class ApiConfigService extends BaseHttpService {
  private readonly apiUris = {
    /* TODO: API base URI should be injected. */
    base: '/api',
    configPart: '/configuration',
    get config() {
      return this.base + this.configPart;
    }
  };
  private readonly config$: Observable<ApiConfig>;
  private config: ApiConfig;

  constructor(private http: HttpClient,
              protected translateService: TranslateService,
              protected notificationService: NotificationService) {
    super(translateService, notificationService);
    this.config$ = this.http.get<ApiConfig>(this.apiUris.config).pipe(shareReplay(1));
    this.config = new ApiConfig([], {}, {});
    this.freezeRecursively(this.config);
  }

  load() {
    console.log('Loading API configuration...');
    this.config$.subscribe((config) => {
      config.authenticationProviders.sort((p1, p2) => {
        return p1.order < p2.order ? -1 : p1.order > p2.order ? 1 : 0;
      });
      this.freezeRecursively(config);
      this.config = config;
      console.log('API configuration loaded.');
    });
  }

  getApiConfig$(): Observable<ApiConfig> {
    return this.config$;
  }

  getAuthProviders(): AuthenticationProvider[] {
    return this.config.authenticationProviders;
  }

  getFeatureConfig(feature: string): Feature {
    return this.config.features[feature];
  }

  private freezeRecursively(obj: object) {
    /* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze */
    if (Object.freeze) {
      const propNames = Object.getOwnPropertyNames(obj);

      /* Freeze properties before freezing self */
      for (const name of propNames) {
        const value = obj[name];
        obj[name] = value && typeof value === 'object'
          ? this.freezeRecursively(value) : value;
      }
    }

    return Object.freeze(obj);
  }
}
