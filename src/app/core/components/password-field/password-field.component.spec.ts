import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatProgressBarHarness } from '@angular/material/progress-bar/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PasswordFieldComponent } from '@app/core/components/password-field/password-field.component';
import {
  PasswordStrength,
  PasswordStrengthRequest,
  PasswordStrengthResult,
  PasswordStrengthService,
} from '@app/core/services/util/password-strength.service';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { Observable, Subject } from 'rxjs';

const PASSWORD = 'correct horse battery';
const WEAK_PASSWORD = 'P@ssw0rd12';
const MAIL_ADDRESS = 'user@example.com';
const OTHER_MAIL_ADDRESS = 'other@example.com';
const INVALID_PASSWORD = ' correct horse battery';

function weak(relativeStrength: number, hint?: string): PasswordStrength {
  return { acceptable: false, relativeStrength, hint };
}

describe('PasswordFieldComponent', () => {
  let component: PasswordFieldComponent;
  let fixture: ComponentFixture<PasswordFieldComponent>;
  let passwordStrengthService: jasmine.SpyObj<PasswordStrengthService>;
  let ratings: Subject<PasswordStrengthResult>;
  let watchedRequests: PasswordStrengthRequest[];

  async function createComponent(checkStrength: boolean) {
    ratings = new Subject();
    watchedRequests = [];
    passwordStrengthService = jasmine.createSpyObj('PasswordStrengthService', [
      'watch',
    ]);
    passwordStrengthService.watch.and.callFake(
      (requests: Observable<PasswordStrengthRequest>) => {
        requests.subscribe((r) => watchedRequests.push(r));
        return ratings;
      }
    );
    await configureTestModule(
      [BrowserAnimationsModule, getTranslocoModule(), PasswordFieldComponent],
      [{ provide: PasswordStrengthService, useValue: passwordStrengthService }]
    ).compileComponents();
    fixture = TestBed.createComponent(PasswordFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('checkStrength', checkStrength);
    fixture.componentRef.setInput('mailAddress', MAIL_ADDRESS);
    fixture.detectChanges();
  }

  /** Types a password, as a user does. */
  function type(password: string) {
    component.password = password;
    component.passwordFormControl.setValue(password);
    fixture.detectChanges();
  }

  /** Types into the field from the keyboard. */
  function typeIn(password: string) {
    const input = fixture.debugElement.query(By.css('input'))
      .nativeElement as HTMLInputElement;
    input.value = password;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  function lastRequestedPassword(): string {
    return watchedRequests[watchedRequests.length - 1].password;
  }

  /** The backend's rating of the current value and mail address arrives. */
  function rate(strength?: PasswordStrength) {
    ratings.next({
      password: component.passwordFormControl.value,
      mailAddress: component.mailAddress(),
      strength,
    });
    fixture.detectChanges();
  }

  /** The backend refuses the current value as invalid. */
  function refuse() {
    ratings.next({
      password: component.passwordFormControl.value,
      mailAddress: component.mailAddress(),
      invalid: true,
    });
    fixture.detectChanges();
  }

  function changeMailAddress(mailAddress: string) {
    fixture.componentRef.setInput('mailAddress', mailAddress);
    fixture.detectChanges();
  }

  function leave() {
    fixture.debugElement
      .query(By.css('input'))
      .nativeElement.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
  }

  /** Types a password, leaves the field and receives its rating. */
  function enterPassword(password: string, strength?: PasswordStrength) {
    type(password);
    leave();
    rate(strength);
  }

  function getError(testId: string): string | undefined {
    return fixture.debugElement
      .query(By.css(`[data-testid="${testId}"]`))
      ?.nativeElement.textContent.trim();
  }

  function getWeakPasswordError(): string | undefined {
    return getError('password-too-weak-error');
  }

  function getInvalidPasswordError(): string | undefined {
    return getError('password-invalid-error');
  }

  function isFieldInvalid(): boolean {
    return !!fixture.debugElement.query(By.css('.mat-form-field-invalid'));
  }

  async function getStrengthBar() {
    return TestbedHarnessEnvironment.loader(fixture).getHarness(
      MatProgressBarHarness
    );
  }

  async function expectBar(percent: number, level: string) {
    const bar = await getStrengthBar();
    expect(await bar.getValue()).toBe(percent);
    const host = await bar.host();
    expect(await host.hasClass(`strength-${level}`)).toBeTrue();
    expect(await host.getAttribute('aria-valuetext')).toBe(
      `password.strength-${level}`
    );
  }

  async function expectBarVisible(visible: boolean) {
    const host = await (await getStrengthBar()).host();
    expect(await host.getCssValue('visibility')).toBe(
      visible ? 'visible' : 'hidden'
    );
  }

  describe('for a new password', () => {
    beforeEach(async () => {
      await createComponent(true);
    });

    it('should have each typed value rated with the mail address', () => {
      type(WEAK_PASSWORD);
      expect(watchedRequests).toEqual([
        { password: WEAK_PASSWORD, mailAddress: MAIL_ADDRESS },
      ]);
    });

    it('should have the password rated again when the mail address changes', () => {
      type(WEAK_PASSWORD);
      changeMailAddress(OTHER_MAIL_ADDRESS);
      expect(watchedRequests).toEqual([
        { password: WEAK_PASSWORD, mailAddress: MAIL_ADDRESS },
        { password: WEAK_PASSWORD, mailAddress: OTHER_MAIL_ADDRESS },
      ]);
    });

    it('should reject a password by its rating for a changed mail address', () => {
      enterPassword(PASSWORD, { acceptable: true, relativeStrength: 1 });
      changeMailAddress(OTHER_MAIL_ADDRESS);
      rate(weak(0.2));
      expect(component.getPassword()).toBe('');
    });

    it('should not reject a password by a rating for the previous mail address', () => {
      type(PASSWORD);
      leave();
      changeMailAddress(OTHER_MAIL_ADDRESS);
      ratings.next({
        password: PASSWORD,
        mailAddress: MAIL_ADDRESS,
        strength: weak(0.2),
      });
      fixture.detectChanges();
      expect(component.getPassword()).toBe(PASSWORD);
    });

    function getDescribedBy(): string[] {
      return (
        fixture.debugElement
          .query(By.css('input'))
          .nativeElement.getAttribute('aria-describedby') ?? ''
      ).split(' ');
    }

    it('should not describe the input by the strength bar before a rating', () => {
      type(WEAK_PASSWORD);
      expect(getDescribedBy()).not.toContain(component.strengthBarId);
    });

    it('should not describe the input by the strength bar below 8 characters', () => {
      type(WEAK_PASSWORD);
      rate(weak(0.2));
      type('1234567');
      expect(getDescribedBy()).not.toContain(component.strengthBarId);
    });

    it('should describe the input by the strength bar along with the hint', () => {
      type(WEAK_PASSWORD);
      rate(weak(0.2));
      const ids = getDescribedBy();
      expect(ids).toContain(component.strengthBarId);
      expect(ids.length).toBeGreaterThan(1);
      expect(
        fixture.debugElement.query(By.css('mat-progress-bar')).nativeElement.id
      ).toBe(component.strengthBarId);
    });

    it('should describe the input by the strength bar along with the error', () => {
      enterPassword(WEAK_PASSWORD, weak(0.2, 'This is a common password.'));
      const errorId = fixture.debugElement.query(
        By.css('[data-testid="password-too-weak-error"]')
      ).nativeElement.id;
      expect(getDescribedBy()).toEqual(
        jasmine.arrayWithExactContents([component.strengthBarId, errorId])
      );
    });

    it('should give each instance its own strength bar id', () => {
      const other = TestBed.createComponent(PasswordFieldComponent);
      expect(other.componentInstance.strengthBarId).not.toBe(
        component.strengthBarId
      );
    });

    it('should show the strength bar within the field, without taking focus', () => {
      const bar = fixture.debugElement.query(
        By.css('mat-form-field mat-progress-bar')
      );
      const mousedown = new MouseEvent('mousedown', { cancelable: true });
      bar.nativeElement.dispatchEvent(mousedown);
      expect(mousedown.defaultPrevented).toBeTrue();
    });

    it('should rate without trailing whitespace while typing', () => {
      typeIn('correct horse ');
      expect(lastRequestedPassword()).toBe('correct horse');
    });

    it('should rate leading whitespace while typing', () => {
      typeIn(' correct horse');
      expect(lastRequestedPassword()).toBe(' correct horse');
    });

    it('should rate the full password once the field is left', () => {
      typeIn('correct horse ');
      leave();
      expect(lastRequestedPassword()).toBe('correct horse ');
      refuse();
      expect(getInvalidPasswordError()).toBe('password.password-invalid');
    });

    it('should rate the full password on submit, without holding it up', () => {
      typeIn('correct horse battery ');
      ratings.next({
        password: 'correct horse battery',
        mailAddress: MAIL_ADDRESS,
        strength: weak(0.2),
      });
      expect(component.getPassword()).toBe('correct horse battery ');
      expect(lastRequestedPassword()).toBe('correct horse battery ');
    });

    it('should hide the strength bar until a rating arrives', async () => {
      await expectBarVisible(false);
      type(WEAK_PASSWORD);
      await expectBarVisible(false);
    });

    it('should show the strength bar once a rating arrives', async () => {
      enterPassword(WEAK_PASSWORD, weak(0.2));
      await expectBarVisible(true);
    });

    it('should keep the strength bar hidden if no rating could be fetched', async () => {
      enterPassword(WEAK_PASSWORD);
      await expectBarVisible(false);
    });

    for (const [relativeStrength, percent, level] of [
      [0.19, 0, 'very-weak'],
      [0.39, 20, 'very-weak'],
      [0.6, 60, 'weak'],
      [0.99, 80, 'weak'],
    ] as const) {
      it(`should show a relative strength of ${relativeStrength} as ${percent} % ${level}`, async () => {
        enterPassword(WEAK_PASSWORD, weak(relativeStrength));
        await expectBar(percent, level);
      });
    }

    it('should fill the strength bar only for an acceptable password', async () => {
      enterPassword(PASSWORD, { acceptable: true, relativeStrength: 1 });
      await expectBar(100, 'sufficient');
    });

    it('should keep the last rating while the current value is being rated', async () => {
      enterPassword(WEAK_PASSWORD, weak(0.6));
      type(WEAK_PASSWORD + '!');
      await expectBar(60, 'weak');
      await expectBarVisible(true);
    });

    it('should hide the strength bar again below 8 characters', async () => {
      enterPassword(WEAK_PASSWORD, weak(0.6));
      type('1234567');
      await expectBarVisible(false);
    });

    it('should show the strength bar from 8 characters', async () => {
      type('12345678');
      rate(weak(0.3));
      await expectBarVisible(true);
    });

    it('should report only the minimum length below 10 characters, even if rated weak', () => {
      type('123456789');
      leave();
      rate(weak(0.2, 'This is a common password.'));
      expect(component.passwordFormControl.hasError('minlength')).toBeTrue();
      expect(
        component.passwordFormControl.hasError('passwordTooWeak')
      ).toBeFalse();
      expect(getWeakPasswordError()).toBeUndefined();
    });

    it('should return an acceptable password', () => {
      enterPassword(PASSWORD, { acceptable: true, relativeStrength: 1 });
      expect(component.getPassword()).toBe(PASSWORD);
    });

    it("should show the backend's hint once the field is left", () => {
      enterPassword(WEAK_PASSWORD, weak(0.2, 'This is a common password.'));
      expect(getWeakPasswordError()).toBe('This is a common password.');
    });

    it('should show no error before the field is first left', () => {
      type(WEAK_PASSWORD);
      rate(weak(0.2, 'This is a common password.'));
      expect(
        component.passwordFormControl.hasError('passwordTooWeak')
      ).toBeTrue();
      expect(getWeakPasswordError()).toBeUndefined();
      expect(isFieldInvalid()).toBeFalse();
    });

    it("should show the backend's hint after a submit attempt", () => {
      type(WEAK_PASSWORD);
      rate(weak(0.2, 'This is a common password.'));
      expect(component.getPassword()).toBe('');
      fixture.detectChanges();
      expect(getWeakPasswordError()).toBe('This is a common password.');
    });

    it('should ask for more characters if the backend gives no hint', () => {
      enterPassword(WEAK_PASSWORD, weak(0.8));
      component.getPassword();
      fixture.detectChanges();
      expect(getWeakPasswordError()).toBe('password.add-more-characters');
    });

    it('should update the error while typing on once the field was left', () => {
      enterPassword(WEAK_PASSWORD, weak(0.2, 'This is a common password.'));
      type(WEAK_PASSWORD + '!');
      rate(weak(0.4, 'Add another word.'));
      expect(getWeakPasswordError()).toBe('Add another word.');
    });

    it('should remove the error once the password is acceptable', () => {
      enterPassword(WEAK_PASSWORD, weak(0.2, 'This is a common password.'));
      type(PASSWORD);
      rate({ acceptable: true, relativeStrength: 1 });
      expect(getWeakPasswordError()).toBeUndefined();
      expect(isFieldInvalid()).toBeFalse();
    });

    it('should show an invalid password once the field is left', async () => {
      type(INVALID_PASSWORD);
      leave();
      refuse();
      expect(getInvalidPasswordError()).toBe('password.password-invalid');
      await expectBar(0, 'very-weak');
      await expectBarVisible(true);
    });

    it('should show no error for an invalid password before the field is first left', () => {
      type('correct horse ');
      refuse();
      expect(
        component.passwordFormControl.hasError('passwordInvalid')
      ).toBeTrue();
      expect(getInvalidPasswordError()).toBeUndefined();
      expect(isFieldInvalid()).toBeFalse();
    });

    it('should not return an invalid password', () => {
      enterPassword(PASSWORD, { acceptable: true, relativeStrength: 1 });
      type(INVALID_PASSWORD);
      refuse();
      expect(component.getPassword()).toBe('');
      fixture.detectChanges();
      expect(getInvalidPasswordError()).toBe('password.password-invalid');
    });

    it('should reject a password of 9 characters as too short', () => {
      type('123456789');
      leave();
      expect(component.passwordFormControl.hasError('minlength')).toBeTrue();
      expect(component.getPassword()).toBe('');
    });

    it('should accept a length of 10 characters', () => {
      type('1234567890');
      leave();
      expect(component.passwordFormControl.hasError('minlength')).toBeFalse();
    });

    it('should not hold up submitting before a rating arrives', () => {
      type(PASSWORD);
      leave();
      expect(component.getPassword()).toBe(PASSWORD);
    });

    it('should keep the error shown while the changed password is being rated', () => {
      enterPassword(WEAK_PASSWORD, weak(0.2, 'This is a common password.'));
      type(WEAK_PASSWORD + '!');
      expect(getWeakPasswordError()).toBe('This is a common password.');
      expect(isFieldInvalid()).toBeTrue();
    });

    it('should drop the error of an earlier value below 8 characters', () => {
      enterPassword(WEAK_PASSWORD, weak(0.2, 'This is a common password.'));
      type('1234567');
      type(PASSWORD);
      expect(getWeakPasswordError()).toBeUndefined();
      expect(component.passwordFormControl.valid).toBeTrue();
    });

    it('should not hold up submitting by the error of an earlier value', () => {
      enterPassword(WEAK_PASSWORD, weak(0.2, 'This is a common password.'));
      type(PASSWORD);
      expect(component.getPassword()).toBe(PASSWORD);
    });

    it('should leave the check to the backend if it could not be reached', () => {
      enterPassword(PASSWORD);
      expect(component.getPassword()).toBe(PASSWORD);
    });

    it('should reject the password once a retried rating arrives', () => {
      enterPassword(WEAK_PASSWORD);
      rate(weak(0.2));
      expect(component.getPassword()).toBe('');
    });
  });

  describe('for an existing password', () => {
    beforeEach(async () => {
      await createComponent(false);
    });

    it('should not rate the password', () => {
      type(WEAK_PASSWORD);
      leave();
      expect(component.getPassword()).toBe(WEAK_PASSWORD);
      expect(passwordStrengthService.watch).not.toHaveBeenCalled();
    });

    it('should show no strength bar', () => {
      expect(fixture.debugElement.query(By.css('mat-progress-bar'))).toBeNull();
    });
  });
});
