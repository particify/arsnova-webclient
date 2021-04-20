import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
import { AuthProvider } from '@arsnova/app/models/auth-provider';

export interface Role {
  name: string;
  value: UserRole;
}

@Component({
  selector: 'app-access',
  templateUrl: './access.component.html',
  styleUrls: ['./access.component.scss']
})
export class AccessComponent implements OnInit {

  @Output() saveEvent: EventEmitter<UpdateEvent> = new EventEmitter<UpdateEvent>();

  @Input() room: Room;
  moderators: Moderator[] = [];
  userIds: string[] = [];
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

  usernameFormControl = new FormControl('', [Validators.email]);

  constructor(private dialogService: DialogService,
              public notificationService: NotificationService,
              public translationService: TranslateService,
              protected moderatorService: ModeratorService,
              protected userService: UserService,
              protected langService: LanguageService,
              public eventService: EventService,
              private authenticationService: AuthenticationService) {
    langService.langEmitter.subscribe(lang => translationService.use(lang));
  }

  ngOnInit() {
    this.selectedRole = this.roles[0];
    this.getModerators();
  }

  getModerators() {
    this.authenticationService.getCurrentAuthentication().subscribe(auth => {
      this.isGuest = auth.authProvider === AuthProvider.ARSNOVA_GUEST;
      this.moderators.push(new Moderator(auth.userId, auth.loginId, [UserRole.CREATOR]));
      if (this.isGuest) {
        this.translationService.get('settings.you').subscribe(msg => {
          this.moderators[0].loginId = msg;
        });
      }
      this.moderatorService.get(this.room.id).subscribe(list => {
        list.forEach((user) => {
          this.userIds.push(user.userId);
        });
        this.userService.getUserData(this.userIds).subscribe(users => {
          users.forEach((user) => {
            this.moderators.push(new Moderator(user.id, user.loginId, [UserRole.EXECUTIVE_MODERATOR]));
          });
          this.isLoading = false;
        });
      });
    });
  }

  addUser() {
    this.userService.getUserByLoginId(this.loginId).subscribe(list => {
      if (list.length === 0) {
        this.translationService.get('settings.user-not-found').subscribe(msg => {
          this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.FAILED);
        });
        return;
      }
      this.moderatorService.add(this.room.id, list[0].id).subscribe(() => {
        this.saveEvent.emit(new UpdateEvent(null, false, true));
        this.moderators.push(new Moderator(list[0].id, this.loginId, [UserRole.EXECUTIVE_MODERATOR]));
        this.translationService.get('settings.user-added').subscribe(msg => {
          this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
        });
        this.loginId = '';
      });
    });
  }

  openDeleteRoomDialog(moderator: Moderator): void {
    const dialogRef = this.dialogService.openDeleteDialog('really-delete-user-rights', moderator.loginId, 'remove');
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
