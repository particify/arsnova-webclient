import { Component } from '@angular/core';
import { User } from 'app/models/user';
import { UserService } from 'app/services/http/user.service';
import { DialogService } from 'app/services/util/dialog.service';
import { AdminService } from 'app/services/http/admin.service';
import { NotificationService } from 'app/services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html'
})
export class UserManagementComponent {
  user: User;

  constructor(
    protected adminService: AdminService,
    protected userService: UserService,
    protected dialogService: DialogService,
    protected notificationService: NotificationService,
    protected translateService: TranslateService) {
  }

  loadEntity(id: string) {
    id = id.replace(' ', '');
    this.userService.getUser(id).subscribe(user => this.user = user);
  }

  clear() {
    this.user = null;
  }

  deleteEntity() {
    const dialogRef = this.dialogService.openDeleteDialog('really-delete-account-admin');
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete')  {
        this.userService.delete(this.user.id)
            .subscribe(result => {
              this.translateService.get('admin-area.user-deleted').subscribe(message =>
                  this.notificationService.show(message));
              this.user = null;
            });
      }
    });
  }

  activateUser() {
    this.adminService.activateUser(this.user.id)
        .subscribe(result =>
            this.translateService.get('admin-area.user-activated').subscribe(message =>
                this.notificationService.show(message)));
  }
}
