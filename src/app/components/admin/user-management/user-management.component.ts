import { Component, OnInit } from '@angular/core';
import { User } from '../../../models/user';
import { UserService } from '../../../services/http/user.service';
import { DialogService } from '../../../services/util/dialog.service';
import { AdminService } from '../../../services/http/admin.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { ApiConfigService } from '../../../services/http/api-config.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styles: ['.mat-mdc-raised-button {height: 56px;}'],
})
export class UserManagementComponent implements OnInit {
  user: User;

  showAccountAdding = false;
  newLoginId = '';

  constructor(
    protected adminService: AdminService,
    protected userService: UserService,
    protected dialogService: DialogService,
    protected notificationService: NotificationService,
    protected translateService: TranslateService,
    protected apiConfigService: ApiConfigService
  ) {}

  ngOnInit(): void {
    this.apiConfigService.getApiConfig$().subscribe((config) => {
      this.showAccountAdding = config.authenticationProviders
        .map((p) => p.id)
        .includes('user-db');
    });
  }

  loadEntity(id: string) {
    id = id.replace(' ', '');
    this.adminService.getUser(id).subscribe((user) => (this.user = user));
  }

  clear() {
    this.user = null;
  }

  deleteEntity() {
    const dialogRef = this.dialogService.openDeleteDialog(
      'account-as-admin',
      'really-delete-account-admin'
    );
    dialogRef.afterClosed().subscribe((closeAction) => {
      if (closeAction === 'delete') {
        this.userService.delete(this.user.id).subscribe(() => {
          this.translateService
            .get('admin-area.user-deleted')
            .subscribe((message) =>
              this.notificationService.showAdvanced(
                message,
                AdvancedSnackBarTypes.WARNING
              )
            );
          this.user = null;
        });
      }
    });
  }

  activateUser() {
    this.adminService
      .activateUser(this.user.id)
      .subscribe(() =>
        this.translateService
          .get('admin-area.user-activated')
          .subscribe((message) =>
            this.notificationService.showAdvanced(
              message,
              AdvancedSnackBarTypes.SUCCESS
            )
          )
      );
  }

  addAccount() {
    this.adminService.addAccount(this.newLoginId).subscribe(() => {
      this.translateService
        .get('admin-area.account-added')
        .subscribe((message) =>
          this.notificationService.showAdvanced(
            message,
            AdvancedSnackBarTypes.SUCCESS
          )
        );
    });
  }
}
