import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerifyUserInvitationComponent } from './verify-user-invitation.component';
import { Router } from '@angular/router';
import { ChallengeService } from '@app/core/services/challenge.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { PasswordStrengthService } from '@app/core/services/util/password-strength.service';
import { GlobalHintsService } from '@app/standalone/global-hints/global-hints.service';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { NEVER, of } from 'rxjs';
import { VerifyUserMailAddressUnauthenticatedGql } from '@gql/generated/graphql';

const PASSWORD = 'Correct-Horse-Battery-1';

describe('VerifyUserInvitationComponent', () => {
  let fixture: ComponentFixture<VerifyUserInvitationComponent>;
  let loader: HarnessLoader;
  let verify: jasmine.Spy;

  beforeEach(async () => {
    verify = jasmine
      .createSpy('mutate')
      .and.returnValue(
        of({ data: { verifyUserMailAddressUnauthenticated: true } })
      );
    const challengeService = jasmine.createSpyObj('ChallengeService', [
      'authenticateByChallenge',
    ]);
    challengeService.authenticateByChallenge.and.returnValue(of('token'));
    const passwordStrengthService = jasmine.createSpyObj(
      'PasswordStrengthService',
      ['watch']
    );
    passwordStrengthService.watch.and.returnValue(NEVER);

    await configureTestModule(
      [
        BrowserAnimationsModule,
        getTranslocoModule(),
        VerifyUserInvitationComponent,
      ],
      [
        { provide: ChallengeService, useValue: challengeService },
        {
          provide: GlobalHintsService,
          useValue: jasmine.createSpyObj('GlobalHintsService', ['removeHint']),
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', [
            'showAdvanced',
            'showOnRequestClientError',
          ]),
        },
        { provide: PasswordStrengthService, useValue: passwordStrengthService },
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', ['navigate']),
        },
        {
          provide: VerifyUserMailAddressUnauthenticatedGql,
          useValue: { mutate: verify },
        },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(VerifyUserInvitationComponent);
    fixture.componentRef.setInput('apiConfig', { ui: {} });
    fixture.componentRef.setInput('code', '12345678');
    fixture.componentRef.setInput('userId', 'user-id');
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should set the typed password', async () => {
    const input = fixture.debugElement.query(By.css('[type="password"]'))
      .nativeElement as HTMLInputElement;
    input.value = PASSWORD;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    await (await loader.getHarness(MatCheckboxHarness)).check();
    await (
      await loader.getHarness(
        MatButtonHarness.with({ text: 'user-activation.create-account' })
      )
    ).click();

    expect(verify).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        variables: {
          verificationCode: '12345678',
          userId: 'user-id',
          password: PASSWORD,
        },
      })
    );
  });
});
