import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map, filter } from 'rxjs/operators';
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
  private memberships$ = new BehaviorSubject<Membership[]>(null);
  private userId: string;
  private changeSubscription: Subscription;

  constructor(
    private http: HttpClient,
    private wsConnector: WsConnectorService,
    public eventService: EventService,
    authenticationService: AuthenticationService) {
      super();
      authenticationService.watchUser.subscribe(user => {
        if (this.changeSubscription) {
          this.changeSubscription.unsubscribe();
        }
        this.memberships$.next(null);
        if (!user) {
          this.userId = null;
          return;
        }
        this.userId = user.id;
        /* Reset cached membership data based on server-side events. */
        this.changeSubscription = this.getMembershipChangesStream(user.id)
            .subscribe(() => this.memberships$.next(null));
      });
      /* Reset cached membership data based on client-side events. */
      this.eventService.on<any>('RoomDeleted')
          .subscribe(() => this.memberships$.next(null));
      this.eventService.on<any>('RoomCreated')
          .subscribe(() => this.memberships$.next(null));
  }

  /**
   * Loads the user's membership data from the backend and passes them to
   * subscribers.
   */
  loadMemberships() {
    this.http.get<Membership[]>(this.apiUrl.base + this.apiUrl.membershipByUser + '/' + this.userId)
        .subscribe(memberships => this.memberships$.next(memberships));
  }

  /**
   * Get the user's membership data as an Observable.
   *
   * Data might be fetched from local in-memory cache if available.
   */
  getMembershipChanges(): Observable<Membership[]> {
    if (this.userId && !this.memberships$.getValue()) {
      this.loadMemberships();
    }

    /* Do not expose Subject interface. Subject#next() should not be callable
     * outside of this service. */
    return this.memberships$.asObservable();
  }

  /**
   * Get the user's membership for a room.
   */
  getMembershipByRoom(roomShortId: string): Observable<Membership> {
    return this.getMembershipChanges().pipe(
        filter(memberships => !!memberships), // membership can be null
        map(memberships => memberships.filter(m => m.roomShortId === roomShortId)),
        map(memberships => memberships[0])
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
