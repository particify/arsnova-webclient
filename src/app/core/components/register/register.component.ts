import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { UserService } from '@app/core/services/http/user.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService } from '@jsverse/transloco';
import { EventService } from '@app/core/services/util/event.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PasswordEntryComponent } from '@app/core/components/password-entry/password-entry.component';
import { FormErrorStateMatcher } from '@app/core/components/form-error-state-matcher/form-error-state-matcher';
import { FormComponent } from '@app/standalone/form/form.component';
import { FormService } from '@app/core/services/util/form.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent extends FormComponent implements OnInit {
  @ViewChild(PasswordEntryComponent) passwordEntry!: PasswordEntryComponent;

  usernameFormControl = new UntypedFormControl();
  matcher = new FormErrorStateMatcher();
  deviceWidth = innerWidth;
  acceptToS = false;
  linkOfToS: string;
  accountServiceTitle: string;

  constructor(
    private translationService: TranslocoService,
    public userService: UserService,
    public notificationService: NotificationService,
    public eventService: EventService,
    private router: Router,
    private route: ActivatedRoute,
    protected formService: FormService
  ) {
    super(formService);
    this.accountServiceTitle =
      route.snapshot.data.apiConfig.ui.registration?.service || 'ARSnova';
    this.linkOfToS = route.snapshot.data.apiConfig.ui.links.tos?.url;
  }

  ngOnInit(): void {
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
