import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Moderator } from '@app/core/models/moderator';
import { catchError } from 'rxjs/operators';
import { AbstractHttpService } from './abstract-http.service';
import { UserRole } from '@app/core/models/user-roles.enum';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable()
export class ModeratorService extends AbstractHttpService<Moderator> {
  constructor() {
    super('/moderator');
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
