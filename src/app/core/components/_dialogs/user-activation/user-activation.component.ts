import { Component, OnInit, inject } from '@angular/core';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import {
  UntypedFormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogRef,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { FormComponent } from '@app/standalone/form/form.component';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { FlexModule } from '@angular/flex-layout';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import {
  ResendVerificationMailGql,
  VerifyUserMailAddressGql,
} from '@gql/generated/graphql';
import { AuthenticationService } from '@app/core/services/http/authentication.service';

@Component({
  selector: 'app-user-activation',
  templateUrl: './user-activation.component.html',
  styleUrls: ['./user-activation.component.scss'],
  imports: [
    CdkScrollable,
    MatDialogContent,
    FormsModule,
    FlexModule,
    MatFormField,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    MatButton,
    MatDialogActions,
    LoadingButtonComponent,
    TranslocoPipe,
  ],
})
export class UserActivationComponent extends FormComponent implements OnInit {
  private verifyUserMailAddressGql = inject(VerifyUserMailAddressGql);
  private notificationService = inject(NotificationService);
  private dialogRef =
    inject<MatDialogRef<UserActivationComponent>>(MatDialogRef);
  private translationService = inject(TranslocoService);
  private authenticationService = inject(AuthenticationService);
  private resendMail = inject(ResendVerificationMailGql);

  resendCooldownSeconds = 0;
  resendCooldownInterval?: ReturnType<typeof setInterval>;

  verificationCodeFormControl = new UntypedFormControl('', [
    Validators.required,
  ]);

  ngOnInit(): void {
    this.setFormControl(this.verificationCodeFormControl);
  }

  verify(verificationCode: string): void {
    if (verificationCode.length < 1) {
      this.notificationService.showAdvanced(
        this.translationService.translate('user-activation.key-required'),
        AdvancedSnackBarTypes.WARNING
      );
    } else {
      verificationCode = verificationCode.trim();
      this.disableForm();
      this.verifyUserMailAddressGql
        .mutate({ variables: { verificationCode } })
        .subscribe({
          next: (r) => {
            if (r.data?.verifyUserMailAddress) {
              this.authenticationService.refreshLogin().subscribe({
                next: () => {
                  this.notificationService.showAdvanced(
                    this.translationService.translate(
                      'user-activation.account-verified'
                    ),
                    AdvancedSnackBarTypes.SUCCESS
                  );
                  this.close({ success: true });
                },
              });
            } else {
              this.enableForm();
              this.notificationService.showAdvanced(
                this.translationService.translate(
                  'user-activation.key-incorrect'
                ),
                AdvancedSnackBarTypes.WARNING
              );
            }
          },
          error: () => {
            this.enableForm();
            this.notificationService.showAdvanced(
              this.translationService.translate('errors.something-went-wrong'),
              AdvancedSnackBarTypes.FAILED
            );
          },
        });
    }
  }

  resendVerificationMail(): void {
    this.resendMail.mutate().subscribe(() => {
      this.startResendCooldown();
      this.notificationService.showAdvanced(
        this.translationService.translate('user-activation.sent-again'),
        AdvancedSnackBarTypes.SUCCESS
      );
    });
  }

  startResendCooldown() {
    this.resendCooldownSeconds = 90;
    this.resendCooldownInterval = setInterval(() => {
      this.resendCooldownSeconds--;
      if (this.resendCooldownSeconds <= 0) {
        clearInterval(this.resendCooldownInterval);
      }
    }, 1000);
  }

  close(result?: { success: boolean }) {
    this.dialogRef.close(result);
  }
}
