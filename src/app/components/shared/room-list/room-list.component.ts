import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Room } from '../../../models/room';
import { RoomRoleMixin } from '../../../models/room-role-mixin';
import { User } from '../../../models/user';
import { UserRole } from '../../../models/user-roles.enum';
import { Moderator } from '../../../models/moderator';
import { RoomService } from '../../../services/http/room.service';
import { EventService } from '../../../services/util/event.service';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { ModeratorService } from '../../../services/http/moderator.service';
import { Subscription } from 'rxjs';
import { CommentService } from '../../../services/http/comment.service';
import { NotificationService } from '../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { DialogService } from '../../../services/util/dialog.service';
import { GlobalStorageService, MemoryStorageKey } from '../../../services/util/global-storage.service';

@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.scss']
})
export class RoomListComponent implements OnInit, OnDestroy {
  @Input() user: User;
  rooms: Room[] = [];
  roomsWithRole: RoomRoleMixin[];
  displayRooms: RoomRoleMixin[];
  closedRooms: Room[];
  isLoading = true;
  sub: Subscription;
  deviceType: string;
  roles: string[] = [];

  creatorRole = UserRole.CREATOR;
  participantRole = UserRole.PARTICIPANT;
  executiveModeratorRole = UserRole.EXECUTIVE_MODERATOR;

  constructor(
    private roomService: RoomService,
    public eventService: EventService,
    protected authenticationService: AuthenticationService,
    private moderatorService: ModeratorService,
    private commentService: CommentService,
    public notificationService: NotificationService,
    private translateService: TranslateService,
    protected router: Router,
    private dialogService: DialogService,
    private globalStorageService: GlobalStorageService
  ) {
  }

  ngOnInit() {
    this.getRooms();
    this.sub = this.eventService.on<any>('RoomDeleted').subscribe(payload => {
      this.roomsWithRole = this.roomsWithRole.filter(r => r.id !== payload.id);
    });
    this.deviceType = this.globalStorageService.getMemoryItem(MemoryStorageKey.DEVICE_TYPE);
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
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  getRooms(): void {
    this.roomService.getParticipantRooms().subscribe(rooms => this.updateRoomList(rooms));
    this.roomService.getCreatorRooms().subscribe(rooms => {
      this.updateRoomList(rooms);
      this.isLoading = false;
    });
  }

  updateRoomList(rooms: Room[]) {
    this.rooms = this.rooms.concat(rooms);
    this.closedRooms = this.rooms.filter(room => room.closed);
    this.roomsWithRole = this.rooms.map(room => {
      const roomWithRole: RoomRoleMixin = <RoomRoleMixin>room;
      if (this.authenticationService.hasAccess(room.shortId, UserRole.CREATOR)) {
        roomWithRole.role = UserRole.CREATOR;
      } else {
        // TODO: acknowledge the other role option too
        roomWithRole.role = UserRole.PARTICIPANT;
        this.moderatorService.get(room.id).subscribe((moderators: Moderator[]) => {
          for (const m of moderators) {
            if (m.userId === this.user.id) {
              this.authenticationService.setAccess(room.shortId, UserRole.EXECUTIVE_MODERATOR);
              roomWithRole.role = UserRole.EXECUTIVE_MODERATOR;
            }
          }
        });
      }
      return roomWithRole;
    }).sort((a, b) => 0 - (a.name.toLowerCase() < b.name.toLowerCase() ? 1 : -1));
    for (const room of this.roomsWithRole) {
      this.commentService.countByRoomId(room.id, true).subscribe(count => {
        room.commentCount = count;
      });
    }
    this.setDisplayedRooms(this.roomsWithRole);
  }

  setCurrentRoom(shortId: string, role: UserRole) {
    this.authenticationService.assignRole(role);
    this.router.navigate([`${this.roleToString(role)}/room/${shortId}`]);
  }

  navToSettings(shortId: string) {
    this.router.navigate([`creator/room/${shortId}/settings`]);
  }

  openDeleteRoomDialog(room: RoomRoleMixin) {
    if (room.role < 3) {
      const dialogRef = this.dialogService.openDeleteDialog('really-remove-session-from-history', room.name);
      dialogRef.afterClosed().subscribe(result => {
        if (result === 'delete') {
          this.removeFromHistory(room);
          this.removeRoomFromList(room);
        } else {
          this.roomDeletionCanceled();
        }
      });
    } else {
      const dialogRef = this.dialogService.openDeleteDialog('really-delete-session', room.name);
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

  removeRoomFromList(room: RoomRoleMixin) {
    this.rooms = this.rooms.filter(r => r.id !== room.id);
    this.closedRooms = this.closedRooms.filter(r => r.id !== room.id);
    this.roomsWithRole = this.roomsWithRole.filter(r => r.id !== room.id);
    this.setDisplayedRooms(this.roomsWithRole);
  }

  setDisplayedRooms(rooms: RoomRoleMixin[]) {
    this.displayRooms = rooms;
  }

  deleteRoom(room: Room) {
    this.roomService.deleteRoom(room.id).subscribe(() => {
      this.translateService.get('room-list.room-successfully-deleted').subscribe(msg => {
        this.notificationService.show(msg);
      });
    });
  }

  removeFromHistory(room: Room) {
    this.roomService.removeFromHistory(room.id).subscribe(() => {
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
      this.setDisplayedRooms(this.roomsWithRole.filter(room => room.name.includes(search.toLowerCase())));
    }
  }
}
