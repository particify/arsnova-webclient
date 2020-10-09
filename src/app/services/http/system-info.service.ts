import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseHttpService } from './base-http.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../util/notification.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Accept': 'application/vnd.spring-boot.actuator.v2+json,application/json'
  })
};

export interface SummarizedStats {
  connectedUsers: number;
  users: number;
  rooms: number;
  answers: number;
  comments: number;
}

@Injectable()
export class SystemInfoService extends BaseHttpService {

  serviceApiUrl = {
    health: '/health',
    management: '/management',
    summarizedStats: '/_system/summarizedstats',
    serviceStats: '/_system/servicestats'
  };

  constructor(private http: HttpClient,
              protected translateService: TranslateService,
              protected notificationService: NotificationService) {
    super(translateService, notificationService);
  }

  getHealthInfo(): Observable<any> {
    const connectionUrl = this.apiUrl.base + this.serviceApiUrl.management + this.serviceApiUrl.health;
    /* Do not use default error handling here - 503 is expected if system health is not OK. */
    return this.http.get<any>(connectionUrl, httpOptions);
  }

  getSummarizedStats(): Observable<SummarizedStats> {
    const connectionUrl = this.apiUrl.base + this.serviceApiUrl.summarizedStats;
    return this.http.get<SummarizedStats>(connectionUrl, httpOptions).pipe(
      catchError(this.handleError<SummarizedStats>('getSummarizedStats'))
    );
  }

  getServiceStats(): Observable<Map<String, any>> {
    const connectionUrl = this.apiUrl.base + this.serviceApiUrl.serviceStats;
    return this.http.get<Map<String, any>>(connectionUrl, httpOptions).pipe(
      catchError(this.handleError<Map<String, any>>('getServiceStats'))
    );
  }
}
