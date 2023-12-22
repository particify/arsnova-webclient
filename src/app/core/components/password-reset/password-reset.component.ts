import { Component, OnInit, ViewChild } from '@angular/core';
import {
  UntypedFormControl,
  FormGroupDirective,
  NgForm,
  Validators,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { UserService } from '@app/core/services/http/user.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService } from '@ngneat/transloco';
import { EventService } from '@app/core/services/util/event.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PasswordEntryComponent } from '@app/core/components/password-entry/password-entry.component';
import { FormComponent } from '@app/standalone/form/form.component';
import { FormService } from '@app/core/services/util/form.service';
import { take } from 'rxjs';

export class PasswordResetErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: UntypedFormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = !!form && form.submitted;
    return (
      !!control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss'],
})
export class PasswordResetComponent extends FormComponent implements OnInit {
  @ViewChild(PasswordEntryComponent) passwordEntry!: PasswordEntryComponent;

  keyFormControl = new UntypedFormControl('', [Validators.required]);
  matcher = new PasswordResetErrorStateMatcher();

  deviceWidth = innerWidth;
  email = '';
  isLoading = true;

  constructor(
    private translationService: TranslocoService,
    private userService: UserService,
    private notificationService: NotificationService,
    public eventService: EventService,
    private route: ActivatedRoute,
    private router: Router,
    protected formService: FormService
  ) {
    super(formService);
  }

  ngOnInit(): void {
    this.setFormControl(this.keyFormControl);
    this.email = this.route.snapshot.params['email'];
    this.isLoading = false;
  }

  setNewPassword(key: string) {
    const password = this.passwordEntry.getPassword();
    if (this.email !== '' && key !== '' && password) {
      this.disableForm();
      this.userService.setNewPassword(this.email, key, password).subscribe(
        () => {
          this.translationService
            .selectTranslate('password-reset.new-password-successful')
            .pipe(take(1))
            .subscribe((message) => {
              this.notificationService.showAdvanced(
                message,
                AdvancedSnackBarTypes.SUCCESS
              );
            });
          this.router.navigateByUrl('login', {
            state: { data: { username: this.email, password: password } },
          });
        },
        () => {
          this.enableForm();
        }
      );
    } else {
      this.translationService
        .selectTranslate('login.inputs-incorrect')
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
