import { Injectable } from '@angular/core';
import { BaseHttpService } from './base-http.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventService } from '../util/event.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../util/notification.service';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class FeedbackService extends BaseHttpService {

  serviceApiUrl = {
    survey: '/survey'
  };

  constructor(
      private http: HttpClient,
      protected eventService: EventService,
      protected translateService: TranslateService,
      protected notificationService: NotificationService
  ) {
    super(eventService, translateService, notificationService);
  }

  get(roomId: string): Observable<number[]> {
    const connectionUrl = `${this.getBaseUrl(roomId) + this.serviceApiUrl.survey}`;
    return this.http.get<number[]>(connectionUrl, httpOptions).pipe(
      tap(_ => ''),
      catchError(this.handleError<number[]>('get survey'))
    );
  }
}
