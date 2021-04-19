import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { first, map, shareReplay, skip, switchAll, takeUntil, tap } from 'rxjs/operators';
import { IMessage } from '@stomp/stompjs';
import { AbstractHttpService } from './http/abstract-http.service';
import { WsConnectorService } from './websockets/ws-connector.service';
import { AuthenticationService, AUTH_HEADER_KEY, AUTH_SCHEME } from './http/authentication.service';
import { EventService } from './util/event.service';
import { Membership } from '../models/membership';
import { UserRole } from '../models/user-roles.enum';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from './util/notification.service';
import { ClientAuthentication } from '../models/client-authentication';
import { Room } from '../models/room';
import { MembershipsChanged } from '../models/events/memberships-changed';

/**
 * This service provides utility methods which handle or provide information
 * about the user's authorization for rooms.
 */
@Injectable()
export class RoomMembershipService extends AbstractHttpService<Membership> {

  serviceApiUrl = {
    byUser: '/by-user'
  };

  private memberships$$ = new BehaviorSubject<Observable<Membership[]>>(of([]));
  private newOwnerships: Membership[] = [];

  constructor(
    private http: HttpClient,
    private wsConnector: WsConnectorService,
    public eventService: EventService,
    private authenticationService: AuthenticationService,
    protected translateService: TranslateService,
    protected notificationService: NotificationService) {
    super('/_view/membership', http, eventService, translateService, notificationService);
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
        ).subscribe(e => this.addOwnership(e.id, e.shortId));
        this.eventService.on<any>('MembershipsChanged').pipe(
            takeUntil(authChanged$),
        ).subscribe(() => this.loadMemberships(auth.userId));
      });
  }

  /**
   * Creates an replayable, multicastable Observable for loading the user's
   * membership data from the backend and emits it them to subscribers.
   */
  private loadMemberships(userId: string) {
    const memberships$ = this.fetchMemberships(userId).pipe(
        tap(() => this.newOwnerships = []),
        tap(memberships => memberships.forEach(m => m.primaryRole = this.selectPrimaryRole(m.roles))),
        shareReplay(),
        map(memberships => memberships.concat(this.newOwnerships))
    );
    this.memberships$$.next(memberships$);

    return memberships$;
  }

  /**
   * Creates an Observable for requesting room memberships of a user.
   */
  private fetchMemberships(userId: string, token?: string): Observable<Membership[]> {
    const url = this.buildUri(this.serviceApiUrl.byUser + '/' + userId);
    const httpHeaders = token ? new HttpHeaders().set(AUTH_HEADER_KEY, `${AUTH_SCHEME} ${token}`) : null;
    return this.http.get<Membership[]>(url, { headers: httpHeaders }).pipe(
        tap(memberships => memberships.forEach(m => m.primaryRole = this.selectPrimaryRole(m.roles)))
    );
  }

  /**
   * Adds a membership with owner role for a newly created room.
   *
   * @param roomId the owned room
   */
  private addOwnership(roomId: string, roomShortId: string) {
    const membership = new Membership();
    membership.roomId = roomId;
    membership.roomShortId = roomShortId;
    membership.roles = [UserRole.CREATOR];
    membership.primaryRole = UserRole.CREATOR;
    this.newOwnerships.push(membership);
  }

  /**
   * Returns the changes to user's memberships as a stream.
   *
   * Data might be fetched from local in-memory cache if available.
   */
  getMembershipChanges(): Observable<Membership[]> {
    return this.memberships$$.pipe(switchAll());
  }

  /**
   * Returns the user's current memberships.
   */
  getCurrentMemberships(): Observable<Membership[]> {
    return this.memberships$$.pipe(switchAll(), first());
  }

  /**
   * Returns the guest user's current memberships.
   */
  getMembershipsForAuthentication(authentication: ClientAuthentication): Observable<Membership[]> {
    return this.fetchMemberships(authentication.userId, authentication.token);
  }

  /**
   * Returns the user's membership for a room.
   */
  getMembershipByRoom(roomShortId: string): Observable<Membership> {
    return this.getCurrentMemberships().pipe(
        map(memberships => memberships.filter(m => m.roomShortId === roomShortId)),
        map(memberships => memberships.length > 0 ? memberships[0] : new Membership())
    );
  }

  /**
   * Returns the user's primary (most powerful) role for a room.
   */
  getPrimaryRoleByRoom(roomShortId: string): Observable<UserRole> {
    return this.getMembershipByRoom(roomShortId).pipe(
        map(m => this.selectPrimaryRole(m.roles)),
    );
  }

  /**
   * Select the user's primary (most powerful) role from an array of roles.
   */
  selectPrimaryRole(roles: UserRole[]) {
    return roles.reduce(
        (acc, value) => this.isRoleSubstitutable(value, acc) ? value : acc,
        UserRole.NONE);
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
    if (checkedRole === substitution || substitution === UserRole.NONE) {
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
   * Returns messages about server-side membership changes as a stream.
   */
  getMembershipChangesStream(userId: string): Observable<IMessage> {
    return this.wsConnector.getWatcher(`/topic/${userId}.room-membership.changes.stream`);
  }

  /**
   * Sends a request for membership and emits a MembershipsChanged event on
   * success.
   */
  requestMembership(roomShortId: string): Observable<Room> {
    const uri = this.buildForeignUri('/request-membership', '~' + roomShortId);
    return this.http.post<Room>(uri, {}).pipe(
      tap(() => {
        const event = new MembershipsChanged();
        this.eventService.broadcast(event.type, event.payload);
      })
    );
  }

  /**
   * Sends a request to cancel a membership and emits a MembershipsChanged event
   * on success.
   */
  cancelMembership(roomShortId: string): Observable<Room> {
    const uri = this.buildForeignUri('/cancel-membership', '~' + roomShortId);
    return this.http.post<Room>(uri, {}).pipe(
      tap(() => {
        const event = new MembershipsChanged();
        this.eventService.broadcast(event.type, event.payload);
      })
    );
  }
}
