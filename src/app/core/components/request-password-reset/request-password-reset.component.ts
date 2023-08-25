import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '@app/core/services/http/user.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { EventService } from '@app/core/services/util/event.service';
import { PasswordResetErrorStateMatcher } from '@app/core/components/password-reset/password-reset.component';
import { Router } from '@angular/router';
import { FormComponent } from '@app/standalone/form/form.component';
import { FormService } from '@app/core/services/util/form.service';

@Component({
  selector: 'app-request-password-reset',
  templateUrl: './request-password-reset.component.html',
  styleUrls: ['./request-password-reset.component.scss'],
})
export class RequestPasswordResetComponent
  extends FormComponent
  implements OnInit
{
  usernameFormControl = new UntypedFormControl();
  matcher = new PasswordResetErrorStateMatcher();
  deviceWidth = innerWidth;
  username: string;

  constructor(
    private translationService: TranslateService,
    private userService: UserService,
    private notificationService: NotificationService,
    public eventService: EventService,
    private router: Router,
    protected formService: FormService
  ) {
    super(formService);
  }

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
            .get('password-reset.reset-successful')
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
            .get('password-reset.request-failed')
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
        .get('login.input-incorrect')
        .subscribe((message) => {
          this.notificationService.showAdvanced(
            message,
            AdvancedSnackBarTypes.WARNING
          );
        });
    }
  }
}
