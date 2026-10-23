import {
  AfterViewInit,
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  inject,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  UntypedFormControl,
  ValidationErrors,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { NotificationService } from '@app/core/services/util/notification.service';
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
import { MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import {
  MIN_PASSWORD_LENGTH,
  MIN_RATED_PASSWORD_LENGTH,
  PasswordStrength,
  PasswordStrengthResult,
  PasswordStrengthService,
  isSameRequest,
} from '@app/core/services/util/password-strength.service';
import { MatProgressBar } from '@angular/material/progress-bar';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  takeUntil,
} from 'rxjs';

/**
 * The strength bar moves in steps, so small changes of the rating do not make it jitter. It is
 * rounded down, and only full once the password is acceptable.
 */
const STRENGTH_STEPS = 5;
/** Fill of the strength bar from which a password counts as weak rather than very weak. */
const WEAK_PROGRESS = 0.6;

/** Rating of a password the backend refuses to store at all. */
const INVALID_STRENGTH: PasswordStrength = {
  acceptable: false,
  relativeStrength: 0,
};

let nextStrengthBarId = 0;

@Component({
  selector: 'app-password-field',
  templateUrl: './password-field.component.html',
  styleUrls: ['./password-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatFormField,
    NgClass,
    MatLabel,
    MatInput,
    FormsModule,
    ReactiveFormsModule,
    MatIconButton,
    MatSuffix,
    MatTooltip,
    MatIcon,
    MatError,
    MatHint,
    MatProgressBar,
    TranslocoPipe,
  ],
})
export class PasswordFieldComponent
  extends FormComponent
  implements OnInit, AfterViewInit
{
  notificationService = inject(NotificationService);
  private _autofill = inject(AutofillMonitor);
  private passwordStrengthService = inject(PasswordStrengthService);

  @ViewChild('passwordInput') passwordInput!: ElementRef;

  readonly checkStrength = input(false);
  readonly preFill = input<string>();
  readonly isNew = input(false);
  readonly label = input<string>();
  /** The mail address of the account, if known, which a new password must not be built from. */
  readonly mailAddress = input<string>();

  password = '';
  passwordFormControl = new UntypedFormControl();
  strength?: PasswordStrength;
  readonly strengthBarId = `password-strength-${nextStrengthBarId++}`;
  private readonly mailAddress$ = toObservable(this.mailAddress);
  /** The latest rating, which may still be for an earlier value. */
  private lastRating?: PasswordStrengthResult;
  /** Whether the user is typing, until the field is left or a submit is attempted. */
  protected readonly typing$ = new BehaviorSubject(false);
  hidePw = true;
  showPwButton = false;
  autofilled = false;
  lastInput = '';

  ngOnInit(): void {
    if (this.checkStrength()) {
      this.passwordFormControl.setValidators([
        Validators.required,
        Validators.minLength(MIN_PASSWORD_LENGTH),
        () => this.validateStrength(),
      ]);
      this.passwordFormControl.updateValueAndValidity();
    }
  }

  ngAfterViewInit(): void {
    if (this.checkStrength()) {
      this.rateWhileTyping();
    }
    this.setFormControl(this.passwordFormControl);
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

  /**
   * The password, or an empty string while a new password is not acceptable yet. Counts as a
   * submit attempt, which shows why a password is not acceptable.
   */
  getPassword(): string {
    if (!this.checkStrength()) {
      return this.password;
    }
    this.typing$.next(false);
    this.passwordFormControl.markAsTouched();
    if (this.passwordFormControl.valid) {
      return this.password;
    }
    // A rating of an earlier value does not hold up submitting: the backend checks the password
    // anyway.
    return this.password.length >= MIN_PASSWORD_LENGTH && !this.isRated()
      ? this.password
      : '';
  }

  strengthPercent(): number {
    return this.displayedProgress() * 100;
  }

  /** How far the password is from the requirement, for the bar's colour and label. */
  strengthLevel(): 'very-weak' | 'weak' | 'sufficient' {
    if (this.strength?.acceptable) {
      return 'sufficient';
    }
    return this.displayedProgress() >= WEAK_PROGRESS ? 'weak' : 'very-weak';
  }

  private displayedProgress(): number {
    if (!this.strength) {
      return 0;
    }
    if (this.strength.acceptable) {
      return 1;
    }
    const steps = Math.floor(this.strength.relativeStrength * STRENGTH_STEPS);
    return Math.min(steps, STRENGTH_STEPS - 1) / STRENGTH_STEPS;
  }

  /**
   * Rates the password again whenever it or the mail address changes. Shows the last known rating
   * until the one for the current request arrives, so the bar does not flash empty while typing.
   */
  private rateWhileTyping() {
    const passwords = this.passwordFormControl.valueChanges.pipe(
      map((password: string | null) => password ?? ''),
      distinctUntilChanged()
    );
    passwords.pipe(takeUntil(this.destroyed$)).subscribe((password) => {
      if (password.length < MIN_RATED_PASSWORD_LENGTH) {
        this.strength = undefined;
        this.lastRating = undefined;
      }
    });
    const mailAddresses = this.mailAddress$.pipe(
      map((mailAddress) => mailAddress || undefined),
      distinctUntilChanged()
    );
    // A passphrase being typed ends with a space now and then, which must not make it invalid.
    const requests = combineLatest([
      passwords,
      this.typing$,
      mailAddresses,
    ]).pipe(
      map(([password, typing, mailAddress]) => ({
        password: typing ? password.trimEnd() : password,
        mailAddress,
      }))
    );
    this.passwordStrengthService
      .watch(requests)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((result) => {
        if (result.invalid) {
          this.strength = INVALID_STRENGTH;
        } else if (result.strength) {
          this.strength = result.strength;
        }
        this.lastRating = result;
        this.passwordFormControl.updateValueAndValidity({ emitEvent: false });
      });
  }

  /** Whether the latest rating is for the current password and mail address. */
  private isRated(): boolean {
    return (
      !!this.lastRating &&
      isSameRequest(this.lastRating, {
        password: this.passwordFormControl.value ?? '',
        mailAddress: this.mailAddress(),
      })
    );
  }

  /**
   * Applies the latest rating, until the one for the current value replaces it, so its error does
   * not vanish while the next rating is on its way. Without a rating, e.g. if the backend cannot
   * be reached, the password is accepted here and the backend decides when it is set.
   */
  private validateStrength(): ValidationErrors | null {
    const password: string = this.passwordFormControl.value ?? '';
    const rating = this.lastRating;
    if (!rating || password.length < MIN_PASSWORD_LENGTH) {
      return null;
    }
    if (rating.invalid) {
      return { passwordInvalid: true };
    }
    return rating.strength && !rating.strength.acceptable
      ? { passwordTooWeak: true }
      : null;
  }
}
