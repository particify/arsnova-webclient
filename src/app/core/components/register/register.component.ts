import { Component, Input, OnInit, ViewChild, inject } from '@angular/core';
import {
  UntypedFormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { UserService } from '@app/core/services/http/user.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { EventService } from '@app/core/services/util/event.service';
import { Router, RouterLink } from '@angular/router';
import {
  PasswordEntryComponent,
  PasswordEntryComponent as PasswordEntryComponent_1,
} from '@app/core/components/password-entry/password-entry.component';
import { FormErrorStateMatcher } from '@app/core/components/form-error-state-matcher/form-error-state-matcher';
import { FormComponent } from '@app/standalone/form/form.component';
import { take } from 'rxjs';
import { ApiConfig } from '@app/core/models/api-config';
import { FlexModule } from '@angular/flex-layout';
import { MatCard } from '@angular/material/card';
import { FormHeaderComponent } from '@app/core/components/form-header/form-header.component';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { AutofocusDirective } from '@app/core/directives/autofocus.directive';
import { MatCheckbox } from '@angular/material/checkbox';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [
    FlexModule,
    MatCard,
    FormHeaderComponent,
    FormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    AutofocusDirective,
    ReactiveFormsModule,
    MatError,
    PasswordEntryComponent_1,
    MatCheckbox,
    LoadingButtonComponent,
    RouterLink,
    TranslocoPipe,
  ],
})
export class RegisterComponent extends FormComponent implements OnInit {
  private translationService = inject(TranslocoService);
  userService = inject(UserService);
  notificationService = inject(NotificationService);
  eventService = inject(EventService);
  private router = inject(Router);

  @ViewChild(PasswordEntryComponent) passwordEntry!: PasswordEntryComponent;

  // Route data input below
  @Input({ required: true }) apiConfig!: ApiConfig;

  usernameFormControl = new UntypedFormControl();
  matcher = new FormErrorStateMatcher();
  deviceWidth = innerWidth;
  acceptToS = false;
  linkOfToS?: string;
  accountServiceTitle!: string;

  ngOnInit(): void {
    this.accountServiceTitle =
      this.apiConfig.ui.registration?.service || 'ARSnova';
    this.linkOfToS = this.apiConfig.ui.links?.tos?.url;
    this.setFormControl(this.usernameFormControl);
    this.usernameFormControl.clearValidators();
  }

  activateValidators() {
    this.usernameFormControl.setValidators([
      Validators.required,
      Validators.email,
    ]);
    this.usernameFormControl.updateValueAndValidity();
  }

  register(username: string): void {
    const password = this.passwordEntry.getPassword();
    if (
      !this.usernameFormControl.hasError('required') &&
      !this.usernameFormControl.hasError('email') &&
      password
    ) {
      if (this.acceptToS) {
        this.disableForm();
        this.userService.register(username, password).subscribe(
          () => {
            this.enableForm();
            this.router.navigateByUrl('login', {
              state: { data: { username: username, password: password } },
            });
            this.translationService
              .selectTranslate('register.register-successful')
              .pipe(take(1))
              .subscribe((message) => {
                this.notificationService.showAdvanced(
                  message,
                  AdvancedSnackBarTypes.SUCCESS
                );
              });
          },
          () => {
            this.enableForm();
            this.translationService
              .selectTranslate('register.register-request-error')
              .pipe(take(1))
              .subscribe((message) => {
                this.notificationService.showAdvanced(
                  message,
                  AdvancedSnackBarTypes.FAILED
                );
              });
          }
        );
      } else {
        this.translationService
          .selectTranslate('register.please-accept')
          .pipe(take(1))
          .subscribe((message) => {
            this.notificationService.showAdvanced(
              message,
              AdvancedSnackBarTypes.WARNING
            );
          });
      }
    } else {
      this.translationService
        .selectTranslate('register.register-unsuccessful')
        .pipe(take(1))
        .subscribe((message) => {
          this.notificationService.showAdvanced(
            message,
            AdvancedSnackBarTypes.WARNING
          );
        });
    }
  }
}
