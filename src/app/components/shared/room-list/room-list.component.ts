import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { User } from '../../../models/user';
import { UserRole } from '../../../models/user-roles.enum';
import { RoomService } from '../../../services/http/room.service';
import { EventService } from '../../../services/util/event.service';
import { RoomMembershipService } from '../../../services/room-membership.service';
import { Subscription, Observable, combineLatest, Subject } from 'rxjs';
import { NotificationService } from '../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { DialogService } from '../../../services/util/dialog.service';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';
import { Membership } from '../../../models/membership';
import { map, switchMap, filter, takeUntil } from 'rxjs/operators';
import { RoomSummary } from '../../../models/room-summary';
import { RoomDeleted } from 'app/models/events/room-deleted';

interface RoomDataView {
  summary: RoomSummary;
  membership: Membership;
}

@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.scss']
})
export class RoomListComponent implements OnInit, OnDestroy {
  @Input() user: User;
  rooms: RoomDataView[] = [];
  displayRooms: RoomDataView[];
  isLoading = true;
  sub: Subscription;
  unsubscribe$: Subject<void> = new Subject();
  deviceType: string;
  roles: string[] = [];

  creatorRole = UserRole.CREATOR;
  participantRole = UserRole.PARTICIPANT;
  executiveModeratorRole = UserRole.EXECUTIVE_MODERATOR;

  constructor(
    private roomService: RoomService,
    public eventService: EventService,
    protected roomMembershipService: RoomMembershipService,
    public notificationService: NotificationService,
    private translateService: TranslateService,
    protected router: Router,
    private dialogService: DialogService,
    private globalStorageService: GlobalStorageService
  ) {
  }

  ngOnInit() {
    this.getRoomDataViews().pipe(takeUntil(this.unsubscribe$)).subscribe(roomDataViews => this.updateRoomList(roomDataViews));
    this.sub = this.eventService.on<any>('RoomDeleted').subscribe(payload => {
      this.rooms = this.rooms.filter(r => r.summary.id !== payload.id);
    });
    this.deviceType = this.globalStorageService.getItem(STORAGE_KEYS.DEVICE_TYPE);
    const roleKeys = [
      'room-list.participant-role',
      'room-list.editing-moderator-role',
      'room-list.executive-moderator-role',
      'room-list.creator-role',
    ];
    this.translateService.get(roleKeys).subscribe(msgs => {
      // this.roles = [msgs[roleKeys[0]], msgs[roleKeys[1]], msgs[roleKeys[2]], msgs[roleKeys[3]]];
      for (const role of roleKeys) {
        this.roles.push(msgs[role]);
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

  getRoomDataViews(): Observable<RoomDataView[]> {
    const memberships$ = this.roomMembershipService.getMembershipChanges().pipe(filter(m => m !== null));
    const roomIds$ = memberships$.pipe(
      map(memberships => memberships.map(membership => membership.roomId))
    );
    const roomSummaries$ = roomIds$.pipe(switchMap(ids => this.roomService.getRoomSummaries(ids)));

    return combineLatest(memberships$, roomSummaries$).pipe(
        map((result) => {
          return result[0].map(membership => {
            return {
              membership: membership,
              summary: result[1].filter(summary => summary.id === membership.roomId)[0]
            };
          });
        }));
  }

  updateRoomList(rooms: RoomDataView[]) {
    this.rooms = rooms;
    this.setDisplayedRooms(this.rooms);
    this.isLoading = false;
  }

  setCurrentRoom(shortId: string, role: UserRole) {
    this.router.navigate([`${this.roleToString(role)}/room/${shortId}`]);
    this.globalStorageService.removeItem(STORAGE_KEYS.LAST_GROUP);
  }

  navToSettings(shortId: string) {
    this.router.navigate([`creator/room/${shortId}/settings`]);
  }

  openDeleteRoomDialog(room: RoomDataView) {
    if (room.membership.roles.indexOf(UserRole.CREATOR) === -1) {
      const dialogRef = this.dialogService.openDeleteDialog('really-remove-room-from-history', room.summary.name);
      dialogRef.afterClosed().subscribe(result => {
        if (result === 'delete') {
          this.removeFromHistory(room);
          this.removeRoomFromList(room);
        } else {
          this.roomDeletionCanceled();
        }
      });
    } else {
      const dialogRef = this.dialogService.openDeleteDialog('really-delete-room', room.summary.name);
      dialogRef.afterClosed().subscribe(result => {
        if (result === 'delete') {
          this.deleteRoom(room);
          this.removeRoomFromList(room);
        } else {
          this.roomDeletionCanceled();
        }
      });
      }
  }

  roomDeletionCanceled() {
    this.translateService.get('room-list.canceled-remove').subscribe(msg => {
      this.notificationService.show(msg);
    });
  }

  removeRoomFromList(room: RoomDataView) {
    this.rooms = this.rooms.filter(r => r.summary.id !== room.summary.id);
    this.setDisplayedRooms(this.rooms);
  }

  setDisplayedRooms(rooms: RoomDataView[]) {
    this.displayRooms = rooms;
  }

  deleteRoom(room: RoomDataView) {
    this.roomService.deleteRoom(room.summary.id).subscribe(() => {
      this.translateService.get('room-list.room-successfully-deleted').subscribe(msg => {
        this.notificationService.show(msg);
      });
      const event = new RoomDeleted(room.summary.id);
      this.eventService.broadcast(event.type, event.payload);
    });
  }

  removeFromHistory(room: RoomDataView) {
    this.roomService.removeFromHistory(room.summary.id).subscribe(() => {
      this.translateService.get('room-list.room-successfully-removed').subscribe(msg => {
        this.notificationService.show(msg);
      });
    });
  }

  roleToString(role: UserRole): string {
    switch (role) {
      case UserRole.CREATOR:
        return 'creator';
      case UserRole.PARTICIPANT:
        return 'participant';
      case UserRole.EXECUTIVE_MODERATOR:
        return 'moderator';
    }
  }

  filterRooms(search: string) {
    if (search.length > 2) {
      this.setDisplayedRooms(this.rooms.filter(room => room.summary.name.includes(search.toLowerCase())));
    } else {
      this.setDisplayedRooms(this.rooms);
    }
  }
}
