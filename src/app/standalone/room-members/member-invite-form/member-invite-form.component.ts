import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  ReactiveFormsModule,
  UntypedFormControl,
  Validators,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import {
  MatOption,
  MatSelect,
  MatSelectTrigger,
} from '@angular/material/select';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { HintType } from '@app/core/models/hint-type.enum';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import {
  EventCategory,
  TrackingService,
} from '@app/core/services/util/tracking.service';
import { FormComponent } from '@app/standalone/form/form.component';
import { HintComponent } from '@app/standalone/hint/hint.component';
import { AssignableRolesService } from '@app/standalone/room-members/assignable-roles';
import { RoomMembersService } from '@app/standalone/room-members/room-members.service';
import {
  GrantRoomRoleByInvitationGql,
  GrantRoomRoleGql,
  RoomRole,
  UserByDisplayIdGql,
} from '@gql/generated/graphql';
import { ErrorClassification } from '@gql/helper/handle-operation-error';
import { map, startWith } from 'rxjs';

/**
 * Adds an existing user to the room's team, or invites them by mail address where login IDs are
 * mail addresses. The account is only looked up on submit.
 */
@Component({
  selector: 'app-member-invite-form',
  templateUrl: './member-invite-form.component.html',
  styleUrls: ['./member-invite-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    HintComponent,
    MatButton,
    MatError,
    MatFormField,
    MatIcon,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    MatSelectTrigger,
    ReactiveFormsModule,
    TranslocoPipe,
  ],
})
export class MemberInviteFormComponent extends FormComponent {
  private readonly assignableRolesService = inject(AssignableRolesService);
  private readonly authenticationService = inject(AuthenticationService);
  private readonly grantRoomRoleGql = inject(GrantRoomRoleGql);
  private readonly grantRoomRoleByInvitationGql = inject(
    GrantRoomRoleByInvitationGql
  );
  private readonly notificationService = inject(NotificationService);
  private readonly roomMembersService = inject(RoomMembersService);
  private readonly trackingService = inject(TrackingService);
  private readonly translationService = inject(TranslocoService);
  private readonly userByDisplayId = inject(UserByDisplayIdGql);

  readonly roomId = input.required<string>();

  selectedRole = RoomRole.Moderator;
  loginIdIsEmail = false;
  private readonly user = toSignal(
    this.authenticationService.getCurrentAuthentication()
  );
  readonly isGuest = computed(() => !this.user()?.verified);

  readonly usernameFormControl = new UntypedFormControl('');
  private readonly input = toSignal(
    this.usernameFormControl.valueChanges.pipe(
      startWith(this.usernameFormControl.value),
      map((value: string | null) => (value ?? '').trim())
    ),
    { initialValue: '' }
  );

  readonly HintType = HintType;

  constructor() {
    super();
    // Set here rather than in ngAfterViewInit so the guest state below already applies to the
    // real control on the first change detection pass.
    this.setFormControl(this.usernameFormControl);
    this.authenticationService
      .isLoginIdEmailAddress()
      .pipe(takeUntilDestroyed())
      .subscribe((loginIdIsEmail) => {
        this.loginIdIsEmail = loginIdIsEmail;
        this.usernameFormControl.setValidators(
          loginIdIsEmail ? [Validators.email] : []
        );
        this.usernameFormControl.updateValueAndValidity();
      });
    // Guests may not assign access rights. Applied to this form's own controls instead of
    // disableForm(), whose disabled state FormService shares with every other form.
    effect(() => {
      this.formDisabled = this.isGuest();
      this.handleFormChanges();
    });
  }

  /** Keeps this form disabled for guests even when another form re-enables the shared state. */
  protected override handleFormChanges(): void {
    this.formDisabled = this.formDisabled || this.isGuest();
    super.handleFormChanges();
  }

  roles(): RoomRole[] {
    return this.assignableRolesService.getRoles();
  }

  canSubmit(): boolean {
    return (
      !!this.input() && this.usernameFormControl.valid && !this.formDisabled
    );
  }

  /** Looks the account up, then adds it, or invites the address where it has none. */
  submit() {
    if (!this.canSubmit()) {
      this.usernameFormControl.markAsTouched();
      return;
    }
    const loginId = this.input();
    this.disableForm();
    this.userByDisplayId
      .fetch({ variables: { displayId: loginId }, fetchPolicy: 'network-only' })
      .pipe(map((r) => r.data?.userByDisplayId?.id))
      .subscribe({
        next: (userId) =>
          userId ? this.grant(userId) : this.handleUnknownUser(loginId),
        error: (e) => this.handleUnknownUser(loginId, e),
      });
  }

  private handleUnknownUser(loginId: string, error?: unknown) {
    if (this.loginIdIsEmail) {
      this.invite(loginId);
      return;
    }
    this.enableForm();
    const notFound = {
      message: this.translationService.translate('share.user-not-found'),
      type: AdvancedSnackBarTypes.FAILED,
    };
    if (error) {
      this.notificationService.showOnRequestClientError(error, {
        [ErrorClassification.NotFound]: notFound,
      });
    } else {
      this.notificationService.showAdvanced(notFound.message, notFound.type);
    }
  }

  private grant(userId: string) {
    this.track('Room member role assigned');
    this.grantRoomRoleGql
      .mutate({
        variables: { roomId: this.roomId(), userId, role: this.selectedRole },
      })
      .subscribe({
        next: (r) => {
          this.enableForm();
          if (r?.data?.grantRoomRole) {
            this.added('share.user-added');
          }
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
  }

  private invite(mailAddress: string) {
    this.track('Room member role invited');
    this.grantRoomRoleByInvitationGql
      .mutate({
        variables: {
          roomId: this.roomId(),
          mailAddress,
          role: this.selectedRole,
        },
      })
      .subscribe({
        next: (r) => {
          this.enableForm();
          if (r.data?.grantRoomRoleByInvitation) {
            this.added('share.user-invited');
          }
        },
        error: () => this.enableForm(),
      });
  }

  private track(action: string) {
    this.trackingService.addEvent(
      EventCategory.UI_INTERACTION,
      action,
      this.selectedRole
    );
  }

  private added(messageKey: string) {
    this.roomMembersService.refetchMembers(this.roomId()).subscribe();
    this.notificationService.showAdvanced(
      this.translationService.translate(messageKey),
      AdvancedSnackBarTypes.SUCCESS
    );
    this.usernameFormControl.reset('');
  }
}
