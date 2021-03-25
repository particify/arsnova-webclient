import { AfterContentInit, Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AdvancedSnackBarTypes, NotificationService } from '../../../services/util/notification.service';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { EventService } from '../../../services/util/event.service';
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
export class LoginComponent implements AfterContentInit, OnChanges, OnInit {

  isStandard = true;
  username: string;
  password: string;
  passwordLoginEnabled = false;
  dbLoginEnabled = false;
  usernamePasswordProviders: AuthenticationProvider[];
  ssoProviders: AuthenticationProvider[];
  isLoading = true;
  deviceWidth = innerWidth;
  providersLength: number;
  authProviders: AuthenticationProvider[];
  loginIdIsEmail = false;

  loginIdFormControl = new FormControl('', [Validators.required]);
  passwordFormControl = new FormControl('', [Validators.required]);

  matcher = new LoginErrorStateMatcher();

  constructor(public authenticationService: AuthenticationService,
              public router: Router,
              private translationService: TranslateService,
              public notificationService: NotificationService,
              public dialog: MatDialog,
              public eventService: EventService,
              private dialogService: DialogService,
              private route: ActivatedRoute,
              private routingService: RoutingService) {
  }

  ngOnInit() {
    this.route.data.subscribe(data => this.authProviders = data.apiConfig.authenticationProviders);
  }

  ngAfterContentInit() {
    this.authenticationService.getCurrentAuthentication().subscribe(auth => {
      if (this.authenticationService.isLoggedIn() && auth.authProvider !== AuthProvider.ARSNOVA_GUEST) {
        this.router.navigateByUrl('user');
      } else {
        this.usernamePasswordProviders = this.authProviders.filter((p) => p.type === AuthenticationProviderType.USERNAME_PASSWORD);
        if (this.usernamePasswordProviders.length > 0) {
          this.passwordLoginEnabled = true;
          if (this.usernamePasswordProviders.some(p => p.id === 'user-db')) {
            this.dbLoginEnabled = true;
            if (this.usernamePasswordProviders.length === 1) {
              this.loginIdIsEmail = true;
              this.loginIdFormControl.setValidators([Validators.required, Validators.email]);
            } else {
              this.loginIdFormControl.setValidators([Validators.required]);
            }
          }
        }
        this.ssoProviders = this.authProviders.filter((p) => p.type === AuthenticationProviderType.SSO);
        this.isLoading = false;

        // Automatically initiate SSO login if there are no other providers
        const loginProviders = this.authProviders.filter((p) => p.type !== AuthenticationProviderType.ANONYMOUS);
        if (loginProviders.length === 1 && this.ssoProviders.length === 1) {
          this.loginViaSso(this.ssoProviders[0].id);
        } else {
          if (this.ssoProviders.length > 0) {
            setTimeout(() => {
              document.getElementById(this.ssoProviders[0].title + '-button').focus();
            }, 700);
          } else {
            setTimeout(() => {
              document.getElementById('loginid-input').focus();
            }, 700);
          }
        }
      }
    });
    const registeredUserData = history.state.data;
      if (registeredUserData && registeredUserData.username && registeredUserData.password) {
        this.loginIdFormControl.setValue(registeredUserData.username);
        this.passwordFormControl.setValue(registeredUserData.password);
        this.username = registeredUserData.username;
        this.password = registeredUserData.password;
      }
  }

  ngOnChanges(changes: SimpleChanges) {
    let u, p = false;
    if (changes.loginid) {
      this.loginIdFormControl.setValue(changes.loginid.currentValue);
      u = true;
    }
    if (changes.password) {
      this.passwordFormControl.setValue(changes.password.currentValue);
      p = true;
    }
    if (u && p && !changes.loginid.isFirstChange() && !changes.loginid.isFirstChange()) {
      // TODO: this throws an Exception because data and UI are inconsistent
      this.activateUser();
    }
  }

  providers(type?: AuthenticationProviderType) {
    return (type != null)
      ? this.authProviders.filter((p) => p.type === type)
      : this.authProviders;
  }

  activateUser(): void {
    const dialogRef = this.dialogService.openUserActivationDialog(this.username);
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.loginWithUsernamePassword();
      }
    });
  }

  loginWithUsernamePassword(providerId: string = 'user-db'): void {
    if (this.loginIdFormControl.valid && this.passwordFormControl.valid) {
      this.authenticationService.login(this.username, this.password, providerId).subscribe(loginSuccessful => {
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
          this.router.navigateByUrl('user');
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
    this.router.navigateByUrl('request-password-reset', state);
  }

  openRegisterDialog(): void {
    this.router.navigateByUrl('register');
  }
}
