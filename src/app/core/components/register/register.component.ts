import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { UserService } from '@app/core/services/http/user.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { EventService } from '@app/core/services/util/event.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PasswordEntryComponent } from '@app/core/components/password-entry/password-entry.component';
import { FormErrorStateMatcher } from '@app/core/components/form-error-state-matcher/form-error-state-matcher';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  @ViewChild(PasswordEntryComponent) passwordEntry: PasswordEntryComponent;

  usernameFormControl = new UntypedFormControl();
  matcher = new FormErrorStateMatcher();
  deviceWidth = innerWidth;
  acceptToS = false;
  linkOfToS: string;
  accountServiceTitle: string;

  constructor(
    private translationService: TranslateService,
    public userService: UserService,
    public notificationService: NotificationService,
    public eventService: EventService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.usernameFormControl.clearValidators();
    const data = this.route.snapshot.data;
    this.accountServiceTitle =
      data.apiConfig.ui.registration?.service || 'ARSnova';
    this.linkOfToS = data.apiConfig.ui.links.tos.url;
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
        this.userService.register(username, password).subscribe(
          () => {
            this.router.navigateByUrl('login', {
              state: { data: { username: username, password: password } },
            });
            this.translationService
              .get('register.register-successful')
              .subscribe((message) => {
                this.notificationService.showAdvanced(
                  message,
                  AdvancedSnackBarTypes.SUCCESS
                );
              });
          },
          () => {
            this.translationService
              .get('register.register-request-error')
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
          .get('register.please-accept')
          .subscribe((message) => {
            this.notificationService.showAdvanced(
              message,
              AdvancedSnackBarTypes.WARNING
            );
          });
      }
    } else {
      this.translationService
        .get('register.register-unsuccessful')
        .subscribe((message) => {
          this.notificationService.showAdvanced(
            message,
            AdvancedSnackBarTypes.WARNING
          );
        });
    }
  }
}
