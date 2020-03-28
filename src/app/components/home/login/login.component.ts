import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../../services/util/notification.service';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { UserRole } from '../../../models/user-roles.enum';
import { TranslateService } from '@ngx-translate/core';
import { EventService } from '../../../services/util/event.service';
import { ApiConfigService } from '../../../services/http/api-config.service';
import { AuthenticationProvider, AuthenticationProviderType } from '../../../models/api-config';
import { DialogService } from '../../../services/util/dialog.service';

export class LoginErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return (control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnChanges {

  role = UserRole.PARTICIPANT;
  isStandard = true;
  username: string;
  password: string;
  allowGuest = false;
  allowDbLogin = false;
  ssoProviders: AuthenticationProvider[];
  isLoading = true;

  usernameFormControl = new FormControl('', [Validators.required, Validators.email]);
  passwordFormControl = new FormControl('', [Validators.required]);

  matcher = new LoginErrorStateMatcher();

  constructor(public authenticationService: AuthenticationService,
              public router: Router,
              private translationService: TranslateService,
              public notificationService: NotificationService,
              public dialog: MatDialog,
              public eventService: EventService,
              private apiConfigService: ApiConfigService,
              private dialogService: DialogService) {
  }

  ngOnInit() {
    if (this.authenticationService.isLoggedIn()) {
      this.router.navigate(['home']);
    } else {
      this.apiConfigService.getApiConfig$().subscribe(config => {
        const authProviders = config.authenticationProviders;
        if (authProviders.some(provider => provider.type === AuthenticationProviderType.ANONYMOUS)) {
          this.allowGuest = true;
        }
        if (authProviders.some(provider => provider.type === AuthenticationProviderType.USERNAME_PASSWORD)) {
          this.allowDbLogin = true;
        }
        this.ssoProviders = authProviders.filter((p) => p.type === AuthenticationProviderType.SSO);
        this.isLoading = false;
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    let u, p = false;
    if (changes.username) {
      this.usernameFormControl.setValue(changes.username.currentValue);
      u = true;
    }
    if (changes.password) {
      this.passwordFormControl.setValue(changes.password.currentValue);
      p = true;
    }
    if (u && p && !changes.username.isFirstChange() && !changes.username.isFirstChange()) {
      // TODO: this throws an Exception because data and UI are inconsistent
      this.activateUser();
    }
  }

  providers(type?: AuthenticationProviderType) {
    return (type != null)
      ? this.apiConfigService.getAuthProviders().filter((p) => p.type === type)
      : this.apiConfigService.getAuthProviders();
  }

  activateUser(): void {
    const dialogRef = this.dialogService.openUserActivationDialog(this.username);
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.login();
      }
    });
  }

  login(): void {
    if (!this.usernameFormControl.hasError('required') && !this.usernameFormControl.hasError('email') &&
      !this.passwordFormControl.hasError('required')) {
      this.authenticationService.login(this.username, this.password, this.role).subscribe(loginSuccessful => {
        this.checkLogin(loginSuccessful);
      });
    } else {
      this.translationService.get('login.input-incorrect').subscribe(message => {
        this.notificationService.show(message);
      });
    }
  }

  loginViaSso(providerId: string): void {
    this.authenticationService.loginViaSso(providerId, this.role).subscribe(loginSuccessful => this.checkLogin(loginSuccessful));
  }

  private checkLogin(loginSuccessful: string) {
    if (loginSuccessful === 'true') {
      this.translationService.get('login.login-successful').subscribe(message => {
        this.notificationService.show(message);
      });
      this.dialog.closeAll();
      if (this.isStandard) {
        this.router.navigate(['user']);
      }
    } else if (loginSuccessful === 'activation') {
      this.activateUser();
    } else {
      this.translationService.get('login.login-data-incorrect').subscribe(message => {
        this.notificationService.show(message);
      });
    }
  }

  openPasswordDialog(): void {
    this.dialogService.openPasswordResetDialog();
  }

  openRegisterDialog(): void {
    const dialogRef = this.dialogService.openRegisterDialog();
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.usernameFormControl.setValue(result.username);
        this.passwordFormControl.setValue(result.password);
        this.username = result.username;
        this.password = result.password;
      }
    });
  }
}
