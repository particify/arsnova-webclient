import {
  AfterContentInit,
  booleanAttribute,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { MatDialog } from '@angular/material/dialog';
import {
  UntypedFormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
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
import {
  PasswordEntryComponent,
  PasswordEntryComponent as PasswordEntryComponent_1,
} from '@app/core/components/password-entry/password-entry.component';
import { FormErrorStateMatcher } from '@app/core/components/form-error-state-matcher/form-error-state-matcher';
import { FormComponent } from '@app/standalone/form/form.component';
import { take } from 'rxjs';
import { FlexModule } from '@angular/flex-layout';
import { MatCard } from '@angular/material/card';
import { FormHeaderComponent } from '@app/core/components/form-header/form-header.component';
import { MatButton } from '@angular/material/button';
import { AutofocusDirective } from '@app/core/directives/autofocus.directive';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';

function setDefaultTrue(value: boolean | undefined): boolean {
  return value ?? true;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    FlexModule,
    MatCard,
    FormHeaderComponent,
    MatButton,
    AutofocusDirective,
    MatDivider,
    FormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    MatError,
    PasswordEntryComponent_1,
    RouterLink,
    LoadingButtonComponent,
    LoadingIndicatorComponent,
    TranslocoPipe,
  ],
})
export class LoginComponent
  extends FormComponent
  implements AfterContentInit, OnChanges, OnInit
{
  authenticationService = inject(AuthenticationService);
  router = inject(Router);
  private translationService = inject(TranslocoService);
  notificationService = inject(NotificationService);
  dialog = inject(MatDialog);
  eventService = inject(EventService);
  private dialogService = inject(DialogService);
  private route = inject(ActivatedRoute);
  private routingService = inject(RoutingService);

  @ViewChild(PasswordEntryComponent) passwordEntry!: PasswordEntryComponent;

  // Route data input below
  @Input({ transform: booleanAttribute }) isStandalone!: boolean;
  @Input({ transform: setDefaultTrue }) allowPwReset!: boolean;
  @Input({ transform: setDefaultTrue }) allowRegister!: boolean;
  @Input({ transform: setDefaultTrue }) navigateIfAlreadyLoggedIn!: boolean;
  @Input() externalRouteAfterLogin?: string;

  isStandard = true;
  username = '';
  password = '';
  passwordLoginEnabled = false;
  dbLoginEnabled = false;
  usernamePasswordProviders: AuthenticationProvider[] = [];
  ssoProviders: AuthenticationProvider[] = [];
  isLoading = true;
  deviceWidth = innerWidth;
  authProviders: AuthenticationProvider[] = [];
  loginIdIsEmail = false;

  loginIdFormControl = new UntypedFormControl();

  matcher = new FormErrorStateMatcher();

  ngOnInit() {
    this.setFormControl(this.loginIdFormControl);
    this.loginIdFormControl.clearValidators();
    this.route.data.subscribe((data) => {
      this.authProviders = data.apiConfig.authenticationProviders;
      this.allowRegister =
        this.allowRegister && !data.apiConfig.ui.registrationDisabled;
    });
    if (this.externalRouteAfterLogin) {
      this.routingService.setRedirect(this.externalRouteAfterLogin);
    }
  }

  ngAfterContentInit() {
    this.authenticationService.getCurrentAuthentication().subscribe((auth) => {
      if (
        this.authenticationService.isLoggedIn() &&
        auth?.authProvider !== AuthProvider.ARSNOVA_GUEST &&
        this.navigateIfAlreadyLoggedIn
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
        .pipe(take(1))
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
        .pipe(take(1))
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
        .pipe(take(1))
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
