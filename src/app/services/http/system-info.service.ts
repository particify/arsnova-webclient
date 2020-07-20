import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseHttpService } from './base-http.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Accept': 'application/vnd.spring-boot.actuator.v2+json,application/json'
  })
};

@Injectable()
export class SystemInfoService extends BaseHttpService {
  private apiUrl = {
    base: '/api/management',
    health: '/health',
    stats: '/stats'
  };

  constructor(private http: HttpClient) {
    super();
  }

  getHealthInfo(): Observable<any> {
    const connectionUrl = this.apiUrl.base + this.apiUrl.health;
    return this.http.get<any>(connectionUrl, httpOptions).pipe(
      catchError(this.handleError<any>('getHealth'))
    );
  }

  getStats(): Observable<any> {
    const connectionUrl = this.apiUrl.base + this.apiUrl.stats;
    return this.http.get<any>(connectionUrl, httpOptions).pipe(
      catchError(this.handleError<any>('getHealth'))
    );
  }
}
