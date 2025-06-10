import { Component, Input, OnInit, ViewChild, inject } from '@angular/core';
import {
  UntypedFormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { UserService } from '@app/core/services/http/user.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { EventService } from '@app/core/services/util/event.service';
import { Router } from '@angular/router';
import {
  PasswordEntryComponent,
  PasswordEntryComponent as PasswordEntryComponent_1,
} from '@app/core/components/password-entry/password-entry.component';
import { FormComponent } from '@app/standalone/form/form.component';
import { take } from 'rxjs';
import { FlexModule } from '@angular/flex-layout';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';

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
  imports: [
    FlexModule,
    MatCard,
    FormsModule,
    PasswordEntryComponent_1,
    MatFormField,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    MatError,
    LoadingButtonComponent,
    TranslocoPipe,
  ],
})
export class PasswordResetComponent extends FormComponent implements OnInit {
  private translationService = inject(TranslocoService);
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);
  eventService = inject(EventService);
  private router = inject(Router);

  @ViewChild(PasswordEntryComponent) passwordEntry!: PasswordEntryComponent;

  // Route data input below
  @Input() email!: string;

  keyFormControl = new UntypedFormControl('', [Validators.required]);
  matcher = new PasswordResetErrorStateMatcher();

  deviceWidth = innerWidth;
  isLoading = true;

  ngOnInit(): void {
    this.setFormControl(this.keyFormControl);
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
