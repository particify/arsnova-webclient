import { Injectable } from '@angular/core';
import { ContentGroup } from '../../models/content-group';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';
import { BaseHttpService } from './base-http.service';
import { EventService } from '../util/event.service';

const httpOptions = {
  headers: new HttpHeaders({})
};

@Injectable()
export class ContentGroupService extends BaseHttpService {
  private apiUrl = {
    base: '/api',
    rooms: '/room',
    user: '/user',
    findRooms: '/find',
    stats: '/stats'
  };

  constructor(
    private http: HttpClient,
    private eventService: EventService,
    private authService: AuthenticationService
  ) {
    super();
  }

  getByRoomIdAndName(roomId: string, name: string): Observable<ContentGroup> {
    const encodedName = encodeURIComponent(name);
    const connectionUrl = `${this.apiUrl.base + this.apiUrl.rooms}/${roomId}/${encodedName}`;
    return this.http.get<ContentGroup>(connectionUrl, httpOptions).pipe(
      tap(_ => ''),
      catchError(this.handleError<ContentGroup>(`getByRoomIdAndName, ${roomId}, ${name}`))
    );
  }

}
