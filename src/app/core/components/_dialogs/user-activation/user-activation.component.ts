import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
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
  MAT_DIALOG_DATA,
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
import { ErrorClassification } from '@gql/helper/handle-operation-error';
import { CooldownService } from '@app/core/services/util/cooldown.service';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserActivationComponent extends FormComponent implements OnInit {
  private verifyUserMailAddressGql = inject(VerifyUserMailAddressGql);
  private notificationService = inject(NotificationService);
  private dialogRef =
    inject<MatDialogRef<UserActivationComponent>>(MatDialogRef);
  private translationService = inject(TranslocoService);
  private authenticationService = inject(AuthenticationService);
  private resendMail = inject(ResendVerificationMailGql);
  private readonly data: { initial: boolean; successMessage?: string } =
    inject(MAT_DIALOG_DATA);
  private readonly cooldownService = inject(CooldownService);

  resendCooldownSeconds = this.cooldownService.resendCooldownSeconds;

  verificationCodeFormControl = new UntypedFormControl('', [
    Validators.required,
  ]);

  ngOnInit(): void {
    this.setFormControl(this.verificationCodeFormControl);
    if (this.data.initial) {
      this.cooldownService.startResendCooldown();
    } else {
      this.cooldownService.continueActiveResendCooldown();
    }
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
              this.authenticationService.refreshAndReloadUser().subscribe({
                next: () => {
                  const msg =
                    this.data.successMessage ??
                    'user-activation.account-verified';
                  this.notificationService.showAdvanced(
                    this.translationService.translate(msg),
                    AdvancedSnackBarTypes.SUCCESS
                  );
                  this.close({ success: true });
                },
              });
            } else {
              this.enableForm();
            }
          },
          error: (e) => {
            this.enableForm();
            this.notificationService.showOnRequestClientError(e, {
              [ErrorClassification.BadRequest]: {
                message: this.translationService.translate(
                  'user-activation.key-incorrect'
                ),
                type: AdvancedSnackBarTypes.WARNING,
              },
            });
          },
        });
    }
  }

  resendVerificationMail(): void {
    this.resendMail.mutate().subscribe({
      next: () => {
        this.cooldownService.startResendCooldown();
        this.notificationService.showAdvanced(
          this.translationService.translate('user-activation.sent-again'),
          AdvancedSnackBarTypes.SUCCESS
        );
      },
      error: (e) => this.notificationService.showOnRequestClientError(e),
    });
  }

  close(result?: { success: boolean }) {
    this.dialogRef.close(result);
  }
}
