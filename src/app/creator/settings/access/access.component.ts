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
import { TranslateService } from '@ngx-translate/core';
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
import { debounceTime, map, Subject, takeUntil } from 'rxjs';
import { AccessTokenService } from '@app/core/services/http/access-token.service';
import { UpdateEvent } from '@app/creator/settings-page/settings-page.component';

export interface Role {
  name: string;
  value: UserRole;
}

@Component({
  selector: 'app-access',
  templateUrl: './access.component.html',
  styleUrls: ['./access.component.scss'],
})
export class AccessComponent implements OnInit, OnDestroy {
  @Output() saveEvent: EventEmitter<UpdateEvent> =
    new EventEmitter<UpdateEvent>();

  @Input() room: Room;
  moderators: Moderator[] = [];
  userIds: string[] = [];
  newModeratorId: string;
  loginId = '';
  isLoading = true;
  selectedRole: UserRole;
  UserRole: typeof UserRole = UserRole;
  roles: UserRole[] = [UserRole.MODERATOR];
  isGuest = false;
  loginIdIsEmail = false;

  usernameFormControl = new UntypedFormControl('', [Validators.email]);
  formSubscription = new Subject<void>();
  currentInputIsChecked = true;

  constructor(
    private dialogService: DialogService,
    public notificationService: NotificationService,
    public translationService: TranslateService,
    protected moderatorService: ModeratorService,
    protected userService: UserService,
    public eventService: EventService,
    private authenticationService: AuthenticationService,
    private accessTokenService: AccessTokenService
  ) {}

  ngOnInit() {
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
            this.newModeratorId = null;
            if (this.loginIdIsEmail) {
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
                user.loginId,
                moderators.find((m) => m.userId === user.id).role
              )
            );
          });
          if (this.isGuest) {
            this.translationService.get('settings.you').subscribe((msg) => {
              this.moderators[0].loginId = msg;
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
    this.userService.getUserByLoginId(this.loginId).subscribe((list) => {
      const userFound = list.length > 0;
      this.currentInputIsChecked = true;
      if (userFound) {
        this.newModeratorId = list[0].id;
        if (!this.loginIdIsEmail) {
          this.addModerator();
        }
      } else if (!this.loginIdIsEmail) {
        const msg = this.translationService.instant('settings.user-not-found');
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
      this.moderatorService
        .add(this.room.id, this.newModeratorId, this.selectedRole)
        .subscribe(() => {
          this.saveEvent.emit(new UpdateEvent(null, false, true));
          this.moderators.push(
            new Moderator(this.newModeratorId, this.loginId, this.selectedRole)
          );
          const msg = this.translationService.instant('settings.user-added');
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.SUCCESS
          );
          this.loginId = '';
        });
    } else {
      this.inviteModerator();
    }
  }

  inviteModerator() {
    this.accessTokenService
      .invite(this.room.id, this.selectedRole, this.loginId)
      .subscribe(() => {
        const msg = this.translationService.instant('settings.user-invited');
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.SUCCESS
        );
        this.loginId = '';
      });
  }

  openDeleteRoomDialog(moderator: Moderator): void {
    const dialogRef = this.dialogService.openDeleteDialog(
      'room-moderator',
      'really-delete-user-rights',
      moderator.loginId,
      'remove'
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'remove') {
        this.removeModerator(
          moderator.userId,
          this.moderators.indexOf(moderator)
        );
      }
    });
  }

  removeModerator(userId: string, index: number) {
    this.moderatorService.delete(this.room.id, userId).subscribe(() => {
      this.saveEvent.emit(new UpdateEvent(null, false, true));
      const msg = this.translationService.instant('settings.user-removed');
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      this.moderators.splice(index, 1);
    });
  }

  canBeAdded(): boolean {
    return !!this.newModeratorId || !this.loginIdIsEmail;
  }

  updateSelectedRole(role: UserRole) {
    this.selectedRole = role;
  }
}
