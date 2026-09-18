import { Location } from '@angular/common';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { PasswordEntryComponent } from '@app/core/components/password-entry/password-entry.component';
import { UserProfileComponent } from '@app/core/components/user-profile/user-profile.component';
import {
  ApiConfig,
  AuthenticationProvider,
  AuthenticationProviderRole,
  AuthenticationProviderType,
} from '@app/core/models/api-config';
import { DialogService } from '@app/core/services/util/dialog.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import {
  CurrentUserWithSettingsGql,
  DeleteUserGql,
  RequestUserPasswordSetupGql,
  UpdateUserMailAddressGql,
  UpdateUserPasswordGql,
  UpdateUserSettingsGql,
} from '@gql/generated/graphql';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import { of } from 'rxjs';

/**
 * Id of an additional username/password provider, e.g. an LDAP registration. The backend keys
 * those by UUID, unlike the legacy 'user-db' id of the local one.
 */
const LDAP_PROVIDER_ID = '9d1f8e4c-6a2b-4c8d-9f3e-1b7a5c2d4e60';

const LOCAL_PROVIDER: AuthenticationProvider = {
  id: 'user-db',
  title: 'arsnova',
  type: AuthenticationProviderType.USERNAME_PASSWORD,
  order: 0,
  allowedRoles: [
    AuthenticationProviderRole.MODERATOR,
    AuthenticationProviderRole.PARTICIPANT,
  ],
};

const LDAP_PROVIDER: AuthenticationProvider = {
  id: LDAP_PROVIDER_ID,
  title: 'LDAP',
  type: AuthenticationProviderType.USERNAME_PASSWORD,
  order: 0,
  allowedRoles: [
    AuthenticationProviderRole.MODERATOR,
    AuthenticationProviderRole.PARTICIPANT,
  ],
};

const MAIL_ADDRESS = 'user@example.com';
const NEW_PASSWORD = 'Str0ng! new passw0rd';

interface UserOverrides {
  verified?: boolean;
  mailAddress?: string | null;
  localPasswordSet?: boolean;
}

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;

  const router = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
  const location = jasmine.createSpyObj('Location', ['replaceState']);
  const notificationService = jasmine.createSpyObj('NotificationService', [
    'showAdvanced',
    'showOnRequestClientError',
  ]);
  const dialogService = jasmine.createSpyObj('DialogService', [
    'openDeleteDialog',
    'openUserActivationDialog',
  ]);
  const updateUserPassword = jasmine.createSpyObj('UpdateUserPasswordGql', [
    'mutate',
  ]);
  const requestUserPasswordSetup = jasmine.createSpyObj(
    'RequestUserPasswordSetupGql',
    ['mutate']
  );

  async function createComponent(
    authenticationProviders: AuthenticationProvider[],
    userOverrides: UserOverrides = {}
  ) {
    const user = {
      __typename: 'User',
      id: 'user-id',
      verified: true,
      displayId: MAIL_ADDRESS,
      displayName: MAIL_ADDRESS,
      mailAddress: MAIL_ADDRESS,
      unverifiedMailAddress: null,
      localPasswordSet: true,
      uiSettings: null,
      ...userOverrides,
    };
    const apiConfig: ApiConfig = {
      authenticationProviders,
      features: {},
      ui: {},
      readOnly: false,
    };
    const currentUserGql = {
      watch: () => ({
        // The component only reacts to fully loaded results.
        valueChanges: of({
          data: { currentUser: user },
          dataState: 'complete',
          loading: false,
        }),
      }),
    };

    await configureTestModule(
      [BrowserAnimationsModule, getTranslocoModule(), UserProfileComponent],
      [
        { provide: CurrentUserWithSettingsGql, useValue: currentUserGql },
        { provide: DeleteUserGql, useValue: { mutate: () => of({}) } },
        { provide: UpdateUserSettingsGql, useValue: { mutate: () => of({}) } },
        {
          provide: UpdateUserMailAddressGql,
          useValue: { mutate: () => of({}) },
        },
        { provide: UpdateUserPasswordGql, useValue: updateUserPassword },
        {
          provide: RequestUserPasswordSetupGql,
          useValue: requestUserPasswordSetup,
        },
        { provide: Router, useValue: router },
        { provide: Location, useValue: location },
        { provide: NotificationService, useValue: notificationService },
        { provide: DialogService, useValue: dialogService },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('apiConfig', apiConfig);
    fixture.detectChanges();
  }

  /**
   * Panel titles are built from plain markup rather than `mat-panel-title`, so the harness cannot
   * read them. Translations are not loaded, so these are keys.
   */
  function getPanelTitles(): string[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll(
        'mat-expansion-panel-header .panel-header span'
      )
    ).map((title) => ((title as HTMLElement).textContent ?? '').trim());
  }

  function hasPanel(titleKey: string): boolean {
    return getPanelTitles().includes(titleKey);
  }

  function getPasswordEntries(): DebugElement[] {
    return fixture.debugElement.queryAll(By.directive(PasswordEntryComponent));
  }

  beforeEach(() => {
    router.navigate.calls.reset();
    notificationService.showAdvanced.calls.reset();
    updateUserPassword.mutate.calls.reset();
    updateUserPassword.mutate.and.returnValue(
      of({ data: { updateUserPassword: { id: 'user-id' } } })
    );
    requestUserPasswordSetup.mutate.calls.reset();
    requestUserPasswordSetup.mutate.and.returnValue(
      of({ data: { requestUserPasswordSetup: true } })
    );
  });

  it('should create', async () => {
    await createComponent([LOCAL_PROVIDER]);
    expect(component).toBeTruthy();
  });

  describe('with local accounts enabled', () => {
    it('should show the mail and change password panels for a local account', async () => {
      await createComponent([LOCAL_PROVIDER]);
      expect(hasPanel('user-profile.email')).toBeTrue();
      expect(hasPanel('user-profile.change-password')).toBeTrue();
      expect(hasPanel('user-profile.set-password')).toBeFalse();
    });

    it('should offer to set a password for an account without one', async () => {
      await createComponent([LOCAL_PROVIDER], { localPasswordSet: false });
      expect(hasPanel('user-profile.set-password')).toBeTrue();
      expect(hasPanel('user-profile.change-password')).toBeFalse();
      // Changing the mail address requires the current password as proof.
      expect(hasPanel('user-profile.email')).toBeFalse();
    });

    it('should replace the password fields with a hint in set password mode', async () => {
      await createComponent([LOCAL_PROVIDER], { localPasswordSet: false });
      expect(getPasswordEntries()).toHaveSize(0);
      expect(fixture.nativeElement.querySelector('app-hint')).toBeTruthy();
    });

    it('should show the username instead of the panels without a mail address', async () => {
      await createComponent([LOCAL_PROVIDER], { mailAddress: null });
      expect(hasPanel('user-profile.email')).toBeFalse();
      expect(hasPanel('user-profile.change-password')).toBeFalse();
      expect(hasPanel('user-profile.set-password')).toBeFalse();
      expect(
        fixture.nativeElement.querySelector('p.username').textContent
      ).toContain('user-profile.username');
    });
  });

  describe('with local accounts disabled', () => {
    beforeEach(async () => {
      await createComponent([LDAP_PROVIDER]);
    });

    it('should show neither the mail nor a password panel', () => {
      expect(hasPanel('user-profile.email')).toBeFalse();
      expect(hasPanel('user-profile.change-password')).toBeFalse();
      expect(hasPanel('user-profile.set-password')).toBeFalse();
    });

    it('should still show the preferences and delete account panels', () => {
      expect(hasPanel('user-profile.preferences')).toBeTrue();
      expect(hasPanel('user-profile.delete-account')).toBeTrue();
    });
  });

  describe('as a guest', () => {
    beforeEach(async () => {
      await createComponent([LOCAL_PROVIDER], {
        verified: false,
        mailAddress: null,
      });
    });

    it('should show the guest hint instead of the account panels', () => {
      expect(hasPanel('user-profile.email')).toBeFalse();
      expect(hasPanel('user-profile.change-password')).toBeFalse();
      expect(hasPanel('user-profile.set-password')).toBeFalse();
      expect(
        fixture.nativeElement.querySelector('app-hint').textContent
      ).toContain('user-profile.guest-hint');
    });
  });

  describe('submitting the password panel', () => {
    it('should change the password of an account which has one', async () => {
      await createComponent([LOCAL_PROVIDER]);
      // The mail panel contributes a password entry of its own, ahead of the two below.
      const [currentPassword, newPassword] = getPasswordEntries()
        .slice(-2)
        .map((entry) => entry.componentInstance as PasswordEntryComponent);
      currentPassword.password = 'old password';
      newPassword.password = NEW_PASSWORD;
      newPassword.passwordFormControl.setValue(NEW_PASSWORD);
      newPassword.activateValidators();

      component.updatePassword();

      expect(updateUserPassword.mutate).toHaveBeenCalledWith({
        variables: {
          oldPassword: 'old password',
          newPassword: NEW_PASSWORD,
        },
      });
      expect(requestUserPasswordSetup.mutate).not.toHaveBeenCalled();
    });

    it('should request a password setup mail for an account without a password', async () => {
      await createComponent([LOCAL_PROVIDER], { localPasswordSet: false });

      component.updatePassword();

      expect(requestUserPasswordSetup.mutate).toHaveBeenCalled();
      expect(updateUserPassword.mutate).not.toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith([
        'password-reset',
        MAIL_ADDRESS,
      ]);
    });
  });
});
