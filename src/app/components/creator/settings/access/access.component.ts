import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AdvancedSnackBarTypes, NotificationService } from '../../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { ModeratorService } from '../../../../services/http/moderator.service';
import { LanguageService } from '../../../../services/util/language.service';
import { Moderator } from '../../../../models/moderator';
import { FormControl, Validators } from '@angular/forms';
import { EventService } from '../../../../services/util/event.service';
import { DialogService } from '../../../../services/util/dialog.service';
import { UpdateEvent } from '../settings.component';
import { UserService } from '../../../../services/http/user.service';
import { Room } from '../../../../models/room';
import { UserRole } from '../../../../models/user-roles.enum';
import { AuthenticationService } from '../../../../services/http/authentication.service';
import { AuthProvider } from '../../../../models/auth-provider';
import { debounceTime, map, Subject, takeUntil } from 'rxjs';
import { AccessTokenService } from '../../../../services/http/access-token.service';

export interface Role {
  name: string;
  value: UserRole;
}

@Component({
  selector: 'app-access',
  templateUrl: './access.component.html',
  styleUrls: ['./access.component.scss']
})
export class AccessComponent implements OnInit, OnDestroy {

  @Output() saveEvent: EventEmitter<UpdateEvent> = new EventEmitter<UpdateEvent>();

  @Input() room: Room;
  moderators: Moderator[] = [];
  userIds: string[] = [];
  userFound = false;
  newModeratorId: string;
  loginId = '';
  isLoading = true;
  selectedRole: Role;
  UserRole: typeof UserRole = UserRole;
  roles: Role[] = [
    {
      name: 'executive_moderator',
      value: UserRole.EXECUTIVE_MODERATOR
    }
   ];
  isGuest = false;
  loginIdIsEmail = false;

  usernameFormControl = new FormControl('', [Validators.email]);
  formSubscription = new Subject<void>();
  currentInputIsChecked = true;


  constructor(private dialogService: DialogService,
              public notificationService: NotificationService,
              public translationService: TranslateService,
              protected moderatorService: ModeratorService,
              protected userService: UserService,
              protected langService: LanguageService,
              public eventService: EventService,
              private authenticationService: AuthenticationService,
              private accessTokenService: AccessTokenService) {
    langService.langEmitter.subscribe(lang => translationService.use(lang));
  }

  ngOnInit() {
    this.selectedRole = this.roles[0];
    this.getModerators();
    this.authenticationService.isLoginIdEmailAddress().subscribe(loginIdIsEmail => {
      this.loginIdIsEmail = loginIdIsEmail;
      if (this.loginIdIsEmail) {
        this.usernameFormControl.valueChanges.pipe(map(() => this.changesMade()), debounceTime(500), takeUntil(this.formSubscription)).subscribe(() => this.getUser());
      } else {
        this.userFound = true;
      }
    });
  }

  ngOnDestroy() {
    this.formSubscription.next();
    this.formSubscription.unsubscribe();
  }

  changesMade() {
    this.currentInputIsChecked = false;
  }

  getModerators() {
    this.authenticationService.getCurrentAuthentication().subscribe(auth => {
      this.isGuest = auth.authProvider === AuthProvider.ARSNOVA_GUEST;
      this.moderatorService.get(this.room.id).subscribe(moderators => {
        moderators.forEach((moderator) => {
          this.userIds.push(moderator.userId);
        });
        this.userService.getUserData(this.userIds).subscribe(users => {
          users.forEach((user) => {
            this.moderators.push(new Moderator(user.id, user.loginId, moderators.find(m => m.userId === user.id).role));
          });
          if (this.isGuest) {
            this.translationService.get('settings.you').subscribe(msg => {
              this.moderators[0].loginId = msg;
            });
          }
          this.moderators = this.moderators.sort(a => {
            return a.role === UserRole.CREATOR ? -1 : 1;
          });
          this.isLoading = false;
        });
      });
    });
  }

  getUser() {
    this.userService.getUserByLoginId(this.loginId).subscribe(list => {
      this.userFound = list.length > 0;
      this.currentInputIsChecked = true;
      if (this.userFound) {
        this.newModeratorId = list[0].id;
        if (!this.loginIdIsEmail) {
          this.addModerator();
        }
      } else if(!this.loginIdIsEmail) {
        this.translationService.get('settings.user-not-found').subscribe(msg => {
          this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.FAILED);
        });
      }
    });
  }

  addModerator() {
    if (this.userFound) {
      this.moderatorService.add(this.room.id, this.newModeratorId).subscribe(() => {
        this.saveEvent.emit(new UpdateEvent(null, false, true));
        this.moderators.push(new Moderator(this.newModeratorId, this.loginId, UserRole.EXECUTIVE_MODERATOR));
        this.translationService.get('settings.user-added').subscribe(msg => {
          this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
        });
        this.loginId = '';
      });
    } else {
      if (this.loginIdIsEmail) {
        this.inviteModerator();
      } else {
        this.getUser();
      }
    }
  }

  inviteModerator() {
    this.accessTokenService.invite(this.room.id, UserRole.EXECUTIVE_MODERATOR, this.loginId).subscribe(() => {
      this.translationService.get('settings.user-invited').subscribe(msg => {
        this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
        this.loginId = '';
      });
    });
  }

  openDeleteRoomDialog(moderator: Moderator): void {
    const dialogRef = this.dialogService.openDeleteDialog('room-moderator', 'really-delete-user-rights', moderator.loginId, 'remove');
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'remove') {
        this.removeModerator(moderator.userId, this.moderators.indexOf(moderator));
      }
    });
  }

  removeModerator(userId: string, index: number) {
    this.moderatorService.delete(this.room.id, userId).subscribe(() => {
      this.saveEvent.emit(new UpdateEvent(null, false, true));
      this.translationService.get('settings.user-removed').subscribe(msg => {
        this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      });
      this.moderators.splice(index, 1);
    });
  }
}
