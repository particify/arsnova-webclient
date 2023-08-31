import {
  AfterContentInit,
  Component,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { UntypedFormControl, Validators } from '@angular/forms';
import { TranslocoService } from '@ngneat/transloco';
import { EventService } from '@app/core/services/util/event.service';
import {
  AuthenticationProvider,
  AuthenticationProviderType,
} from '@app/core/models/api-config';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  AuthenticationStatus,
  ClientAuthenticationResult,
} from '@app/core/models/client-authentication-result';
import { AuthProvider } from '@app/core/models/auth-provider';
import { RoutingService } from '@app/core/services/util/routing.service';
import { PasswordEntryComponent } from '@app/core/components/password-entry/password-entry.component';
import { FormErrorStateMatcher } from '@app/core/components/form-error-state-matcher/form-error-state-matcher';
import { FormComponent } from '@app/standalone/form/form.component';
import { FormService } from '@app/core/services/util/form.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent
  extends FormComponent
  implements AfterContentInit, OnChanges, OnInit
{
  @ViewChild(PasswordEntryComponent) passwordEntry: PasswordEntryComponent;

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

  loginIdFormControl = new UntypedFormControl();

  matcher = new FormErrorStateMatcher();

  constructor(
    public authenticationService: AuthenticationService,
    public router: Router,
    private translationService: TranslocoService,
    public notificationService: NotificationService,
    public dialog: MatDialog,
    public eventService: EventService,
    private dialogService: DialogService,
    private route: ActivatedRoute,
    private routingService: RoutingService,
    protected formService: FormService
  ) {
    super(formService);
  }

  ngOnInit() {
    this.setFormControl(this.loginIdFormControl);
    this.loginIdFormControl.clearValidators();
    this.route.data.subscribe(
      (data) => (this.authProviders = data.apiConfig.authenticationProviders)
    );
  }

  ngAfterContentInit() {
    this.authenticationService.getCurrentAuthentication().subscribe((auth) => {
      if (
        this.authenticationService.isLoggedIn() &&
        auth?.authProvider !== AuthProvider.ARSNOVA_GUEST
      ) {
        this.router.navigateByUrl('user');
      } else {
        this.usernamePasswordProviders = this.authProviders.filter(
          (p) => p.type === AuthenticationProviderType.USERNAME_PASSWORD
        );
        if (this.usernamePasswordProviders.length > 0) {
          this.passwordLoginEnabled = true;
          if (this.usernamePasswordProviders.some((p) => p.id === 'user-db')) {
            this.dbLoginEnabled = true;
            if (this.usernamePasswordProviders.length === 1) {
              this.loginIdIsEmail = true;
            } else {
              this.loginIdFormControl.setValidators([Validators.required]);
            }
          }
        }
        this.ssoProviders = this.authProviders.filter(
          (p) => p.type === AuthenticationProviderType.SSO
        );
        this.isLoading = false;

        // Automatically initiate SSO login if there are no other providers
        const loginProviders = this.authProviders.filter(
          (p) => p.type !== AuthenticationProviderType.ANONYMOUS
        );
        if (loginProviders.length === 1 && this.ssoProviders.length === 1) {
          this.loginViaSso(this.ssoProviders[0].id);
        }
      }
    });
    const registeredUserData = history.state?.data;
    if (
      registeredUserData &&
      registeredUserData.username &&
      registeredUserData.password
    ) {
      this.loginIdFormControl.setValue(registeredUserData.username);
      this.username = registeredUserData.username;
      this.password = registeredUserData.password;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.loginid) {
      this.loginIdFormControl.setValue(changes.loginid.currentValue);
    }
  }

  providers(type?: AuthenticationProviderType) {
    return type != null
      ? this.authProviders.filter((p) => p.type === type)
      : this.authProviders;
  }

  activateUser(): void {
    const dialogRef = this.dialogService.openUserActivationDialog(
      this.username
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.success) {
        this.loginWithUsernamePassword();
      }
    });
  }

  activateValidators() {
    this.loginIdFormControl.setValidators([
      Validators.required,
      Validators.email,
    ]);
    this.loginIdFormControl.updateValueAndValidity();
  }

  loginWithUsernamePassword(providerId = 'user-db'): void {
    const password = this.passwordEntry.getPassword();
    if (this.loginIdFormControl.valid && password) {
      this.disableForm();
      this.authenticationService
        .login(this.username, password, providerId)
        .subscribe((loginSuccessful) => {
          this.enableForm();
          this.checkLogin(loginSuccessful);
        });
    } else {
      this.translationService
        .selectTranslate('login.input-incorrect')
        .subscribe((message) => {
          this.notificationService.showAdvanced(
            message,
            AdvancedSnackBarTypes.WARNING
          );
        });
    }
  }

  loginViaSso(providerId: string): void {
    this.authenticationService
      .loginViaSso(providerId)
      .subscribe((loginSuccessful) => this.checkLogin(loginSuccessful));
  }

  private checkLogin(result: ClientAuthenticationResult) {
    if (result.status === AuthenticationStatus.SUCCESS) {
      this.translationService
        .selectTranslate('login.login-successful')
        .subscribe((message) => {
          this.notificationService.showAdvanced(
            message,
            AdvancedSnackBarTypes.SUCCESS
          );
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
      this.translationService
        .selectTranslate('login.login-data-incorrect')
        .subscribe((message) => {
          this.notificationService.showAdvanced(
            message,
            AdvancedSnackBarTypes.FAILED
          );
        });
    }
  }

  navToPasswordReset() {
    let state;
    if (this.username) {
      state = {
        state: {
          data: {
            username: this.username,
          },
        },
      };
    }
    this.router.navigateByUrl('request-password-reset', state);
  }

  openRegisterDialog(): void {
    this.router.navigateByUrl('register');
  }
}
