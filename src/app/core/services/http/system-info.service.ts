import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AbstractHttpService } from './abstract-http.service';
import { TranslocoService } from '@jsverse/transloco';
import { NotificationService } from '@app/core/services/util/notification.service';
import { EventService } from '@app/core/services/util/event.service';
import { SystemHealth } from '@app/admin/_models/system-health';

const httpOptions = {
  headers: new HttpHeaders({
    Accept: 'application/vnd.spring-boot.actuator.v2+json,application/json',
  }),
};

export interface SummarizedStats {
  connectedUsers: number;
  users: number;
  rooms: number;
  answers: number;
  comments: number;
}

@Injectable()
export class SystemInfoService extends AbstractHttpService<void> {
  private http: HttpClient;
  protected eventService: EventService;
  protected translateService: TranslocoService;
  protected notificationService: NotificationService;

  serviceApiUrl = {
    health: '/health',
    management: '/management/core',
    summarizedStats: '/_system/summarizedstats',
    serviceStats: '/_system/servicestats',
  };

  constructor() {
    const http = inject(HttpClient);
    const eventService = inject(EventService);
    const translateService = inject(TranslocoService);
    const notificationService = inject(NotificationService);

    super('', http, eventService, translateService, notificationService);

    this.http = http;
    this.eventService = eventService;
    this.translateService = translateService;
    this.notificationService = notificationService;
  }

  getHealthInfo(): Observable<SystemHealth> {
    const connectionUrl =
      this.apiUrl.base +
      this.serviceApiUrl.management +
      this.serviceApiUrl.health;
    /* Do not use default error handling here - 503 is expected if system health is not OK. */
    return this.http.get<SystemHealth>(connectionUrl, httpOptions);
  }

  getSummarizedStats(): Observable<SummarizedStats> {
    const connectionUrl = this.apiUrl.base + this.serviceApiUrl.summarizedStats;
    return this.http
      .get<SummarizedStats>(connectionUrl, httpOptions)
      .pipe(
        catchError(this.handleError<SummarizedStats>('getSummarizedStats'))
      );
  }

  getServiceStats(tenantId?: string): Observable<{ [key: string]: any }> {
    let connectionUrl = this.apiUrl.base + this.serviceApiUrl.serviceStats;
    if (tenantId) {
      connectionUrl += '?tenantId=' + tenantId;
    }
    return this.http
      .get<Map<string, any>>(connectionUrl, httpOptions)
      .pipe(catchError(this.handleError<Map<string, any>>('getServiceStats')));
  }
}
