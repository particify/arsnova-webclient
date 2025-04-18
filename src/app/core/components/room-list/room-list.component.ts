import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { RoomRole } from '@gql/generated/graphql';
import { RoomService } from '@app/core/services/http/room.service';
import { EventService } from '@app/core/services/util/event.service';
import { RoomMembershipService } from '@app/core/services/room-membership.service';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { Observable, of, Subject, Subscription, zip } from 'rxjs';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { Router, RouterLink } from '@angular/router';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { Membership } from '@app/core/models/membership';
import {
  filter,
  map,
  shareReplay,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { RoomSummary } from '@app/core/models/room-summary';
import { RoomDeleted } from '@app/core/models/events/room-deleted';
import { AuthProvider } from '@app/core/models/auth-provider';
import { MembershipsChanged } from '@app/core/models/events/memberships-changed';
import { ExtensionFactory } from '@projects/extension-point/src/lib/extension-factory';
import { RoutingService } from '@app/core/services/util/routing.service';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { ExtensionPointComponent } from '@projects/extension-point/src/lib/extension-point.component';
import { FlexModule } from '@angular/flex-layout';
import { MatCard, MatCardContent } from '@angular/material/card';
import {
  MatButton,
  MatFabButton,
  MatIconButton,
} from '@angular/material/button';
import { HotkeyDirective } from '@app/core/directives/hotkey.directive';
import { MatIcon } from '@angular/material/icon';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { NgClass } from '@angular/common';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatActionList, MatListItem, MatList } from '@angular/material/list';
import { TextOverflowClipComponent } from '@app/standalone/text-overflow-clip/text-overflow-clip.component';
import { MatTooltip } from '@angular/material/tooltip';
import { ListBadgeComponent } from '@app/standalone/list-badge/list-badge.component';
import { MatBadge } from '@angular/material/badge';
import { TrackInteractionDirective } from '@app/core/directives/track-interaction.directive';
import { SplitShortIdPipe } from '@app/core/pipes/split-short-id.pipe';

const ACTIVE_ROOM_THRESHOLD = 15;

interface RoomDataView {
  summary: RoomSummary;
  membership: Membership;
  transferred: boolean;
}

@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.scss'],
  imports: [
    LoadingIndicatorComponent,
    ExtensionPointComponent,
    FlexModule,
    MatCard,
    MatButton,
    HotkeyDirective,
    MatIcon,
    MatMenuTrigger,
    NgClass,
    ExtendedModule,
    MatPrefix,
    MatInput,
    MatFabButton,
    MatMenu,
    MatMenuItem,
    RouterLink,
    MatActionList,
    MatListItem,
    TextOverflowClipComponent,
    MatTooltip,
    ListBadgeComponent,
    MatIconButton,
    MatCardContent,
    MatList,
    MatBadge,
    TrackInteractionDirective,
    SplitShortIdPipe,
    TranslocoPipe,
  ],
})
export class RoomListComponent implements OnInit, OnDestroy {
  private roomService = inject(RoomService);
  eventService = inject(EventService);
  protected roomMembershipService = inject(RoomMembershipService);
  private authenticationService = inject(AuthenticationService);
  notificationService = inject(NotificationService);
  private translateService = inject(TranslocoService);
  protected router = inject(Router);
  private dialogService = inject(DialogService);
  private globalStorageService = inject(GlobalStorageService);
  private extensionFactory = inject(ExtensionFactory);
  private routingService = inject(RoutingService);

  @Input({ required: true }) auth!: ClientAuthentication;
  showGuestAccountControls = false;
  isGuest = false;
  rooms: RoomDataView[] = [];
  roomIds: string[] = [];
  displayRooms: RoomDataView[] = [];
  roomsFromGuest: RoomDataView[] = [];
  guestAuth$: Observable<ClientAuthentication>;
  showRoomsFromGuest = false;
  isLoading = true;
  sub?: Subscription;
  unsubscribe$ = new Subject<void>();
  deviceType: string;
  roles: Map<RoomRole, string> = new Map<RoomRole, string>();
  showImportMenu = false;

  creatorRole = RoomRole.Owner;
  participantRole = RoomRole.Participant;
  executiveModeratorRole = RoomRole.Moderator;
  editorRole = RoomRole.Editor;

  constructor() {
    this.deviceType = this.globalStorageService.getItem(
      STORAGE_KEYS.DEVICE_TYPE
    );
    this.guestAuth$ = this.authenticationService
      .fetchGuestAuthentication()
      .pipe(shareReplay());
  }

  ngOnInit() {
    this.loadRoomDataViews();
    if (this.auth.authProvider === AuthProvider.ARSNOVA_GUEST) {
      this.isGuest = true;
    } else {
      this.showGuestAccountControls =
        !!this.authenticationService.getGuestToken();
    }
    this.showImportMenu =
      this.showGuestAccountControls ||
      !!this.extensionFactory.getExtension('import-token');
    this.sub = this.eventService.on<any>('RoomDeleted').subscribe((payload) => {
      this.rooms = this.rooms.filter((r) => r.summary.id !== payload.id);
    });
    const roleKeys = [
      'room-list.a11y-participant-role',
      'room-list.a11y-executive-moderator-role',
      'room-list.a11y-editor-role',
      'room-list.a11y-creator-role',
    ];
    const roles = [
      RoomRole.Participant,
      RoomRole.Moderator,
      RoomRole.Editor,
      RoomRole.Owner,
    ];
    this.translateService
      .selectTranslate(roleKeys)
      .pipe(take(1))
      .subscribe(() => {
        for (let i = 0; i < roleKeys.length; i++) {
          this.roles.set(
            roles[i],
            this.translateService.translate(roleKeys[i])
          );
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  loadRoomDataViews() {
    this.getRoomDataViews()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((roomDataViews) => this.updateRoomList(roomDataViews));
  }

  getRoomDataViews(): Observable<RoomDataView[]> {
    const memberships$ = this.roomMembershipService
      .getMembershipChanges()
      .pipe(filter((m) => m !== null));
    return this.createRoomDataViewsFromMemberships(memberships$);
  }

  getGuestRooms() {
    this.getRoomDataViewsForGuest().subscribe((guestRooms) => {
      if (guestRooms && guestRooms.length > 0) {
        this.roomsFromGuest = guestRooms;
        this.showRoomsFromGuest = true;
        setTimeout(() => {
          document
            .getElementById('guest-rooms')
            ?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      } else if (this.isLoading) {
        this.translateService
          .selectTranslate('room-list.transfer-no-rooms')
          .pipe(take(1))
          .subscribe((msg) => {
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.WARNING
            );
          });
      }
    });
  }

  getRoomDataViewsForGuest(): Observable<RoomDataView[]> {
    const memberships$ = this.guestAuth$.pipe(
      switchMap((auth) => {
        return this.roomMembershipService.getMembershipsForAuthentication(auth);
      }),
      map((memberships) => {
        const ids = this.rooms.map((r) => r.membership.roomId);
        return memberships.filter((m) => ids.indexOf(m.roomId) === -1);
      }),
      shareReplay()
    );

    return this.createRoomDataViewsFromMemberships(memberships$);
  }

  private createRoomDataViewsFromMemberships(
    memberships$: Observable<Membership[]>
  ) {
    const roomIds$ = memberships$.pipe(
      map((memberships) => memberships.map((membership) => membership.roomId))
    );
    const roomSummaries$ = roomIds$.pipe(
      switchMap((ids) =>
        ids.length > 0 ? this.roomService.getRoomSummaries(ids) : of([])
      )
    );

    return zip(memberships$, roomSummaries$).pipe(
      map((result) => {
        return result[0].map((membership) => {
          return {
            membership: membership,
            summary: result[1].filter(
              (summary) => summary.id === membership.roomId
            )[0],
            transferred: false,
          };
        });
      })
    );
  }

  updateRoomList(rooms: RoomDataView[]) {
    this.rooms = rooms;
    this.roomIds = rooms.map((r) => r.summary.id);
    this.setDisplayedRooms(this.rooms);
    this.showGuestRooms();
    this.isLoading = false;
  }

  showGuestRooms() {
    if (this.displayRooms.length > 0) {
      return;
    } else if (this.isLoading) {
      this.getGuestRooms();
    }
  }

  setCurrentRoom(shortId: string, role: RoomRole) {
    this.updateLastAccess(shortId);
    this.router.navigate([this.roleToString(role), shortId]);
  }

  navToSettings(shortId: string) {
    this.router.navigate(['edit', shortId, 'settings']);
  }

  openDeleteRoomDialog(room: RoomDataView) {
    const isOwner = room.membership.roles.includes(RoomRole.Owner);
    const dialogRef = this.dialogService.openDeleteDialog(
      isOwner ? 'room' : 'room-membership',
      'dialog.' +
        (isOwner ? 'really-delete-room' : 'really-cancel-room-membership'),
      room.summary.name,
      undefined,
      () =>
        isOwner
          ? this.roomService.deleteRoom(room.summary.id)
          : this.roomMembershipService.cancelMembership(room.summary.shortId)
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        let msg: string;
        if (isOwner) {
          msg = this.translateService.translate(
            'room-list.room-successfully-deleted'
          );
          const event = new RoomDeleted(room.summary.id);
          this.eventService.broadcast(event.type, event.payload);
        } else {
          msg = this.translateService.translate(
            'room-list.room-successfully-removed'
          );
        }
        this.removeRoomFromList(room);
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
      } else {
        this.roomDeletionCanceled();
      }
    });
  }

  roomDeletionCanceled() {
    this.translateService
      .selectTranslate('room-list.canceled-remove')
      .pipe(take(1))
      .subscribe((msg) => {
        this.notificationService.show(msg);
      });
  }

  removeRoomFromList(room: RoomDataView) {
    this.rooms = this.rooms.filter((r) => r.summary.id !== room.summary.id);
    this.setDisplayedRooms(this.rooms);
  }

  setDisplayedRooms(rooms: RoomDataView[]) {
    this.displayRooms = this.sortRooms(rooms);
  }

  private sortRooms(rooms: RoomDataView[]) {
    return rooms.sort((a, b) => {
      const aAboveThreshold = this.isRoomActive(a.summary.stats.roomUserCount);
      const bAboveThreshold = this.isRoomActive(b.summary.stats.roomUserCount);
      if (aAboveThreshold !== bAboveThreshold) {
        return +bAboveThreshold - +aAboveThreshold;
      }
      return this.sortByTime(a, b);
    });
  }

  private sortByTime(a: RoomDataView, b: RoomDataView) {
    return (
      new Date(b.membership.lastVisit).getTime() -
      new Date(a.membership.lastVisit).getTime()
    );
  }

  roleToString(role: RoomRole): string {
    return this.routingService.getRoleRoute(role);
  }

  filterRooms(search: string) {
    if (search.length > 0) {
      this.setDisplayedRooms(
        this.rooms.filter((room) =>
          room.summary.name.toLowerCase().includes(search.toLowerCase())
        )
      );
    } else {
      this.setDisplayedRooms(this.rooms);
    }
  }

  emitTransferChanges(roomDataView: RoomDataView) {
    roomDataView.transferred = true;
    const event = new MembershipsChanged();
    this.eventService.broadcast(event.type, event.payload);
    if (this.roomsFromGuest.filter((room) => !room.transferred).length === 0) {
      this.showRoomsFromGuest = false;
    }
  }

  transferRoomFromGuest(roomDataView: RoomDataView) {
    this.guestAuth$
      .pipe(
        switchMap((auth) =>
          this.roomService.transferRoomThroughToken(
            roomDataView.membership.roomId,
            auth.token
          )
        ),
        tap(() =>
          this.translateService
            .selectTranslate('room-list.transferred-successfully')
            .pipe(take(1))
            .subscribe((msg) =>
              this.notificationService.showAdvanced(
                msg,
                AdvancedSnackBarTypes.SUCCESS
              )
            )
        )
      )
      .subscribe(() => {
        this.emitTransferChanges(roomDataView);
      });
  }

  addRoomFromGuest(roomDataView: RoomDataView) {
    this.roomMembershipService
      .requestMembership(roomDataView.membership.roomShortId)
      .pipe(
        tap(() =>
          this.translateService
            .selectTranslate('room-list.added-successfully')
            .pipe(take(1))
            .subscribe((msg) =>
              this.notificationService.showAdvanced(
                msg,
                AdvancedSnackBarTypes.SUCCESS
              )
            )
        )
      )
      .subscribe(() => {
        this.emitTransferChanges(roomDataView);
      });
  }

  updateLastAccess(shortId: string) {
    const room = this.rooms.find((r) => r.membership.roomShortId === shortId);
    if (room) {
      room.membership.lastVisit = new Date().toISOString();
    }
  }

  openCreateRoomDialog(): void {
    this.dialogService.openRoomCreateDialog();
  }

  isRoomActive(userCount: number) {
    return userCount >= ACTIVE_ROOM_THRESHOLD;
  }

  duplicateRoom(roomId: string, roomName: string) {
    const dialogRef = this.dialogService.openRoomCreateDialog(roomName, roomId);
    dialogRef.afterClosed().subscribe((name) => {
      if (name) {
        this.loadRoomDataViews();
      }
    });
  }
}
