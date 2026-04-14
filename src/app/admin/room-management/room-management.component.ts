import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  linkedSignal,
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
import { catchError, debounceTime, map, of } from 'rxjs';
import { AdminPageHeaderComponent } from '@app/admin/admin-page-header/admin-page-header.component';
import { FlexModule } from '@angular/flex-layout';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  AdminDeleteRoomByIdGql,
  AdminRoomCountGql,
  AdminRoomsGql,
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
import { onlyCompleteData } from 'apollo-angular';
import { MatTableModule } from '@angular/material/table';
import { DateComponent } from '@app/standalone/date/date.component';
import { CoreModule } from '@app/core/core.module';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-room-management',
  templateUrl: './room-management.component.html',
  styleUrls: ['./room-management.component.scss'],
  imports: [
    AdminPageHeaderComponent,
    FlexModule,
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
    MatTableModule,
    DateComponent,
    RouterLink,
    CoreModule,
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
  private readonly adminRooms = inject(AdminRoomsGql);
  private readonly adminDeleteRoom = inject(AdminDeleteRoomByIdGql);
  private readonly adminTransferRoom = inject(AdminTransferRoomGql);
  private readonly adminRoomCount = inject(AdminRoomCountGql);

  readonly formControl = new FormControl();

  private readonly roomsQueryRef = this.adminRooms.watch({
    errorPolicy: 'all',
  });
  private readonly roomsResult = toSignal(
    this.roomsQueryRef.valueChanges.pipe(
      onlyCompleteData(),
      map((r) => r.data?.adminRooms),
      catchError(() => of())
    )
  );

  readonly isLoading = computed(
    toSignal(
      this.roomsQueryRef.valueChanges.pipe(map((r) => r?.loading ?? false))
    )
  );
  readonly roomsFromSearch = computed(
    () =>
      this.roomsResult()
        ?.edges?.filter((e) => !!e)
        .map((e) => e.node) ?? []
  );
  readonly rooms = linkedSignal(this.roomsFromSearch);

  readonly roomCount = toSignal(
    this.adminRoomCount
      .fetch()
      .pipe(map((r) => r.data?.adminRoomStats?.totalCount))
  );

  constructor() {
    this.formControl.valueChanges
      .pipe(debounceTime(250), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.search(value?.trim() ?? undefined);
      });
  }

  private search(search?: string) {
    if (search !== this.roomsQueryRef.options.variables.search) {
      this.roomsQueryRef.options.variables.search = search;
      this.roomsQueryRef.refetch();
    }
  }

  clear() {
    this.formControl.setValue('');
  }

  deleteRoom(id: string, name: string) {
    const confirmAction = this.adminDeleteRoom.mutate({
      variables: { id },
      update: (cache, result) => {
        if (result.data?.adminDeleteRoomById) {
          const cacheId = cache.identify({
            __typename: 'AdminRoom',
            id: id,
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
      name,
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

  transferRoom(roomId: string) {
    const dialogRef = this.dialog.open(InputDialogComponent, {
      data: {
        inputName: 'room-new-owner-id',
        primaryAction: 'transfer-room',
        useUserSearch: true,
      },
    });
    dialogRef.componentInstance.clicked$.subscribe((userId) => {
      if (!userId) {
        return;
      }
      this.formService.disableForm();
      this.adminTransferRoom
        .mutate({ variables: { roomId, userId: userId } })
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
