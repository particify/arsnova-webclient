import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseHttpService } from './base-http.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../util/notification.service';
import { EventService } from '../util/event.service';

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
  private apiUrl = {
    base: '/api',
    health: '/management/core/health',
    summarizedStats: '/_system/summarizedstats',
    serviceStats: '/_system/servicestats'
  };

  constructor(private http: HttpClient,
              protected eventService: EventService,
              protected translateService: TranslateService,
              protected notificationService: NotificationService) {
    super(eventService, translateService, notificationService);
  }

  getHealthInfo(): Observable<any> {
    const connectionUrl = this.apiUrl.base + this.apiUrl.health;
    /* Do not use default error handling here - 503 is expected if system health is not OK. */
    return this.http.get<any>(connectionUrl, httpOptions);
  }

  getSummarizedStats(): Observable<SummarizedStats> {
    const connectionUrl = this.apiUrl.base + this.apiUrl.summarizedStats;
    return this.http.get<SummarizedStats>(connectionUrl, httpOptions).pipe(
      catchError(this.handleError<SummarizedStats>('getSummarizedStats'))
    );
  }

  getServiceStats(): Observable<Map<String, any>> {
    const connectionUrl = this.apiUrl.base + this.apiUrl.serviceStats;
    return this.http.get<Map<String, any>>(connectionUrl, httpOptions).pipe(
      catchError(this.handleError<Map<String, any>>('getServiceStats'))
    );
  }
}
