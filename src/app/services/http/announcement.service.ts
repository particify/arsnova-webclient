import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { catchError, first, Observable } from 'rxjs';
import { Announcement } from '../../models/announcement';
import { AnnouncementState } from '../../models/announcement-state';
import { UserAnnouncement } from '../../models/user-announcement';
import { EventService } from '../util/event.service';
import { NotificationService } from '../util/notification.service';
import { AbstractHttpService } from './abstract-http.service';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService extends AbstractHttpService<Announcement> {
  constructor(
    private http: HttpClient,
    protected eventService: EventService,
    protected translateService: TranslateService,
    protected notificationService: NotificationService
  ) {
    super(
      '/announcement',
      http,
      eventService,
      translateService,
      notificationService
    );
  }

  add(roomId: string, title: string, body: string): Observable<Announcement> {
    const url = this.buildUri('/', roomId);
    const announcement = new Announcement(roomId, title, body);
    return this.http
      .post<Announcement>(url, announcement)
      .pipe(
        catchError(
          this.handleError<Announcement>(`Add announcement: ${announcement}`)
        )
      );
  }

  update(
    roomId: string,
    id: string,
    title: string,
    body: string
  ): Observable<Announcement> {
    const url = this.buildUri(`/${id}`, roomId);
    const changes = {
      title: title,
      body: body,
    };
    return this.http
      .patch<Announcement>(url, changes)
      .pipe(
        catchError(
          this.handleError<Announcement>(`Patch announcement with id: ${id}`)
        )
      );
  }

  delete(roomId: string, id: string): Observable<Announcement> {
    const url = this.buildUri(`/${id}`, roomId);
    return this.http
      .delete<Announcement>(url)
      .pipe(
        catchError(
          this.handleError<Announcement>(`Delete announcement with id: ${id}`)
        )
      );
  }

  getByRoomId(roomId: string): Observable<Announcement[]> {
    const url = this.buildUri('/', roomId);
    return this.http
      .get<Announcement[]>(url)
      .pipe(
        first(),
        catchError(
          this.handleError<Announcement[]>('Get announcements by room id')
        )
      );
  }

  getByUserId(userId: string): Observable<UserAnnouncement[]> {
    const url = this.buildForeignUri(`/user/${userId}${this.uriPrefix}`);
    return this.http
      .post<UserAnnouncement[]>(url, null)
      .pipe(
        first(),
        catchError(
          this.handleError<UserAnnouncement[]>('Get announcements by user id')
        )
      );
  }

  getStateByUserId(userId: string): Observable<AnnouncementState> {
    const url = this.buildForeignUri(`/user/${userId}${this.uriPrefix}/state`);
    return this.http
      .get<AnnouncementState>(url)
      .pipe(
        first(),
        catchError(
          this.handleError<AnnouncementState>(
            'Get announcement state by user id'
          )
        )
      );
  }
}
