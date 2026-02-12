import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AbstractHttpService } from './abstract-http.service';
import { SystemHealth } from '@app/admin/_models/system-health';
import { WebsocketStats } from '@app/admin/_models/websocket-stats';

const httpOptions = {
  headers: new HttpHeaders({
    Accept: 'application/json',
  }),
};

@Injectable()
export class SystemInfoService extends AbstractHttpService<void> {
  serviceApiUrl = {
    health: '/health',
    management: '/management',
    core3Stats: '/management/stats',
    websocket: '/websocket',
  };

  constructor() {
    super('');
  }

  getHealthInfo(): Observable<SystemHealth> {
    const connectionUrl =
      this.apiUrl.base +
      this.serviceApiUrl.management +
      this.serviceApiUrl.health;
    /* Do not use default error handling here - 503 is expected if system health is not OK. */
    return this.http.get<SystemHealth>(connectionUrl, httpOptions);
  }

  getCore3Stats(tenantId?: string): Observable<{ [key: string]: any }> {
    let connectionUrl = this.apiUrl.base + this.serviceApiUrl.core3Stats;
    if (tenantId) {
      connectionUrl += '?tenantId=' + tenantId;
    }
    return this.http
      .get<Map<string, any>>(connectionUrl, httpOptions)
      .pipe(catchError(this.handleError<Map<string, any>>('getCore3Stats')));
  }

  getConnectedUserCount(): Observable<number> {
    const connectionUrl =
      this.apiUrl.base +
      this.serviceApiUrl.management +
      this.serviceApiUrl.websocket;
    return this.http.get<WebsocketStats>(connectionUrl, httpOptions).pipe(
      map((s) => s.webSocketUserCount),
      catchError(this.handleError<number>('getConnectedUserCount'))
    );
  }
}
