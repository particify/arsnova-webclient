import { Component, OnInit, inject, input, viewChild } from '@angular/core';
import {
  UntypedFormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { Router } from '@angular/router';
import { PasswordEntryComponent } from '@app/core/components/password-entry/password-entry.component';
import { FormComponent } from '@app/standalone/form/form.component';
import { first, switchMap } from 'rxjs';
import { FlexModule } from '@angular/flex-layout';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { BackButtonComponent } from '@app/standalone/back-button/back-button.component';
import { HttpHeaders } from '@angular/common/http';
import { ChallengeService } from '@app/core/services/challenge.service';
import { ResetUserPasswordGql } from '@gql/generated/graphql';

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
    PasswordEntryComponent,
    MatFormField,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    MatError,
    LoadingButtonComponent,
    TranslocoPipe,
    BackButtonComponent,
  ],
})
export class PasswordResetComponent extends FormComponent implements OnInit {
  private readonly translationService = inject(TranslocoService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly challengeService = inject(ChallengeService);
  private readonly resetPassword = inject(ResetUserPasswordGql);

  passwordEntry = viewChild.required(PasswordEntryComponent);

  // Route data input below
  email = input.required<string>();

  keyFormControl = new UntypedFormControl('', [Validators.required]);
  matcher = new PasswordResetErrorStateMatcher();

  deviceWidth = innerWidth;

  ngOnInit(): void {
    this.setFormControl(this.keyFormControl);
  }

  setNewPassword(code: string) {
    const password = this.passwordEntry().getPassword();
    if (this.email() !== '' && code !== '' && password) {
      this.disableForm();
      this.challengeService
        .authenticateByChallenge()
        .pipe(
          first(),
          switchMap((t) => {
            return this.resetPassword.mutate({
              variables: {
                mailAddress: this.email(),
                password: password,
                verificationCode: code,
              },
              context: {
                headers: new HttpHeaders({ Authorization: `Bearer ${t}` }),
              },
            });
          })
        )
        .subscribe({
          complete: () => this.enableForm(),
          next: (r) => {
            if (r.data?.resetUserPassword) {
              const msg = this.translationService.translate(
                'password-reset.new-password-successful'
              );
              this.notificationService.showAdvanced(
                msg,
                AdvancedSnackBarTypes.SUCCESS
              );
              this.router.navigateByUrl('login', {
                state: { data: { username: this.email(), password: password } },
              });
            } else {
              const msg = this.translationService.translate(
                'password-reset.request-failed'
              );
              this.notificationService.showAdvanced(
                msg,
                AdvancedSnackBarTypes.FAILED
              );
            }
          },
        });
    } else {
      const msg = this.translationService.translate('login.inputs-incorrect');
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
    }
  }
}
