import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Moderator } from '@app/core/models/moderator';
import { catchError } from 'rxjs/operators';
import { AbstractHttpService } from './abstract-http.service';
import { TranslocoService } from '@jsverse/transloco';
import { NotificationService } from '@app/core/services/util/notification.service';
import { EventService } from '@app/core/services/util/event.service';
import { UserRole } from '@app/core/models/user-roles.enum';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable()
export class ModeratorService extends AbstractHttpService<Moderator> {
  private http: HttpClient;
  protected eventService: EventService;
  protected translateService: TranslocoService;
  protected notificationService: NotificationService;

  constructor() {
    const http = inject(HttpClient);
    const eventService = inject(EventService);
    const translateService = inject(TranslocoService);
    const notificationService = inject(NotificationService);

    super(
      '/moderator',
      http,
      eventService,
      translateService,
      notificationService
    );

    this.http = http;
    this.eventService = eventService;
    this.translateService = translateService;
    this.notificationService = notificationService;
  }

  get(roomId: string): Observable<Moderator[]> {
    const url = this.buildUri('', roomId);
    return this.http
      .get<Moderator[]>(url, httpOptions)
      .pipe(catchError(this.handleError<Moderator[]>('getModerator')));
  }

  add(roomId: string, userId: string, role: UserRole) {
    const url = this.buildUri(`/${userId}?role=${role}`, roomId);
    return this.http
      .put(url, {}, httpOptions)
      .pipe(catchError(this.handleError('addModerator')));
  }

  delete(roomId: string, userId: string): Observable<Moderator> {
    const url = this.buildUri(`/${userId}`, roomId);
    return this.http
      .delete<Moderator>(url, httpOptions)
      .pipe(catchError(this.handleError<Moderator>('deleteModerator')));
  }
}
