import { Component, inject } from '@angular/core';
import { Room } from '@app/core/models/room';
import { RoomService } from '@app/core/services/http/room.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { AdminService } from '@app/core/services/http/admin.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { InputDialogComponent } from '@app/admin/_dialogs/input-dialog/input-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '@app/core/services/http/user.service';
import { FormService } from '@app/core/services/util/form.service';
import { take } from 'rxjs';
import { AdminPageHeaderComponent } from '../admin-page-header/admin-page-header.component';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { MatCard } from '@angular/material/card';
import { FlexModule } from '@angular/flex-layout';
import { EntityPropertiesComponent } from '../entity-properties/entity-properties.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-room-management',
  templateUrl: './room-management.component.html',
  styleUrls: ['../admin-styles.scss'],
  imports: [
    AdminPageHeaderComponent,
    SearchBarComponent,
    MatCard,
    FlexModule,
    EntityPropertiesComponent,
    MatButton,
    MatIcon,
    TranslocoPipe,
  ],
})
export class RoomManagementComponent {
  protected adminService = inject(AdminService);
  protected roomService = inject(RoomService);
  protected dialogService = inject(DialogService);
  protected notificationService = inject(NotificationService);
  protected translateService = inject(TranslocoService);
  protected dialog = inject(MatDialog);
  protected userService = inject(UserService);
  private formService = inject(FormService);

  room?: Room;
  rooms: Room[] = [];
  searchResults: string[] = [];

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
    this.room = undefined;
  }

  deleteEntity() {
    if (this.room) {
      const confirmAction = this.roomService.deleteRoom(this.room.id);
      const dialogRef = this.dialogService.openDeleteDialog(
        'room-as-admin',
        'dialog.really-delete-room',
        this.room.name,
        undefined,
        () => confirmAction
      );
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.translateService
            .selectTranslate('admin.admin-area.room-deleted')
            .pipe(take(1))
            .subscribe((message) =>
              this.notificationService.showAdvanced(
                message,
                AdvancedSnackBarTypes.WARNING
              )
            );
          this.room = undefined;
        }
      });
    }
  }

  transferRoom() {
    const dialogRef = this.dialog.open(InputDialogComponent, {
      data: {
        inputName: 'room-new-owner-id',
        primaryAction: 'transfer-room',
        useUserSearch: true,
      },
    });
    dialogRef.componentInstance.clicked$.subscribe((userId) => {
      if (!userId || !this.room) {
        return;
      }
      this.adminService.transferRoom(this.room.id, userId).subscribe(
        () => {
          this.formService.enableForm();
          dialogRef.close();
          const msg = this.translateService.translate(
            'admin.admin-area.room-transferred'
          );
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.SUCCESS
          );
        },
        () => this.formService.enableForm()
      );
    });
  }
}
