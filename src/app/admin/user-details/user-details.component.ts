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
  AdminRoomMembershipsByUserIdGql,
  AdminUser,
  AdminUserByIdGql,
} from '@gql/generated/graphql';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AdminUtilService } from '@app/admin/admin-util.service';
import { CoreModule } from '@app/core/core.module';
import { MatCard } from '@angular/material/card';
import { ExtensionPointComponent } from '@projects/extension-point/src/public-api';
import { AdminEntityLinkComponent } from '@app/admin/admin-entity-link/admin-entity-link.component';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
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
export class UserDetailsComponent {
  private readonly adminUserById = inject(AdminUserByIdGql);
  private readonly adminMemberships = inject(AdminRoomMembershipsByUserIdGql);

  readonly userId = input.required<string>();

  userData = computed(() => {
    const user = this.user();
    const status = user ? this.determineStatus(user) : undefined;
    return [
      {
        label: 'admin.admin-area.username',
        value: user?.username,
      },
      {
        label: 'admin.admin-area.mail-address',
        value: user?.mailAddress,
      },
      {
        label: 'admin.admin-area.unverified-mail-address',
        value: user?.unverifiedMailAddress,
      },
      {
        label: 'admin.admin-area.id',
        value: user?.id,
      },
      {
        label: 'admin.admin-area.status',
        value: status,
      },
      {
        label: 'admin.admin-area.created',
        value: user?.createdAt,
      },
      {
        label: 'admin.admin-area.last-activity',
        value: user?.lastActivityAt,
      },
      {
        label: 'admin.admin-area.last-updated',
        value: user?.updatedAt,
      },
    ];
  });

  displayUserData = computed(() => this.userData().filter((d) => !!d.value));

  readonly userRef = toSignal(
    toObservable(this.userId).pipe(
      switchMap((userId) => {
        return this.adminUserById.watch({
          variables: { id: userId },
          fetchPolicy: 'no-cache',
        }).valueChanges;
      })
    )
  );
  readonly user = computed(() => this.userRef()?.data?.adminUserById);
  readonly isLoadingDetails = computed(() => this.userRef()?.loading ?? true);

  readonly membershipsRef = toSignal(
    toObservable(this.userId).pipe(
      switchMap((userId) => {
        return this.adminMemberships.watch({ variables: { userId } })
          .valueChanges;
      })
    )
  );
  readonly memberships = computed(() =>
    this.membershipsRef()
      ?.data?.adminRoomMembershipsByUserId?.edges?.filter((e) => !!e)
      .map((e) => e?.node)
  );
  readonly isLoadingMemberships = computed(
    () => this.membershipsRef()?.loading ?? true
  );

  private determineStatus(
    user: Pick<
      AdminUser,
      | 'username'
      | 'verificationExpiresAt'
      | 'unverifiedMailAddress'
      | 'mailAddress'
    >
  ) {
    return user.verificationExpiresAt
      ? user.unverifiedMailAddress
        ? user.mailAddress
          ? 'changing mail'
          : 'pending'
        : 'password reset'
      : user.username
        ? 'verified'
        : 'guest';
  }
}
