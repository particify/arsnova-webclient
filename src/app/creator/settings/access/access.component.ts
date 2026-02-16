import {
  AfterViewInit,
  Component,
  DestroyRef,
  Injector,
  OnDestroy,
  inject,
  input,
} from '@angular/core';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import {
  UntypedFormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { EventService } from '@app/core/services/util/event.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { UserRole } from '@app/core/models/user-roles.enum';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import {
  catchError,
  debounceTime,
  filter,
  map,
  of,
  shareReplay,
  switchMap,
} from 'rxjs';
import { HintType } from '@app/core/models/hint-type.enum';
import { FormComponent } from '@app/standalone/form/form.component';
import { FlexModule } from '@angular/flex-layout';
import { HintComponent } from '@app/standalone/hint/hint.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { ExtensionPointComponent } from '@projects/extension-point/src/lib/extension-point.component';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { MatButton, MatIconButton } from '@angular/material/button';
import { TrackInteractionDirective } from '@app/core/directives/track-interaction.directive';
import { MatIcon } from '@angular/material/icon';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { MatList, MatListItem } from '@angular/material/list';
import { NgClass } from '@angular/common';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { MatChipListbox, MatChipOption } from '@angular/material/chips';
import {
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import {
  GrantRoomRoleByInvitationGql,
  GrantRoomRoleGql,
  RevokeRoomRoleGql,
  RoomManagingMembersByRoomIdGql,
  RoomMemberFragment,
  RoomRole,
  UserByDisplayIdGql,
} from '@gql/generated/graphql';
import { ErrorClassification } from '@gql/helper/handle-operation-error';
import { MatTooltip } from '@angular/material/tooltip';

export interface Role {
  name: string;
  value: UserRole;
}

@Component({
  selector: 'app-access',
  templateUrl: './access.component.html',
  styleUrls: ['./access.component.scss'],
  imports: [
    FlexModule,
    HintComponent,
    MatFormField,
    MatLabel,
    MatInput,
    FormsModule,
    ReactiveFormsModule,
    ExtensionPointComponent,
    MatSelect,
    MatOption,
    MatButton,
    TrackInteractionDirective,
    MatIcon,
    LoadingIndicatorComponent,
    MatList,
    MatListItem,
    NgClass,
    ExtendedModule,
    MatChipListbox,
    MatChipOption,
    MatIconButton,
    TranslocoPipe,
    MatTooltip,
  ],
})
export class AccessComponent
  extends FormComponent
  implements AfterViewInit, OnDestroy
{
  private injector = inject(Injector);
  private destroyRef = inject(DestroyRef);
  private dialogService = inject(DialogService);
  notificationService = inject(NotificationService);
  translationService = inject(TranslocoService);
  eventService = inject(EventService);
  private authenticationService = inject(AuthenticationService);
  private membersByRoomIdGql = inject(RoomManagingMembersByRoomIdGql);
  private userByDisplayId = inject(UserByDisplayIdGql);
  private grantRoomRoleGql = inject(GrantRoomRoleGql);
  private grantRoomRoleByInvitationGql = inject(GrantRoomRoleByInvitationGql);
  private revokeRoomRoleGql = inject(RevokeRoomRoleGql);

  roomId = input.required<string>();
  userIds: string[] = [];
  newMemberId?: string;
  loginId = '';
  selectedRole = RoomRole.Moderator;
  RoomRole: typeof RoomRole = RoomRole;
  roles: RoomRole[] = [RoomRole.Moderator];
  isGuest = false;
  loginIdIsEmail = false;

  usernameFormControl = new UntypedFormControl('', [Validators.email]);
  currentInputIsChecked = true;

  HintType = HintType;

  private readonly membersQueryRef$ = toObservable(this.roomId).pipe(
    map((roomId) => this.membersByRoomIdGql.watch({ variables: { roomId } })),
    shareReplay(1)
  );
  readonly isLoading = toSignal(
    this.membersQueryRef$.pipe(
      switchMap((ref) => ref.valueChanges),
      map((r) => r.loading),
      catchError(() => of(false))
    )
  );
  readonly errors = toSignal(
    this.membersQueryRef$.pipe(
      switchMap((ref) => ref.valueChanges),
      map((r) => r.error),
      catchError(() => of(true))
    )
  );
  readonly members = toSignal(
    this.membersQueryRef$.pipe(
      switchMap((ref) => ref.valueChanges),
      filter((r) => r.dataState === 'complete'),
      map((r) => r.data.roomManagingMembersByRoomId ?? []),
      map((m) => m.toSorted((a) => (a.role === RoomRole.Owner ? -1 : 1))),
      catchError(() => of())
    ),
    { initialValue: [], injector: this.injector }
  );

  ngAfterViewInit() {
    this.setFormControl(this.usernameFormControl);
    this.selectedRole = this.roles[0];
    this.authenticationService
      .isLoginIdEmailAddress()
      .subscribe((loginIdIsEmail) => {
        this.loginIdIsEmail = loginIdIsEmail;
      });
    this.usernameFormControl.valueChanges
      .pipe(
        map(() => this.changesMade()),
        debounceTime(500),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.newMemberId = undefined;
        if (this.loginIdIsEmail && this.loginId) {
          this.getUser();
        }
      });
  }

  changesMade() {
    if (this.loginIdIsEmail) {
      this.currentInputIsChecked = false;
    }
  }

  getUser() {
    this.userByDisplayId
      .fetch({ variables: { displayId: this.loginId } })
      .pipe(map((r) => r.data?.userByDisplayId))
      .subscribe({
        next: (u) => {
          this.currentInputIsChecked = true;
          if (u) {
            this.newMemberId = u.id;
            if (!this.loginIdIsEmail) {
              this.addModerator();
            }
          }
        },
        error: (e) => {
          if (this.loginIdIsEmail) {
            this.currentInputIsChecked = true;
          } else {
            this.notificationService.showOnRequestClientError(e, {
              [ErrorClassification.NotFound]: {
                message: this.translationService.translate(
                  'creator.settings.user-not-found'
                ),
                type: AdvancedSnackBarTypes.FAILED,
              },
            });
          }
        },
      });
  }

  addModerator() {
    if (!this.loginIdIsEmail && !this.newMemberId) {
      this.getUser();
      return;
    }
    if (this.newMemberId) {
      this.disableForm();
      this.grantRoomRoleGql
        .mutate({
          variables: {
            roomId: this.roomId(),
            userId: this.newMemberId,
            role: this.selectedRole,
          },
        })
        .subscribe({
          next: (r) => {
            this.enableForm();
            if (!r?.data?.grantRoomRole) {
              return;
            }
            this.membersQueryRef$.subscribe((ref) => ref.refetch());
            const msg = this.translationService.translate(
              'creator.settings.user-added'
            );
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.SUCCESS
            );
            this.loginId = '';
          },
          error: (e) => {
            this.enableForm();
            this.notificationService.showOnRequestClientError(e, {
              [ErrorClassification.BadRequest]: {
                message: this.translationService.translate(
                  'errors.something-went-wrong'
                ),
                type: AdvancedSnackBarTypes.FAILED,
              },
            });
          },
        });
    } else {
      this.inviteModerator();
    }
  }

  inviteModerator() {
    this.grantRoomRoleByInvitationGql
      .mutate({
        variables: {
          roomId: this.roomId(),
          mailAddress: this.loginId,
          role: this.selectedRole,
        },
      })
      .subscribe({
        complete: () => this.enableForm(),
        next: (r) => {
          if (!r.data?.grantRoomRoleByInvitation) {
            return;
          }
          this.membersQueryRef$.subscribe((ref) => ref.refetch());
          const msg = this.translationService.translate(
            'creator.settings.user-invited'
          );
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.SUCCESS
          );
          this.loginId = '';
        },
      });
  }

  removeModerator(member: RoomMemberFragment): void {
    const dialogRef = this.dialogService.openDeleteDialog(
      'room-moderator',
      'creator.dialog.really-delete-user-rights',
      member.user.displayId ?? member.user.id,
      'dialog.remove',
      () =>
        this.revokeRoomRoleGql.mutate({
          variables: { roomId: this.roomId(), userId: member.user?.id },
          update: (cache, { data }) => {
            if (data?.revokeRoomRole) {
              const cacheId = cache.identify(member);
              if (cacheId) {
                cache.evict({ id: cacheId });
                cache.gc();
              }
            }
          },
        })
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const msg = this.translationService.translate(
          'creator.settings.user-removed'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
      }
    });
  }

  canBeAdded(): boolean {
    return !!this.newMemberId || !this.loginIdIsEmail;
  }

  updateSelectedRole(role: RoomRole) {
    this.selectedRole = role;
  }
}
