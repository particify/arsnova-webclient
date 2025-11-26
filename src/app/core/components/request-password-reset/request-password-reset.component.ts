import { Component, OnInit, inject } from '@angular/core';
import {
  UntypedFormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { PasswordResetErrorStateMatcher } from '@app/core/components/password-reset/password-reset.component';
import { Router } from '@angular/router';
import { FormComponent } from '@app/standalone/form/form.component';
import { first, switchMap } from 'rxjs';
import { FlexModule } from '@angular/flex-layout';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { BackButtonComponent } from '@app/standalone/back-button/back-button.component';
import { RequestUserPasswordResetGql } from '@gql/generated/graphql';
import { HttpHeaders } from '@angular/common/http';
import { ChallengeService } from '@app/core/services/challenge.service';

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
    BackButtonComponent,
  ],
})
export class RequestPasswordResetComponent
  extends FormComponent
  implements OnInit
{
  private readonly translationService = inject(TranslocoService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly challengeService = inject(ChallengeService);
  private readonly requestPasswordReset = inject(RequestUserPasswordResetGql);

  usernameFormControl = new UntypedFormControl();
  matcher = new PasswordResetErrorStateMatcher();
  deviceWidth = innerWidth;
  username = '';

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
      this.challengeService
        .authenticateByChallenge()
        .pipe(
          first(),
          switchMap((t) => {
            return this.requestPasswordReset.mutate({
              variables: { mailAddress: this.username },
              context: {
                headers: new HttpHeaders({ Authorization: `Bearer ${t}` }),
              },
            });
          })
        )
        .subscribe({
          complete: () => this.enableForm(),
          next: (r) => {
            if (r.data?.requestUserPasswordReset) {
              const msg = this.translationService.translate(
                'password-reset.reset-successful'
              );
              this.notificationService.showAdvanced(
                msg,
                AdvancedSnackBarTypes.SUCCESS
              );
              this.router.navigate(['password-reset', this.username]);
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
      const msg = this.translationService.translate('login.input-incorrect');
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
    }
  }
}
