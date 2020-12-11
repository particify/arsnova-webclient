import { AfterContentInit, Component, OnChanges, SimpleChanges } from '@angular/core';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { Router } from '@angular/router';
import { AdvancedSnackBarTypes, NotificationService } from '../../../services/util/notification.service';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { EventService } from '../../../services/util/event.service';
import { ApiConfigService } from '../../../services/http/api-config.service';
import { AuthenticationProvider, AuthenticationProviderType } from '../../../models/api-config';
import { DialogService } from '../../../services/util/dialog.service';
import { AuthenticationStatus, ClientAuthenticationResult } from '../../../models/client-authentication-result';
import { AuthProvider } from '../../../models/auth-provider';
import { RoutingService } from '../../../services/util/routing.service';

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
export class LoginComponent implements AfterContentInit, OnChanges {

  isStandard = true;
  username: string;
  password: string;
  allowDbLogin = false;
  ssoProviders: AuthenticationProvider[];
  isLoading = true;
  deviceWidth = innerWidth;
  providersLength: number;

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
              private dialogService: DialogService,
              private routingService: RoutingService) {
  }

  ngAfterContentInit() {
    this.authenticationService.getCurrentAuthentication().subscribe(auth => {
      if (this.authenticationService.isLoggedIn() && auth.authProvider !== AuthProvider.ARSNOVA_GUEST) {
        this.router.navigate(['user']);
      } else {
        this.apiConfigService.getApiConfig$().subscribe(config => {
          const authProviders = config.authenticationProviders;
          if (authProviders.some(provider => provider.type === AuthenticationProviderType.USERNAME_PASSWORD)) {
            this.allowDbLogin = true;
          }
          this.ssoProviders = authProviders.filter((p) => p.type === AuthenticationProviderType.SSO);
          this.isLoading = false;
          this.providersLength = this.ssoProviders.length;
          if (!this.allowDbLogin && this.providersLength === 1) {
            this.loginViaSso(this.ssoProviders[0].id);
          } else {
            if (this.providersLength > 0) {
              setTimeout(() => {
                document.getElementById(this.ssoProviders[0].title + '-button').focus();
              }, 700);
            } else {
              setTimeout(() => {
                document.getElementById('email-input').focus();
              }, 700);
            }
          }
        });
      }
    });
    const registeredUserData = history.state.data;
      if (registeredUserData && registeredUserData.username && registeredUserData.password) {
        this.usernameFormControl.setValue(registeredUserData.username);
        this.passwordFormControl.setValue(registeredUserData.password);
        this.username = registeredUserData.username;
        this.password = registeredUserData.password;
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
      this.authenticationService.login(this.username, this.password).subscribe(loginSuccessful => {
        this.checkLogin(loginSuccessful);
      });
    } else {
      this.translationService.get('login.input-incorrect').subscribe(message => {
        this.notificationService.showAdvanced(message, AdvancedSnackBarTypes.WARNING);
      });
    }
  }

  loginViaSso(providerId: string): void {
    this.authenticationService.loginViaSso(providerId).subscribe(loginSuccessful => this.checkLogin(loginSuccessful));
  }

  private checkLogin(result: ClientAuthenticationResult) {
    if (result.status === AuthenticationStatus.SUCCESS) {
      this.translationService.get('login.login-successful').subscribe(message => {
        this.notificationService.showAdvanced(message, AdvancedSnackBarTypes.SUCCESS);
      });
      this.dialog.closeAll();
      if (this.isStandard) {
        if (!this.routingService.redirect()) {
          this.router.navigate(['user']);
        }
      }
    } else if (result.status === AuthenticationStatus.ACTIVATION_PENDING) {
      this.activateUser();
    } else {
      this.translationService.get('login.login-data-incorrect').subscribe(message => {
        this.notificationService.showAdvanced(message, AdvancedSnackBarTypes.FAILED);
      });
    }
  }

  navToPasswordReset() {
    let state;
    if (this.username) {
      state = {
        state: {
          data: {
            username: this.username
          }
        }
      };
    }
    this.router.navigate(['request-password-reset'], state);
  }

  openRegisterDialog(): void {
    this.router.navigate(['register']);
  }
}
