import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
} from '@angular/core';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { InputDialogComponent } from '@app/admin/_dialogs/input-dialog/input-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { FormService } from '@app/core/services/util/form.service';
import { catchError, map, of, switchMap } from 'rxjs';
import { AdminPageHeaderComponent } from '@app/admin/admin-page-header/admin-page-header.component';
import { MatCard } from '@angular/material/card';
import { FlexModule } from '@angular/flex-layout';
import { EntityPropertiesComponent } from '@app/admin/entity-properties/entity-properties.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  AdminDeleteRoomByIdGql,
  AdminRoomGql,
  AdminTransferRoomGql,
} from '@gql/generated/graphql';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import {
  MatFormField,
  MatLabel,
  MatSuffix,
} from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { AdminUtilService } from '@app/admin/admin-util.service';

@Component({
  selector: 'app-room-management',
  templateUrl: './room-management.component.html',
  styleUrls: ['../admin-styles.scss'],
  imports: [
    AdminPageHeaderComponent,
    MatCard,
    FlexModule,
    EntityPropertiesComponent,
    MatButton,
    MatIcon,
    TranslocoPipe,
    LoadingIndicatorComponent,
    MatFormField,
    MatLabel,
    FormsModule,
    ReactiveFormsModule,
    MatInput,
    MatSuffix,
    MatIconButton,
  ],
  providers: [AdminUtilService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomManagementComponent {
  private readonly dialogService = inject(DialogService);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslocoService);
  private readonly dialog = inject(MatDialog);
  private readonly formService = inject(FormService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly adminRoom = inject(AdminRoomGql);
  private readonly adminDeleteRoom = inject(AdminDeleteRoomByIdGql);
  private readonly adminTransferRoom = inject(AdminTransferRoomGql);
  private readonly adminUtilService = inject(AdminUtilService);

  readonly formControl = new FormControl();

  private readonly startSearch$ = this.formControl.valueChanges.pipe(
    takeUntilDestroyed(this.destroyRef),
    map((value) => this.determineSearchVariables(value))
  );

  private readonly roomQueryRef = this.startSearch$.pipe(
    switchMap((variables) =>
      variables
        ? this.adminRoom.watch({
            errorPolicy: 'all',
            variables,
          }).valueChanges
        : of(null)
    )
  );

  readonly isLoading = toSignal(
    this.roomQueryRef.pipe(map((r) => r?.loading ?? false))
  );
  readonly room = toSignal(
    this.roomQueryRef.pipe(
      map((r) =>
        !!r && r.dataState === 'complete'
          ? r.data?.adminRoomByIdOrShortId
          : undefined
      ),
      catchError(() => of(undefined))
    )
  );

  private determineSearchVariables(input: string) {
    if (input.length === 8) {
      return { shortId: Number(input) };
    } else if (this.adminUtilService.isUuid(input)) {
      return { id: input };
    }
    return;
  }

  clear() {
    this.formControl.setValue('');
  }

  deleteRoom() {
    const room = this.room();
    if (room) {
      const confirmAction = this.adminDeleteRoom.mutate({
        variables: { id: room.id },
        update: (cache, result) => {
          if (result.data?.adminDeleteRoomById) {
            const cacheId = cache.identify({
              __typename: 'AdminRoom',
              id: room.id,
            });
            if (cacheId) {
              cache.evict({ id: cacheId });
              cache.gc();
            }
          }
        },
      });
      const dialogRef = this.dialogService.openDeleteDialog(
        'room-as-admin',
        'dialog.really-delete-room',
        room.name,
        undefined,
        () => confirmAction
      );
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.clear();
          const msg = this.translateService.translate(
            'admin.admin-area.room-deleted'
          );
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.WARNING
          );
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
    const room = this.room();
    dialogRef.componentInstance.clicked$.subscribe((userId) => {
      if (!userId || !room) {
        return;
      }
      this.formService.disableForm();
      this.adminTransferRoom
        .mutate({ variables: { roomId: room.id, userId: userId } })
        .subscribe({
          next: () => {
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
          error: () => this.formService.enableForm(),
        });
    });
  }
}
