import { Component } from '@angular/core';
import { Room } from 'app/models/room';
import { RoomService } from 'app/services/http/room.service';
import { DialogService } from 'app/services/util/dialog.service';
import { AdminService } from 'app/services/http/admin.service';
import { NotificationService } from 'app/services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-room-management',
  templateUrl: './room-management.component.html'
})
export class RoomManagementComponent {
  room: Room;

  constructor(
    protected adminService: AdminService,
    protected roomService: RoomService,
    protected dialogService: DialogService,
    protected notificationService: NotificationService,
    protected translateService: TranslateService) {
  }

  async loadEntity(id: string) {
    id = id.replace(' ', '');
    if (id.match(/^[0-9]{8}$/)) {
      id = '~' + id;
    }
    this.room = await this.roomService.getRoom(id).toPromise();
  }

  clear() {
    this.room = null;
  }

  deleteEntity() {
    const dialogRef = this.dialogService.openDeleteDialog('really-delete-room');
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete')  {
        this.roomService.deleteRoom(this.room.id)
            .subscribe(result => {
              this.translateService.get('admin-area.room-deleted').subscribe(message =>
                  this.notificationService.show(message));
              this.room = null;
            });
      }
    });
  }

  transferRoom(newOwnerId: string) {
    this.adminService.transferRoom(this.room.id, newOwnerId)
        .subscribe(result =>
            this.translateService.get('admin-area.room-transferred').subscribe(message =>
                this.notificationService.show(message)));
  }
}
