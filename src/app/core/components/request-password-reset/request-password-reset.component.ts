import { Component, OnInit, inject } from '@angular/core';
import {
  UntypedFormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { UserService } from '@app/core/services/http/user.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { EventService } from '@app/core/services/util/event.service';
import { PasswordResetErrorStateMatcher } from '@app/core/components/password-reset/password-reset.component';
import { Router } from '@angular/router';
import { FormComponent } from '@app/standalone/form/form.component';
import { take } from 'rxjs';
import { FlexModule } from '@angular/flex-layout';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';

@Component({
  selector: 'app-request-password-reset',
  templateUrl: './request-password-reset.component.html',
  styleUrls: ['./request-password-reset.component.scss'],
  imports: [
    FlexModule,
    MatCard,
    FormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    MatError,
    LoadingButtonComponent,
    TranslocoPipe,
  ],
})
export class RequestPasswordResetComponent
  extends FormComponent
  implements OnInit
{
  private translationService = inject(TranslocoService);
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);
  eventService = inject(EventService);
  private router = inject(Router);

  usernameFormControl = new UntypedFormControl();
  matcher = new PasswordResetErrorStateMatcher();
  deviceWidth = innerWidth;
  username?: string;

  ngOnInit(): void {
    this.setFormControl(this.usernameFormControl);
    this.usernameFormControl.clearValidators();
    const userData = history.state.data;
    if (userData && userData.username) {
      this.username = userData.username;
    }
  }

  activateValidators() {
    this.usernameFormControl.setValidators([
      Validators.required,
      Validators.email,
    ]);
    this.usernameFormControl.updateValueAndValidity();
  }

  resetPassword(): void {
    if (
      this.username &&
      !this.usernameFormControl.hasError('required') &&
      !this.usernameFormControl.hasError('email')
    ) {
      this.username = this.username.trim();
      this.disableForm();
      this.userService.setNewPassword(this.username).subscribe(
        () => {
          this.translationService
            .selectTranslate('password-reset.reset-successful')
            .pipe(take(1))
            .subscribe((msg) => {
              this.notificationService.showAdvanced(
                msg,
                AdvancedSnackBarTypes.SUCCESS
              );
            });
          this.router.navigate(['password-reset', this.username]);
        },
        () => {
          this.enableForm();
          this.translationService
            .selectTranslate('password-reset.request-failed')
            .pipe(take(1))
            .subscribe((msg) => {
              this.notificationService.showAdvanced(
                msg,
                AdvancedSnackBarTypes.FAILED
              );
            });
        }
      );
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
}
