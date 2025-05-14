import { Component, OnInit, inject } from '@angular/core';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { UserService } from '@app/core/services/http/user.service';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslocoService } from '@jsverse/transloco';
import { EventService } from '@app/core/services/util/event.service';
import { FormComponent } from '@app/standalone/form/form.component';
import { FormService } from '@app/core/services/util/form.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-user-activation',
  templateUrl: './user-activation.component.html',
  styleUrls: ['./user-activation.component.scss'],
  standalone: false,
})
export class UserActivationComponent extends FormComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA);
  userService = inject(UserService);
  notificationService = inject(NotificationService);
  dialogRef = inject<MatDialogRef<UserActivationComponent>>(MatDialogRef);
  private translationService = inject(TranslocoService);
  eventService = inject(EventService);
  protected formService: FormService;

  readonly dialogId = 'activate-user';

  activationKeyFormControl = new UntypedFormControl('', [Validators.required]);

  constructor() {
    const formService = inject(FormService);

    super(formService);

    this.formService = formService;
  }

  ngOnInit(): void {
    this.setFormControl(this.activationKeyFormControl);
  }

  login(activationKey: string): void {
    if (activationKey.length < 1) {
      this.translationService
        .selectTranslate('user-activation.key-required')
        .pipe(take(1))
        .subscribe((msg) => {
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.WARNING
          );
        });
    } else {
      activationKey = activationKey.trim();
      this.disableForm();
      this.userService.activate(this.data, activationKey).subscribe(
        () => {
          this.dialogRef.close({ success: true });
        },
        () => {
          this.enableForm();
          this.translationService
            .selectTranslate('user-activation.key-incorrect')
            .pipe(take(1))
            .subscribe((msg) => {
              this.notificationService.showAdvanced(
                msg,
                AdvancedSnackBarTypes.FAILED
              );
            });
        }
      );
    }
  }

  resetActivation(): void {
    this.userService.resetActivation(this.data.trim()).subscribe(() => {
      this.translationService
        .selectTranslate('user-activation.sent-again')
        .pipe(take(1))
        .subscribe((msg) => {
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.WARNING
          );
        });
    });
  }

  cancel() {
    this.dialogRef.close();
  }
}
