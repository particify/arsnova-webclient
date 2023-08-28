import { Component, OnInit } from '@angular/core';
import { UserService } from '@app/core/services/http/user.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { AdminService } from '@app/core/services/http/admin.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { InputDialogComponent } from '@app/admin/_dialogs/input-dialog/input-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UserSearchComponent } from '@app/admin/user-search/user-search.component';
import { FormService } from '@app/core/services/util/form.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['../admin-styles.scss'],
})
export class UserManagementComponent
  extends UserSearchComponent
  implements OnInit
{
  addButtonText: string;
  isLoading = false;

  constructor(
    protected adminService: AdminService,
    protected userService: UserService,
    protected dialogService: DialogService,
    protected notificationService: NotificationService,
    protected translateService: TranslateService,
    protected apiConfigService: ApiConfigService,
    protected dialog: MatDialog,
    private formService: FormService
  ) {
    super(userService);
  }

  ngOnInit(): void {
    this.apiConfigService.getApiConfig$().subscribe((config) => {
      if (config.authenticationProviders.map((p) => p.id).includes('user-db')) {
        this.addButtonText = 'add-account';
      }
    });
  }

  getUser(searchResult: string) {
    this.isLoading = true;
    const index = this.searchResults.indexOf(searchResult);
    const id = this.users[index].id.replace(' ', '');
    this.adminService.getUser(id).subscribe((user) => {
      this.user = user;
      this.isLoading = false;
    });
  }

  deleteEntity() {
    if (!this.user) {
      return;
    }
    const confirmAction = this.userService.delete(this.user.id);
    const dialogRef = this.dialogService.openDeleteDialog(
      'account-as-admin',
      'really-delete-account-admin',
      undefined,
      undefined,
      () => confirmAction
    );
    dialogRef.afterClosed().subscribe((closeAction) => {
      if (closeAction === 'delete') {
        const msg = this.translateService.instant('admin-area.user-deleted');
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
        this.clear();
      }
    });
  }

  activateUser() {
    if (!this.user) {
      return;
    }
    this.formService.disableForm();
    this.adminService.activateUser(this.user.id).subscribe(() => {
      this.formService.enableForm();
      this.translateService
        .get('admin-area.user-activated')
        .subscribe((message) =>
          this.notificationService.showAdvanced(
            message,
            AdvancedSnackBarTypes.SUCCESS
          )
        );
    });
  }

  addAccount() {
    const dialogRef = this.dialog.open(InputDialogComponent, {
      data: {
        inputName: 'login-id',
        primaryAction: 'add-account',
      },
    });
    dialogRef.componentInstance.clicked$.subscribe((loginId) => {
      if (!loginId) {
        return;
      }
      this.adminService.addAccount(loginId).subscribe(
        () => {
          this.formService.enableForm();
          dialogRef.close();
          this.translateService
            .get('admin-area.account-added')
            .subscribe((message) =>
              this.notificationService.showAdvanced(
                message,
                AdvancedSnackBarTypes.SUCCESS
              )
            );
        },
        () => this.formService.enableForm()
      );
    });
  }
}
