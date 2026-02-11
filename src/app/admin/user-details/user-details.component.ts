import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { switchMap } from 'rxjs';
import { AdminPageHeaderComponent } from '@app/admin/admin-page-header/admin-page-header.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { FlexModule } from '@angular/flex-layout';
import { MatIcon } from '@angular/material/icon';
import {
  AdminDeleteUserByIdGql,
  AdminUserByIdGql,
  AdminVerifyUserByIdGql,
} from '@gql/generated/graphql';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormService } from '@app/core/services/util/form.service';
import { AdminUtilService } from '@app/admin/admin-util.service';
import { CoreModule } from '@app/core/core.module';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { EntityPropertiesComponent } from '@app/admin/entity-properties/entity-properties.component';
import { MatCard } from '@angular/material/card';
import { BackButtonComponent } from '@app/standalone/back-button/back-button.component';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['../admin-styles.scss'],
  imports: [
    AdminPageHeaderComponent,
    LoadingIndicatorComponent,
    FlexModule,
    MatIcon,
    TranslocoPipe,
    CoreModule,
    EntityPropertiesComponent,
    LoadingButtonComponent,
    MatCard,
    BackButtonComponent,
  ],
  providers: [AdminUtilService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailsComponent {
  private readonly dialogService = inject(DialogService);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslocoService);
  private readonly formService = inject(FormService);
  private readonly adminDeleteUser = inject(AdminDeleteUserByIdGql);
  private readonly adminVerifyUser = inject(AdminVerifyUserByIdGql);
  private readonly adminUserById = inject(AdminUserByIdGql);

  readonly userId = input.required<string>();

  readonly userRef = toSignal(
    toObservable(this.userId).pipe(
      switchMap((userId) => {
        return this.adminUserById.watch({ variables: { id: userId } })
          .valueChanges;
      })
    )
  );

  readonly user = computed(() => this.userRef()?.data?.adminUserById);
  readonly isLoading = computed(() => this.userRef()?.loading ?? true);

  deleteUser() {
    const confirmAction = this.adminDeleteUser.mutate({
      variables: { id: this.userId() },
      update: (cache, result) => {
        if (result.data?.adminDeleteUserById) {
          const cacheId = cache.identify({
            __typename: 'AdminUser',
            id: this.userId(),
          });
          if (cacheId) {
            cache.evict({ id: cacheId });
            cache.gc();
          }
        }
      },
    });
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
      }
    });
  }

  activateUser() {
    this.formService.disableForm();
    this.adminVerifyUser
      .mutate({ variables: { id: this.userId() } })
      .subscribe(() => {
        this.formService.enableForm();
        const msg = this.translateService.translate(
          'admin.admin-area.user-activated'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.SUCCESS
        );
      });
  }
}
