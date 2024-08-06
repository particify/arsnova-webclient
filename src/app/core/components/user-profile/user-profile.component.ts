import { Component, Input, OnInit } from '@angular/core';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { UserService } from '@app/core/services/http/user.service';
import { TranslocoService } from '@jsverse/transloco';
import { DialogService } from '@app/core/services/util/dialog.service';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { Router } from '@angular/router';
import { User } from '@app/core/models/user';
import { Person } from '@app/core/models/person';
import { AuthProvider } from '@app/core/models/auth-provider';
import { UserSettings } from '@app/core/models/user-settings';
import { Location } from '@angular/common';
import { HintType } from '@app/core/models/hint-type.enum';
import { take } from 'rxjs';

export class FormField {
  value: string;
  name: string;
  label: string;

  constructor(value: string, name: string, label: string) {
    this.value = value;
    this.name = name;
    this.label = label;
  }
}

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
  // Route data input below
  @Input() accountSettingsName?: string;
  // TODO: non-null assertion operator is used here temporaly. We need to use a resolver here to move async logic out of component.
  auth!: ClientAuthentication;
  user!: User;
  formFields: FormField[] = [];
  isGuest = false;
  isLoading = true;

  settings = new UserSettings();

  HintType = HintType;

  constructor(
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private translationService: TranslocoService,
    private notificationService: NotificationService,
    private dialogService: DialogService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.authenticationService.getCurrentAuthentication().subscribe((auth) => {
      this.auth = auth;
      this.isGuest = auth.authProvider === AuthProvider.ARSNOVA_GUEST;
      this.userService
        .getById(this.auth.userId, { view: 'owner' })
        .subscribe((user) => {
          this.user = user;
          if (this.user.settings) {
            this.settings = this.user.settings;
          }
          this.formFields = [
            new FormField(
              this.user.person?.firstName,
              'firstName',
              'first-name'
            ),
            new FormField(this.user.person?.lastName, 'lastName', 'last-name'),
            new FormField(
              this.user.person?.organization,
              'organization',
              'organization'
            ),
            new FormField(
              this.user.person?.department,
              'department',
              'department'
            ),
            new FormField(this.user.person?.mail, 'mail', 'mail'),
          ];
          this.isLoading = false;
        });
    });
  }

  deleteAccount() {
    const dialogRef = this.dialogService.openDeleteDialog(
      'account',
      'dialog.really-delete-account',
      undefined,
      undefined,
      () => this.userService.delete(this.auth.userId)
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.authenticationService.logout();
        this.translationService
          .selectTranslate('header.account-deleted')
          .pipe(take(1))
          .subscribe((msg) => {
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.WARNING
            );
          });
        this.navToHome();
      }
    });
  }

  navToHome() {
    this.router.navigate(['/']);
  }

  updatePerson(field: FormField) {
    const person = this.user.person || new Person();
    person[field.name as keyof Person] = field.value;
    this.updateUser('person', person);
  }

  updateSettings(value: boolean, propertyName: string) {
    this.settings[propertyName as keyof UserSettings] = value;
    this.updateUser('settings', this.settings);
  }

  updateUser(propertyName: string, value: object) {
    const changes: { [key: string]: object } = {};
    changes[propertyName] = value;
    this.userService.updateUser(this.user.id, changes).subscribe((user) => {
      this.user = user;
    });
  }

  updatePage(page: string) {
    this.accountSettingsName = page;
    this.location.replaceState(`account/${this.accountSettingsName}`);
  }
}
