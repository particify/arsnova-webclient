import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService } from '@jsverse/transloco';
import { ModeratorService } from '@app/core/services/http/moderator.service';
import { Moderator } from '@app/core/models/moderator';
import { UntypedFormControl, Validators } from '@angular/forms';
import { EventService } from '@app/core/services/util/event.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { UserService } from '@app/core/services/http/user.service';
import { Room } from '@app/core/models/room';
import { UserRole } from '@app/core/models/user-roles.enum';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { AuthProvider } from '@app/core/models/auth-provider';
import { debounceTime, map, Subject, take, takeUntil } from 'rxjs';
import { AccessTokenService } from '@app/core/services/http/access-token.service';
import { UpdateEvent } from '@app/creator/settings-page/settings-page.component';
import { HintType } from '@app/core/models/hint-type.enum';
import { FormComponent } from '@app/standalone/form/form.component';
import { FormService } from '@app/core/services/util/form.service';

export interface Role {
  name: string;
  value: UserRole;
}

@Component({
  selector: 'app-access',
  templateUrl: './access.component.html',
  styleUrls: ['./access.component.scss'],
})
export class AccessComponent
  extends FormComponent
  implements OnInit, OnDestroy
{
  @Output() saveEvent: EventEmitter<UpdateEvent> =
    new EventEmitter<UpdateEvent>();

  @Input({ required: true }) room!: Room;
  moderators: Moderator[] = [];
  userIds: string[] = [];
  newModeratorId?: string;
  loginId = '';
  isLoading = true;
  selectedRole = UserRole.MODERATOR;
  UserRole: typeof UserRole = UserRole;
  roles: UserRole[] = [UserRole.MODERATOR];
  isGuest = false;
  loginIdIsEmail = false;

  usernameFormControl = new UntypedFormControl('', [Validators.email]);
  formSubscription = new Subject<void>();
  currentInputIsChecked = true;

  HintType = HintType;

  constructor(
    private dialogService: DialogService,
    public notificationService: NotificationService,
    public translationService: TranslocoService,
    protected moderatorService: ModeratorService,
    protected userService: UserService,
    public eventService: EventService,
    private authenticationService: AuthenticationService,
    private accessTokenService: AccessTokenService,
    protected formService: FormService
  ) {
    super(formService);
  }

  ngOnInit() {
    this.setFormControl(this.usernameFormControl);
    this.selectedRole = this.roles[0];
    this.getModerators();
    this.authenticationService
      .isLoginIdEmailAddress()
      .subscribe((loginIdIsEmail) => {
        this.loginIdIsEmail = loginIdIsEmail;
        this.usernameFormControl.valueChanges
          .pipe(
            map(() => this.changesMade()),
            debounceTime(500),
            takeUntil(this.formSubscription)
          )
          .subscribe(() => {
            this.newModeratorId = undefined;
            if (this.loginIdIsEmail && this.loginId) {
              this.getUser();
            }
          });
      });
  }

  ngOnDestroy() {
    this.formSubscription.next();
    this.formSubscription.unsubscribe();
  }

  changesMade() {
    if (this.loginIdIsEmail) {
      this.currentInputIsChecked = false;
    }
  }

  getModerators() {
    this.authenticationService.getCurrentAuthentication().subscribe((auth) => {
      this.isGuest = auth.authProvider === AuthProvider.ARSNOVA_GUEST;
      if (this.isGuest) {
        this.usernameFormControl.disable();
      }
      this.moderatorService.get(this.room.id).subscribe((moderators) => {
        moderators.forEach((moderator) => {
          this.userIds.push(moderator.userId);
        });
        this.userService.getUserData(this.userIds).subscribe((users) => {
          users.forEach((user) => {
            this.moderators.push(
              new Moderator(
                user.id,
                user.person.displayId,
                moderators.find((m) => m.userId === user.id)?.role
              )
            );
          });
          if (this.isGuest) {
            this.translationService
              .selectTranslate('creator.settings.you')
              .pipe(take(1))
              .subscribe((msg) => {
                this.moderators[0].displayId = msg;
              });
          }
          this.moderators = this.moderators.sort((a) => {
            return a.role === UserRole.OWNER ? -1 : 1;
          });
          this.isLoading = false;
        });
      });
    });
  }

  getUser() {
    this.userService.getUserByDisplayId(this.loginId).subscribe((list) => {
      const userFound = list.length > 0;
      this.currentInputIsChecked = true;
      if (userFound) {
        this.newModeratorId = list[0].id;
        if (!this.loginIdIsEmail) {
          this.addModerator();
        }
      } else if (!this.loginIdIsEmail) {
        const msg = this.translationService.translate(
          'creator.settings.user-not-found'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.FAILED
        );
      }
    });
  }

  addModerator() {
    if (!this.loginIdIsEmail && !this.newModeratorId) {
      this.getUser();
      return;
    }
    if (this.newModeratorId) {
      this.disableForm();
      this.moderatorService
        .add(this.room.id, this.newModeratorId, this.selectedRole)
        .subscribe({
          next: () => {
            this.saveEvent.emit(new UpdateEvent(null, false, true));
            this.moderators.push(
              new Moderator(
                this.newModeratorId,
                this.loginId,
                this.selectedRole
              )
            );
            const msg = this.translationService.translate(
              'creator.settings.user-added'
            );
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.SUCCESS
            );
            this.loginId = '';
            this.enableForm();
          },
          error: () => {
            this.enableForm();
          },
        });
    } else {
      this.inviteModerator();
    }
  }

  inviteModerator() {
    this.accessTokenService
      .invite(this.room.id, this.selectedRole, this.loginId)
      .subscribe(() => {
        const msg = this.translationService.translate(
          'creator.settings.user-invited'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.SUCCESS
        );
        this.loginId = '';
      });
  }

  removeModerator(moderator: Moderator): void {
    const dialogRef = this.dialogService.openDeleteDialog(
      'room-moderator',
      'creator.dialog.really-delete-user-rights',
      moderator.displayId,
      'dialog.remove',
      () => this.moderatorService.delete(this.room.id, moderator.userId)
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.saveEvent.emit(new UpdateEvent(null, false, true));
        const msg = this.translationService.translate(
          'creator.settings.user-removed'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
        this.moderators.splice(this.moderators.indexOf(moderator), 1);
      }
    });
  }

  canBeAdded(): boolean {
    return !!this.newModeratorId || !this.loginIdIsEmail;
  }

  updateSelectedRole(role: UserRole) {
    this.selectedRole = role;
  }
}
