import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { Router } from '@angular/router';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { ClaimUnverifiedUserGql } from '@gql/generated/graphql';

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let loader: HarnessLoader;
  let claimUnverifiedUser: jasmine.Spy;

  beforeEach(async () => {
    claimUnverifiedUser = jasmine
      .createSpy('mutate')
      .and.returnValue(of({ data: {} }));
    const authenticationService = jasmine.createSpyObj(
      'AuthenticationService',
      ['requireAuthentication', 'refetchCurrentUser']
    );
    authenticationService.requireAuthentication.and.returnValue(
      of({ verified: false })
    );

    await configureTestModule(
      [BrowserAnimationsModule, getTranslocoModule(), RegisterComponent],
      [
        { provide: AuthenticationService, useValue: authenticationService },
        {
          provide: ClaimUnverifiedUserGql,
          useValue: { mutate: claimUnverifiedUser },
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', [
            'showAdvanced',
          ]),
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', ['navigate']),
        },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    fixture.componentRef.setInput('apiConfig', { ui: {} });
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  function enter(selector: string, value: string): HTMLInputElement {
    const input = fixture.debugElement.query(By.css(selector))
      .nativeElement as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    return input;
  }

  // Fills the form without moving focus, so the autofocused mail field never blurs, as when
  // submitting with Enter right after typing the address.
  async function fillForm(mailAddress: string) {
    enter('[type="password"]', 'Correct-Horse-Battery-1').dispatchEvent(
      new Event('blur')
    );
    await (await loader.getHarness(MatCheckboxHarness)).check();
    enter('#email-input', mailAddress);
  }

  async function submit() {
    await (
      await loader.getHarness(
        MatButtonHarness.with({ text: 'register.register' })
      )
    ).click();
  }

  it('should not claim the account for an invalid mail address', async () => {
    await fillForm('mail@example.com>');
    await submit();

    expect(claimUnverifiedUser).not.toHaveBeenCalled();
    const mailField = await loader.getHarness(
      MatFormFieldHarness.with({ floatingLabelText: 'login.email' })
    );
    expect(await mailField.getTextErrors()).toEqual(['login.email-invalid']);
  });

  it('should claim the account for a valid mail address', async () => {
    await fillForm('mail@example.com');
    await submit();

    expect(claimUnverifiedUser).toHaveBeenCalledWith({
      variables: {
        mailAddress: 'mail@example.com',
        password: 'Correct-Horse-Battery-1',
      },
    });
  });
});
