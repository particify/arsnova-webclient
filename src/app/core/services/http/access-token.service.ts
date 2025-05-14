import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { AbstractHttpService } from './abstract-http.service';
import { UserRole } from '@app/core/models/user-roles.enum';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable()
export class AccessTokenService extends AbstractHttpService<void> {
  serviceApiUrl = {
    invite: '/invite',
  };

  constructor() {
    super('/access-token');
  }

  invite(roomId: string, role: UserRole, loginId: string) {
    const url = this.buildUri(this.serviceApiUrl.invite, roomId);
    const body = {
      role: role,
      emailAddress: loginId,
    };
    return this.http
      .post<any>(url, body, httpOptions)
      .pipe(catchError(this.handleError<any>('invite')));
  }
}
