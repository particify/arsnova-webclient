import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { UserService } from '@app/core/services/http/user.service';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '@app/core/services/util/dialog.service';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '@app/core/models/user';
import { Person } from '@app/core/models/person';
import { AuthProvider } from '@app/core/models/auth-provider';
import { UserSettings } from '@app/core/models/user-settings';
import { Location } from '@angular/common';
import { HintType } from '@app/core/models/hint-type.enum';

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
  @ViewChild('messageButton', { static: true }) announceButton: ElementRef;

  auth: ClientAuthentication;
  user: User;
  formFields: FormField[] = [];
  isGuest = false;
  isLoading = true;

  settings: UserSettings;
  page: string;

  HintType = HintType;

  constructor(
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private translationService: TranslateService,
    private notificationService: NotificationService,
    private dialogService: DialogService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.page = this.route.snapshot.params['accountSettingsName'];
    this.authenticationService.getCurrentAuthentication().subscribe((auth) => {
      this.auth = auth;
      this.isGuest = auth.authProvider === AuthProvider.ARSNOVA_GUEST;
      this.userService
        .getUserByLoginId(this.auth.loginId, true)
        .subscribe((user) => {
          this.user = user[0];
          this.settings = this.user.settings || new UserSettings();
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
          this.announceButton.nativeElement.focus();
        });
    });
  }

  deleteAccount(id: string) {
    this.userService.delete(id).subscribe(() => {
      this.authenticationService.logout();
      this.translationService.get('header.account-deleted').subscribe((msg) => {
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
      });
      this.navToHome();
    });
  }

  openDeleteUserDialog() {
    const dialogRef = this.dialogService.openDeleteDialog(
      'account',
      'really-delete-account'
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'abort') {
        return;
      } else if (result === 'delete') {
        this.deleteAccount(this.auth.userId);
      }
    });
  }

  navToHome() {
    this.router.navigate(['/']);
  }

  updatePerson(field: FormField) {
    const person = this.user.person || new Person();
    person[field.name] = field.value;
    this.updateUser('person', person);
  }

  updateSettings(value: boolean, propertyName: string) {
    this.settings[propertyName] = value;
    this.updateUser('settings', this.settings);
  }

  updateUser(propertyName: string, value: object) {
    const changes = {};
    changes[propertyName] = value;
    this.userService.updateUser(this.user.id, changes).subscribe((user) => {
      this.user = user;
    });
  }

  updatePage(page: string) {
    this.page = page;
    this.location.replaceState(`account/${this.page}`);
  }
}
