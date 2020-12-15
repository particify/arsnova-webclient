import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseHttpService } from './base-http.service';
import { ApiConfig } from '../../models/api-config';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../util/notification.service';
import { map, shareReplay, tap } from 'rxjs/operators';
import { EventService } from '../util/event.service';
import * as dayjs from 'dayjs';

@Injectable()
export class ApiConfigService extends BaseHttpService {
  private readonly serviceApiUrl = {
    config: '/configuration'
  };
  private config$: Observable<ApiConfig>;
  private cacheExpiry: dayjs.Dayjs = dayjs();

  constructor(private http: HttpClient,
              protected eventService: EventService,
              protected translateService: TranslateService,
              protected notificationService: NotificationService) {
    super(eventService, translateService, notificationService);
  }

  getApiConfig$(): Observable<ApiConfig> {
    if (this.cacheExpiry.isBefore(dayjs())) {
      this.cacheExpiry = dayjs().add(1, 'h');
      this.config$ = this.load$();
    }
    return this.config$;
  }

  private load$() {
    console.log('Loading API configuration...');
    return this.http.get<ApiConfig>(this.getBaseUrl() + this.serviceApiUrl.config).pipe(
        tap(() => console.log('API configuration loaded.')),
        map((config) => {
          config.authenticationProviders.sort((p1, p2) => {
            return p1.order < p2.order ? -1 : p1.order > p2.order ? 1 : 0;
          });
          /* Lists in the UI config are currently serialized as objects instead of arrays,
           * so they are converted here for easier handling. */
          this.convertNestedListObjectsToArrays(config.ui);
          this.freezeRecursively(config);
          return config;
        }),
        shareReplay()
    );
  }

  /**
   * Converts array-like objects to real arrays so array methods can be used.
   * Example: {"0": "val0", "1": "val1", "2": {"0": "nestedVal"}} => ["val0", "val1", ["nestedVal"]]
   */
  private convertNestedListObjectsToArrays(value: any): any {
    if (Array.isArray(value)) {
      const arr = value as any[];
      return arr.map(item => this.convertNestedListObjectsToArrays(item));
    } else if (typeof value === 'object') {
      const obj = value as object;
      for (const [name, objValue] of Object.entries(obj)) {
        obj[name] = objValue && this.convertNestedListObjectsToArrays(objValue);
      }

      return this.convertListObjectToArray(obj);
    }

    return value;
  }

  private convertListObjectToArray(obj: object): object|any[] {
    return Object.keys(obj).some(k => parseInt(k, 10).toString() !== k)
        ? obj
        : Object.values(obj);
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
