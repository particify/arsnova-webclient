import { Component, OnInit, inject } from '@angular/core';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { InputDialogComponent } from '@app/admin/_dialogs/input-dialog/input-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UserSearchComponent } from '@app/admin/user-search/user-search.component';
import { FormService } from '@app/core/services/util/form.service';
import { take } from 'rxjs';
import { AdminPageHeaderComponent } from '../admin-page-header/admin-page-header.component';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { LoadingIndicatorComponent } from '../../standalone/loading-indicator/loading-indicator.component';
import { MatCard } from '@angular/material/card';
import { FlexModule } from '@angular/flex-layout';
import { EntityPropertiesComponent } from '../entity-properties/entity-properties.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { LoadingButtonComponent } from '../../standalone/loading-button/loading-button.component';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['../admin-styles.scss'],
  imports: [
    AdminPageHeaderComponent,
    SearchBarComponent,
    LoadingIndicatorComponent,
    MatCard,
    FlexModule,
    EntityPropertiesComponent,
    MatButton,
    MatIcon,
    LoadingButtonComponent,
    TranslocoPipe,
  ],
})
export class UserManagementComponent
  extends UserSearchComponent
  implements OnInit
{
  protected dialogService = inject(DialogService);
  protected notificationService = inject(NotificationService);
  protected translateService = inject(TranslocoService);
  protected apiConfigService = inject(ApiConfigService);
  protected dialog = inject(MatDialog);
  private formService = inject(FormService);

  addButtonText?: string;
  isLoading = false;

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
      'admin.dialog.really-delete-account-admin',
      undefined,
      undefined,
      () => confirmAction
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const msg = this.translateService.translate(
          'admin.admin-area.user-deleted'
        );
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
        .selectTranslate('admin.admin-area.user-activated')
        .pipe(take(1))
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
            .selectTranslate('admin.admin-area.account-added')
            .pipe(take(1))
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
