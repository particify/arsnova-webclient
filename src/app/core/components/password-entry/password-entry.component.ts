import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
  inject,
} from '@angular/core';
import {
  UntypedFormControl,
  ValidatorFn,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { FormErrorStateMatcher } from '@app/core/components/form-error-state-matcher/form-error-state-matcher';
import { AutofillMonitor } from '@angular/cdk/text-field';
import { FormComponent } from '@app/standalone/form/form.component';
import {
  MatFormField,
  MatLabel,
  MatSuffix,
  MatError,
  MatHint,
} from '@angular/material/form-field';
import { NgClass } from '@angular/common';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { FlexModule } from '@angular/flex-layout';

enum Strength {
  WEAK = 1,
  OKAY = 2,
  STRONG = 4,
}

const LENGTH_PATTERN = /.{20,}/;
const NUMBER_PATTERN = /\d/;
const LOWER_CASE_PATTERN = /\p{Ll}/u;
const UPPER_CASE_PATTERN = /\p{Lu}/u;
const SPECIAL_CHARACTERS_PATTERN = /[\p{P}\p{S}\p{Z}]/u;

const PATTERNS: RegExp[] = [
  LENGTH_PATTERN,
  NUMBER_PATTERN,
  LOWER_CASE_PATTERN,
  UPPER_CASE_PATTERN,
  SPECIAL_CHARACTERS_PATTERN,
];

@Component({
  selector: 'app-password-entry',
  templateUrl: './password-entry.component.html',
  styleUrls: ['./password-entry.component.scss'],
  imports: [
    MatFormField,
    NgClass,
    ExtendedModule,
    MatLabel,
    MatInput,
    FormsModule,
    ReactiveFormsModule,
    MatIconButton,
    MatSuffix,
    MatTooltip,
    MatIcon,
    MatError,
    FlexModule,
    MatHint,
    TranslocoPipe,
  ],
})
export class PasswordEntryComponent
  extends FormComponent
  implements AfterViewInit
{
  private translationService = inject(TranslocoService);
  notificationService = inject(NotificationService);
  private _autofill = inject(AutofillMonitor);

  @ViewChild('passwordInput') passwordInput!: ElementRef;

  @Input() checkStrength = false;
  @Input() preFill?: string;
  @Input() isNew = false;

  password = '';
  passwordFormControl = new UntypedFormControl();
  matcher = new FormErrorStateMatcher();
  strength = 0;
  strengthLevels: typeof Strength = Strength;
  hidePw = true;
  showPwButton = false;
  autofilled = false;
  lastInput = '';

  ngAfterViewInit(): void {
    this.setFormControl(this.passwordFormControl);
    this.passwordFormControl.clearValidators();
    this._autofill.monitor(this.passwordInput).subscribe((p) => {
      this.autofilled = p.isAutofilled;
      if (this.showPwButton) {
        this.showPwButton = !p.isAutofilled;
        this.hidePw = true;
      }
    });
    if (this.preFill) {
      this.password = this.preFill;
      this.passwordInput.nativeElement.value = this.password;
    }
  }

  checkInput() {
    if (
      (!this.lastInput || this.lastInput?.length === 0) &&
      this.password.length > 0 &&
      !this.autofilled
    ) {
      this.showPwButton = true;
    }
    this.lastInput = this.password;
  }

  activateValidators() {
    if (this.checkStrength) {
      this.passwordFormControl.setValidators([
        Validators.required,
        Validators.minLength(8),
        this.validatePasswordStrength(),
      ]);
      this.passwordFormControl.updateValueAndValidity();
    }
  }

  getPassword(): string {
    if (this.strength >= Strength.OKAY || !this.checkStrength) {
      return this.password;
    } else {
      const msg = this.translationService.translate('password.unsuccessful');
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      return '';
    }
  }

  validatePasswordStrength(): ValidatorFn {
    return (formControl) => {
      this.strength = this.getPasswordStrength(formControl.value);
      return this.strength >= Strength.OKAY
        ? null
        : { validatePasswordStrength: { value: formControl.value } };
    };
  }

  getPasswordStrength(password: string): number {
    let strength = 0;
    for (const pattern of PATTERNS) {
      if (pattern.test(password)) {
        strength++;
      }
    }
    return strength;
  }
}
