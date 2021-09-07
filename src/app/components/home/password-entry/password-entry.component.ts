import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../../services/http/user.service';
import { AdvancedSnackBarTypes, NotificationService } from '../../../services/util/notification.service';
import { RegisterErrorStateMatcher } from '../register/register.component';

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
  passwordFormControl = new FormControl('', [Validators.required, Validators.minLength(8), this.validatePasswordStrength()]);
  matcher = new RegisterErrorStateMatcher();
  strength = 0;
  strengthLevels: typeof Strength = Strength;
  hidePw = true;

  constructor(private translationService: TranslateService,
              public userService: UserService,
              public notificationService: NotificationService) {}

  ngAfterViewInit(): void {
    if (this.preFill) {
      this.password = this.preFill;
      this.passwordInput.nativeElement.value = this.password;
    }
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
    return (formControl: FormControl) => {
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
