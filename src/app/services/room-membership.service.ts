import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, shareReplay, skip, switchAll, takeUntil } from 'rxjs/operators';
import { IMessage } from '@stomp/stompjs';
import { BaseHttpService } from './http/base-http.service';
import { WsConnectorService } from './websockets/ws-connector.service';
import { AuthenticationService } from './http/authentication.service';
import { EventService } from './util/event.service';
import { Membership } from '../models/membership';
import { UserRole } from '../models/user-roles.enum';

/**
 * This service provides utility methods which handle or provide information
 * about the user's authorization for rooms.
 */
@Injectable()
export class RoomMembershipService extends BaseHttpService {
  private apiUrl = {
    base: '/api',
    membershipByUser: '/_view/membership/by-user',
    membershipByUserAndRoom: '/_view/membership/by-user-and-room'
  };
  private memberships$$ = new BehaviorSubject<Observable<Membership[]>>(of([]));

  constructor(
    private http: HttpClient,
    private wsConnector: WsConnectorService,
    public eventService: EventService,
    private authenticationService: AuthenticationService) {
      super();
      const authChanged$ = authenticationService.getAuthenticationChanges().pipe(skip(1));
      authenticationService.getAuthenticationChanges().subscribe(auth => {
        if (!auth) {
          return;
        }
        this.loadMemberships(auth.userId);
        /* Reset cached membership data based on server-side events. */
        this.getMembershipChangesStream(auth.userId).pipe(
            takeUntil(authChanged$)
        ).subscribe(() => this.loadMemberships(auth.userId));
        /* Reset cached membership data based on client-side events. */
        this.eventService.on<any>('RoomDeleted').pipe(
            takeUntil(authChanged$),
        ).subscribe(() => this.loadMemberships(auth.userId));
        this.eventService.on<any>('RoomCreated').pipe(
            takeUntil(authChanged$),
        ).subscribe(() => this.loadMemberships(auth.userId));
      });
  }

  /**
   * Creates an replayable, multicastable Observable for loading the user's
   * membership data from the backend and emits it them to subscribers.
   */
  private loadMemberships(userId: string) {
    const memberships$ = this.http.get<Membership[]>(this.apiUrl.base + this.apiUrl.membershipByUser + '/' + userId)
        .pipe(shareReplay());
    this.memberships$$.next(memberships$);

    return memberships$;
  }

  /**
   * Get the user's membership data as an Observable.
   *
   * Data might be fetched from local in-memory cache if available.
   */
  getMembershipChanges(): Observable<Membership[]> {
    return this.memberships$$.pipe(switchAll());
  }

  /**
   * Get the user's membership for a room.
   */
  getMembershipByRoom(roomShortId: string): Observable<Membership> {
    return this.getMembershipChanges().pipe(
        map(memberships => memberships.filter(m => m.roomShortId === roomShortId)),
        map(memberships => memberships.length > 0 ? memberships[0] : new Membership())
    );
  }

  /**
   * Get the user's primary (most powerful) role for a room.
   */
  getPrimaryRoleByRoom(roomShortId: string): Observable<UserRole> {
    return this.getMembershipByRoom(roomShortId).pipe(
        map(m => m.roles.reduce(
            (acc, value) => this.isRoleSubstitutable(value, acc) ? value : acc,
            UserRole.PARTICIPANT)),
    );
  }

  /**
   * Checks if the user has the exact given role for the given room.
   */
  hasRoleForRoom(roomShortId: string, role: UserRole): Observable<boolean> {
    return this.getMembershipByRoom(roomShortId).pipe(
        map(membership => membership.roles.indexOf(role) !== -1)
    );
  }

  /**
   * Checks if the user has the permissions of the given role for the given
   * room.
   */
  hasAccessForRoom(roomShortId: string, requestedRole: UserRole): Observable<boolean> {
    return this.getMembershipByRoom(roomShortId).pipe(
        map(membership => membership.roles.some(r => this.isRoleSubstitutable(r, requestedRole)))
    );
  }

  /**
   * Checks if the first given role's permissions are a superset of the
   * substitution role's.
   */
  isRoleSubstitutable(checkedRole: UserRole, substitution: UserRole) {
    if (checkedRole === substitution) {
      return true;
    }
    switch (checkedRole) {
      case UserRole.CREATOR:
        return true;
      case UserRole.EDITING_MODERATOR:
        return [UserRole.EXECUTIVE_MODERATOR, UserRole.PARTICIPANT].indexOf(substitution) !== -1;
      case UserRole.EXECUTIVE_MODERATOR:
        return substitution === UserRole.PARTICIPANT;
      default:
        return false;
    }
  }

  /**
   * Returns an Observable which informs about server-side membership changes.
   */
  getMembershipChangesStream(userId: string): Observable<IMessage> {
    return this.wsConnector.getWatcher(`/topic/${userId}.room-membership.changes.stream`);
  }
}
