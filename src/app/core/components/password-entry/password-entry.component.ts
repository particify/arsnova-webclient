import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  inject,
  input,
} from '@angular/core';
import {
  UntypedFormControl,
  ValidatorFn,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { NotificationService } from '@app/core/services/util/notification.service';
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
  notificationService = inject(NotificationService);
  private _autofill = inject(AutofillMonitor);

  @ViewChild('passwordInput') passwordInput!: ElementRef;

  readonly checkStrength = input(false);
  readonly preFill = input<string>();
  readonly isNew = input(false);
  readonly label = input<string>();

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
    const prefill = this.preFill();
    if (prefill) {
      this.password = prefill;
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
    if (this.checkStrength()) {
      this.passwordFormControl.setValidators([
        Validators.required,
        Validators.minLength(8),
        this.validatePasswordStrength(),
      ]);
      this.passwordFormControl.updateValueAndValidity();
    }
  }

  getPassword(): string {
    return this.strength >= Strength.OKAY || !this.checkStrength()
      ? this.password
      : '';
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
