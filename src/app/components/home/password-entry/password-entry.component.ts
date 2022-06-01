import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AdvancedSnackBarTypes, NotificationService } from '../../../services/util/notification.service';
import { FormErrorStateMatcher } from '../form-error-state-matcher/form-error-state-matcher';
import { AutofillMonitor } from '@angular/cdk/text-field';

enum Strength {
  WEAK = 1,
  OKAY = 2,
  STRONG = 4
}

const LENGTH_PATTERN = /.{20,}/;
const NUMBER_PATTERN = /\d/;
const LOWER_CASE_PATTERN = /\p{Ll}/u;
const UPPER_CASE_PATTERN = /\p{Lu}/u;
const SPECIAL_CHARACTERS_PATTERN = /[\p{P}\p{S}\p{Z}]/u;

const PATTERNS: RegExp[] = [LENGTH_PATTERN, NUMBER_PATTERN, LOWER_CASE_PATTERN, UPPER_CASE_PATTERN, SPECIAL_CHARACTERS_PATTERN];

@Component({
  selector: 'app-password-entry',
  templateUrl: './password-entry.component.html',
  styleUrls: ['./password-entry.component.scss']
})
export class PasswordEntryComponent implements AfterViewInit {

  @ViewChild('passwordInput') passwordInput: ElementRef;

  @Input() checkStrength = false;
  @Input() preFill: string;
  @Input() isNew = false;

  password: string;
  passwordFormControl = new UntypedFormControl('', [Validators.required, Validators.minLength(8), this.validatePasswordStrength()]);
  matcher = new FormErrorStateMatcher();
  strength = 0;
  strengthLevels: typeof Strength = Strength;
  hidePw = true;
  showPwButton = false;
  autofilled = false;
  lastInput: string;

  constructor(private translationService: TranslateService,
              public notificationService: NotificationService,
              private _autofill: AutofillMonitor) {}

  ngAfterViewInit(): void {
    this._autofill.monitor(this.passwordInput).subscribe(p => {
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
    if ((!this.lastInput || this.lastInput?.length === 0) && this.password.length > 0 && !this.autofilled) {
      this.showPwButton = true;
    }
    this.lastInput = this.password;
  }

  getPassword(): string {
    if (this.strength >= Strength.OKAY || !this.checkStrength) {
      return this.password;
    } else {
      const msg = this.translationService.instant('password.unsuccessful');
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
    }
  }

  validatePasswordStrength() {
    return (formControl: UntypedFormControl) => {
      this.strength = this.getPasswordStrength(formControl.value);
      return null;
    }
  }

  getPasswordStrength(password: string): number {
    let strength = 0;
    for (let pattern of PATTERNS) {
      if (pattern.test(password)) {
        strength++;
      }
    }
    return strength;
  }

}
