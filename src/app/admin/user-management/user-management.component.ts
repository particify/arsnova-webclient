import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  linkedSignal,
} from '@angular/core';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { InputDialogComponent } from '@app/admin/_dialogs/input-dialog/input-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { catchError, debounceTime, filter, first, map, of } from 'rxjs';
import { AdminPageHeaderComponent } from '@app/admin/admin-page-header/admin-page-header.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { FlexModule } from '@angular/flex-layout';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  AdminCreateUserGql,
  AdminUserByIdGql,
  AdminUsersGql,
} from '@gql/generated/graphql';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormService } from '@app/core/services/util/form.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatFormField,
  MatLabel,
  MatSuffix,
} from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { AdminUtilService } from '@app/admin/admin-util.service';
import { MatActionList, MatListItem } from '@angular/material/list';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
  imports: [
    AdminPageHeaderComponent,
    LoadingIndicatorComponent,
    FlexModule,
    MatIcon,
    TranslocoPipe,
    FormsModule,
    MatFormField,
    MatLabel,
    ReactiveFormsModule,
    MatInput,
    MatSuffix,
    MatIconButton,
    MatActionList,
    MatListItem,
    RouterLink,
  ],
  providers: [AdminUtilService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserManagementComponent {
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslocoService);
  private readonly apiConfigService = inject(ApiConfigService);
  private readonly formService = inject(FormService);
  private readonly dialog = inject(MatDialog);
  private readonly adminUsers = inject(AdminUsersGql);
  private readonly adminCreateUser = inject(AdminCreateUserGql);
  private readonly destroyRef = inject(DestroyRef);
  private readonly adminUtilService = inject(AdminUtilService);
  private readonly adminUserById = inject(AdminUserByIdGql);

  private readonly usersQueryRef = this.adminUsers.watch({
    errorPolicy: 'all',
  });
  private readonly usersResult = toSignal(
    this.usersQueryRef.valueChanges.pipe(
      filter((r) => r.dataState === 'complete'),
      map((r) => r.data.adminUsers),
      catchError(() => of())
    )
  );

  readonly isLoading = computed(
    toSignal(
      this.usersQueryRef.valueChanges.pipe(map((r) => r?.loading ?? false))
    )
  );
  readonly usersFromSearch = computed(
    () =>
      this.usersResult()
        ?.edges?.filter((e) => !!e)
        .map((e) => e.node) ?? []
  );
  readonly users = linkedSignal(this.usersFromSearch);
  readonly showButton = computed(
    toSignal(
      this.apiConfigService.getApiConfig$().pipe(
        first(),
        map(
          (c) =>
            !!c.authenticationProviders.map((p) => p.id).includes('user-db')
        )
      )
    )
  );
  readonly formControl = new FormControl('');

  constructor() {
    this.formControl.valueChanges
      .pipe(debounceTime(250), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.search(value?.trim() ?? undefined);
      });
  }

  private search(search?: string) {
    if (search && this.adminUtilService.isUuid(search)) {
      this.usersQueryRef.options.variables.search = undefined;
      this.adminUserById
        .fetch({ variables: { id: search } })
        .pipe(
          first(),
          map((r) => r.data?.adminUserById),
          filter((r) => !!r)
        )
        .subscribe({
          next: (u) => {
            this.users.set([u]);
          },
          error: () => this.users.set([]),
        });
    } else if (search !== this.usersQueryRef.options.variables.search) {
      this.users.update(() => this.usersFromSearch());
      this.usersQueryRef.options.variables.search = search;
      this.usersQueryRef.refetch();
    }
  }

  clear() {
    this.formControl.setValue('');
  }

  addAccount() {
    const dialogRef = this.dialog.open(InputDialogComponent, {
      data: {
        inputName: 'login-id',
        primaryAction: 'add-account',
      },
    });
    dialogRef.componentInstance.clicked$.subscribe((mailAddress) => {
      if (!mailAddress) {
        return;
      }
      this.adminCreateUser
        .mutate({
          variables: { mailAddress },
        })
        .subscribe({
          next: () => {
            this.usersQueryRef.refetch();
            this.formService.enableForm();
            dialogRef.close();
            const msg = this.translateService.translate(
              'admin.admin-area.account-added'
            );
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.SUCCESS
            );
          },
          error: () => {
            this.formService.enableForm();
          },
        });
    });
  }
}
