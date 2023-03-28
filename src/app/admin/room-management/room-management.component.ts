import { Component } from '@angular/core';
import { Room } from '@core/models/room';
import { RoomService } from '@core/services/http/room.service';
import { DialogService } from '@core/services/util/dialog.service';
import { AdminService } from '@core/services/http/admin.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@core/services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { InputDialogComponent } from '@admin/_dialogs/input-dialog/input-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '@core/services/http/user.service';

@Component({
  selector: 'app-room-management',
  templateUrl: './room-management.component.html',
  styleUrls: ['../admin-styles.scss'],
})
export class RoomManagementComponent {
  room: Room;
  rooms: Room[];
  searchResults: string[];

  constructor(
    protected adminService: AdminService,
    protected roomService: RoomService,
    protected dialogService: DialogService,
    protected notificationService: NotificationService,
    protected translateService: TranslateService,
    protected dialog: MatDialog,
    protected userService: UserService
  ) {}

  showRoom(searchResult: string) {
    const index = this.searchResults.indexOf(searchResult);
    this.room = this.rooms[index];
  }

  search(id: string) {
    this.searchResults = [];
    if (!id || this.room) {
      return;
    }
    id = id.replace(' ', '');
    if (id.match(/^[0-9]{8}$/)) {
      id = '~' + id;
    }
    this.searchResults = [];
    this.adminService.getRoom(id).subscribe((room) => {
      this.rooms = [];
      if (room) {
        this.rooms.push(room);
        this.searchResults.push(`${room.name} (${room.shortId})`);
      }
    });
  }

  clear() {
    this.rooms = [];
    this.searchResults = [];
    this.room = null;
  }

  deleteEntity() {
    const dialogRef = this.dialogService.openDeleteDialog(
      'room-as-admin',
      'really-delete-room',
      this.room.name
    );
    dialogRef.afterClosed().subscribe((closeAction) => {
      if (closeAction === 'delete') {
        this.roomService.deleteRoom(this.room.id).subscribe(() => {
          this.translateService
            .get('admin-area.room-deleted')
            .subscribe((message) =>
              this.notificationService.showAdvanced(
                message,
                AdvancedSnackBarTypes.WARNING
              )
            );
          this.room = null;
        });
      }
    });
  }

  transferRoom() {
    const dialogRef = this.dialog.open(InputDialogComponent, {
      data: {
        inputName: 'room-new-owner-id',
        primaryAction: 'transfer-room',
        useUserSearch: true,
      },
    });
    dialogRef.afterClosed().subscribe((userId) => {
      if (!userId) {
        return;
      }
      this.adminService.transferRoom(this.room.id, userId).subscribe(() => {
        const msg = this.translateService.instant(
          'admin-area.room-transferred'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.SUCCESS
        );
      });
    });
  }
}
