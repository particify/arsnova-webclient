import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommentSettings } from '../../models/comment-settings';
import { catchError, tap } from 'rxjs/operators';
import { BaseHttpService } from './base-http.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../util/notification.service';
import { EventService } from '../util/event.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class CommentSettingsService extends BaseHttpService {
  private apiUrl = {
    base: '/api',
    settings: '/settings',
  };

  constructor(private http: HttpClient,
              protected eventService: EventService,
              protected translateService: TranslateService,
              protected notificationService: NotificationService) {
    super(eventService, translateService, notificationService);
  }

  get(id: string): Observable<CommentSettings> {
    const connectionUrl = `${this.apiUrl.base}${this.apiUrl.settings}/${id}`;
    return this.http.get<CommentSettings>(connectionUrl, httpOptions).pipe(
      tap(_ => ''),
      catchError(this.handleError<CommentSettings>('addComment'))
    );
  }

  add(settings: CommentSettings): Observable<CommentSettings> {
    const connectionUrl = this.apiUrl.base + this.apiUrl.settings + '/';
    return this.http.post<CommentSettings>(
      connectionUrl,
      settings,
      httpOptions
    ).pipe(
      tap(_ => ''),
      catchError(this.handleError<CommentSettings>('addCommentSettings'))
    );
  }

  update(settings: CommentSettings): Observable<CommentSettings> {
    const connectionUrl = this.apiUrl.base + '/' + settings.roomId + this.apiUrl.settings + '/' + settings.roomId;
    return this.http.put(connectionUrl, settings, httpOptions).pipe(
      tap(_ => ''),
      catchError(this.handleError<any>('updateCommentSettings'))
    );
  }
}
