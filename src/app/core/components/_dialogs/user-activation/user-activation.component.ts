import { Component, OnInit, inject } from '@angular/core';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { UserService } from '@app/core/services/http/user.service';
import {
  UntypedFormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
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
import { VerifyUserMailAddressGql } from '@gql/generated/graphql';

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
  private data = inject(MAT_DIALOG_DATA);
  private userService = inject(UserService);
  private verifyUserMailAddressGql = inject(VerifyUserMailAddressGql);
  private notificationService = inject(NotificationService);
  private dialogRef =
    inject<MatDialogRef<UserActivationComponent>>(MatDialogRef);
  private translationService = inject(TranslocoService);

  readonly dialogId = 'activate-user';

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
            this.enableForm();
            if (r.data?.verifyUserMailAddress) {
              this.dialogRef.close({ success: true });
            } else {
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

  resetVerification(): void {
    this.userService.resetActivation(this.data.trim()).subscribe(() => {
      this.notificationService.showAdvanced(
        this.translationService.translate('user-activation.sent-again'),
        AdvancedSnackBarTypes.WARNING
      );
    });
  }

  cancel() {
    this.dialogRef.close();
  }
}
