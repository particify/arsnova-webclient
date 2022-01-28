import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { AdvancedSnackBarTypes, NotificationService } from '../../../services/util/notification.service';
import { UserService } from '../../../services/http/user.service';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '../../../services/util/dialog.service';
import { ClientAuthentication } from '../../../models/client-authentication';
import { Router } from '@angular/router';
import { User } from '../../../models/user';
import { Person } from '../../../models/person';

export class FormField {
  value: string;
  name: string;
  label: string;

  constructor(value: string, name: string, label: string,) {
    this.value = value;
    this.name = name;
    this.label = label;
  }
}

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  @ViewChild('messageButton', {static: true}) announceButton: ElementRef;

  auth: ClientAuthentication;
  user: User;
  formFields: FormField[] = [];
  isLoading = true;

  constructor(private authenticationService: AuthenticationService,
              private userService: UserService,
              private translationService: TranslateService,
              private notificationService: NotificationService,
              private dialogService: DialogService,
              private router: Router) { }

  ngOnInit(): void {
    this.authenticationService.getCurrentAuthentication().subscribe(auth => {
      this.auth = auth;
      this.userService.getUserByLoginId(this.auth.loginId, true).subscribe(user => {
        this.user = user[0];
        this.formFields = [
          new FormField(this.user.person?.firstName, 'firstName', 'first-name'),
          new FormField(this.user.person?.lastName,'lastName', 'last-name'),
          new FormField(this.user.person?.organization, 'organization', 'organization'),
          new FormField(this.user.person?.department, 'department', 'department')
        ];
        this.isLoading = false;
        this.announceButton.nativeElement.focus();
      });
    });
  }

  deleteAccount(id: string) {
    this.userService.delete(id).subscribe(
      () => {
        this.authenticationService.logout();
        this.translationService.get('header.account-deleted').subscribe(msg => {
          this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
        });
        this.navToHome();
      }
    );
  }

  openDeleteUserDialog() {
    const dialogRef = this.dialogService.openDeleteDialog('really-delete-account');
    dialogRef.afterClosed().subscribe(result => {
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

  update(field: FormField) {
    const person = this.user.person || new Person();
    person[field.name] = field.value;
    const updatedUser = this.user;
    updatedUser.person = person;
    this.userService.updateUser(updatedUser).subscribe(user => {
      this.user = user;
    });
  }
}
