import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { switchMap } from 'rxjs';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { FlexModule } from '@angular/flex-layout';
import {
  AdminRoomManagingMembersByRoomIdGql,
  AdminRoomByIdGql,
} from '@gql/generated/graphql';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AdminUtilService } from '@app/admin/admin-util.service';
import { CoreModule } from '@app/core/core.module';
import { MatCard } from '@angular/material/card';
import { ExtensionPointComponent } from '@projects/extension-point/src/public-api';
import { AdminEntityLinkComponent } from '@app/admin/admin-entity-link/admin-entity-link.component';

@Component({
  selector: 'app-room-details',
  templateUrl: './room-details.component.html',
  styleUrls: ['../admin-styles.scss'],
  imports: [
    LoadingIndicatorComponent,
    FlexModule,
    TranslocoPipe,
    CoreModule,
    MatCard,
    ExtensionPointComponent,
    AdminEntityLinkComponent,
  ],
  providers: [AdminUtilService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomDetailsComponent {
  private readonly adminRoomById = inject(AdminRoomByIdGql);
  private readonly managingMembers = inject(
    AdminRoomManagingMembersByRoomIdGql
  );

  readonly roomId = input.required<string>();

  roomData = computed(() => {
    const room = this.room();
    return [
      {
        label: 'admin.admin-area.name',
        value: room?.name,
      },
      {
        label: 'admin.admin-area.room-number',
        value: room?.shortId,
      },
      {
        label: 'admin.admin-area.id',
        value: room?.id,
      },
      {
        label: 'admin.admin-area.created',
        value: room?.createdAt,
      },
      {
        label: 'admin.admin-area.created-by',
        value: room?.createdBy,
      },
      {
        label: 'admin.admin-area.last-updated',
        value: room?.updatedAt,
      },
      {
        label: 'admin.admin-area.updated-by',
        value: room?.updatedBy,
      },
    ];
  });

  displayRoomData = computed(() => this.roomData().filter((d) => !!d.value));

  readonly roomRef = toSignal(
    toObservable(this.roomId).pipe(
      switchMap((roomId) => {
        return this.adminRoomById.watch({
          variables: { id: roomId },
          fetchPolicy: 'no-cache',
        }).valueChanges;
      })
    )
  );
  readonly room = computed(() => this.roomRef()?.data?.adminRoomById);
  readonly isLoadingDetails = computed(() => this.roomRef()?.loading ?? true);

  readonly membersRef = toSignal(
    toObservable(this.roomId).pipe(
      switchMap((roomId) => {
        return this.managingMembers.watch({ variables: { roomId } })
          .valueChanges;
      })
    )
  );
  readonly members = computed(
    () => this.membersRef()?.data?.adminRoomManagingMembersByRoomId
  );
  readonly isLoadingMembers = computed(() => this.membersRef()?.loading);
}
