import {
  Component,
  ElementRef,
  computed,
  inject,
  input,
  linkedSignal,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { DialogService } from '@app/core/services/util/dialog.service';
import { Router } from '@angular/router';
import { Location, AsyncPipe } from '@angular/common';
import { HintType } from '@app/core/models/hint-type.enum';
import { filter } from 'rxjs';
import { AutofocusDirective } from '@app/core/directives/autofocus.directive';
import { FlexModule } from '@angular/flex-layout';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
} from '@angular/material/expansion';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { ExtensionPointComponent } from '@projects/extension-point/src/lib/extension-point.component';
import { HintComponent } from '@app/standalone/hint/hint.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { SettingsSlideToggleComponent } from '@app/standalone/settings-slide-toggle/settings-slide-toggle.component';
import { A11yIntroPipe } from '@app/core/pipes/a11y-intro.pipe';
import {
  CurrentUserWithSettingsGql,
  DeleteUserGql,
  RequestUserPasswordSetupGql,
  UpdateUserMailAddressGql,
  UpdateUserPasswordGql,
  UpdateUserSettingsGql,
} from '@gql/generated/graphql';
import { toSignal } from '@angular/core/rxjs-interop';
import { AccountDeleted } from '@app/core/models/events/account-deleted';
import { EventService } from '@app/core/services/util/event.service';
import { PasswordEntryComponent } from '@app/core/components/password-entry/password-entry.component';
import { GlobalHintsService } from '@app/standalone/global-hints/global-hints.service';
import { GlobalHintType } from '@app/standalone/global-hints/global-hint';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ErrorClassification } from '@gql/helper/handle-operation-error';
import { CooldownService } from '@app/core/services/util/cooldown.service';
import { FormComponent } from '@app/standalone/form/form.component';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDivider } from '@angular/material/divider';
import { ApiConfig } from '@app/core/models/api-config';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    AutofocusDirective,
    FlexModule,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    LoadingIndicatorComponent,
    ExtensionPointComponent,
    HintComponent,
    MatButton,
    MatIcon,
    SettingsSlideToggleComponent,
    AsyncPipe,
    A11yIntroPipe,
    TranslocoPipe,
    PasswordEntryComponent,
    MatCard,
    MatFormField,
    FormsModule,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    MatDivider,
  ],
})
export class UserProfileComponent extends FormComponent {
  private authenticationService = inject(AuthenticationService);
  private translationService = inject(TranslocoService);
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);
  private router = inject(Router);
  private location = inject(Location);
  private eventService = inject(EventService);

  private currentUserGql = inject(CurrentUserWithSettingsGql);
  private deleteUser = inject(DeleteUserGql);
  private updateUserSettings = inject(UpdateUserSettingsGql);
  private updateUserMail = inject(UpdateUserMailAddressGql);
  private updateUserPassword = inject(UpdateUserPasswordGql);
  private requestUserPasswordSetup = inject(RequestUserPasswordSetupGql);
  private globalHintsService = inject(GlobalHintsService);
  private cooldownService = inject(CooldownService);

  private passwordForMailUpdate = viewChild.required<PasswordEntryComponent>(
    'passwordForMailUpdate'
  );
  // Not `required`: the field is absent while the account has no local password yet.
  private currentPasswordForUpdate = viewChild<PasswordEntryComponent>(
    'currentPasswordForUpdate'
  );
  private newPasswordForUpdate = viewChild.required<PasswordEntryComponent>(
    'newPasswordForUpdate'
  );
  private newMailAddress = viewChild.required<ElementRef>('newMailAddress');

  userResult = toSignal(
    this.currentUserGql
      .watch()
      .valueChanges.pipe(filter((r) => r.dataState === 'complete'))
  );

  user = computed(() => this.userResult()?.data.currentUser);

  isLoading = computed(() => this.userResult()?.loading);
  verified = computed(() => this.user()?.verified);
  localPasswordSet = computed(() => this.user()?.localPasswordSet ?? false);
  displayId = computed(() => this.user()?.displayId);
  mailAddress = linkedSignal(() => this.user()?.mailAddress);
  unverifiedMailAddress = linkedSignal(
    () => this.user()?.unverifiedMailAddress
  );
  contentVisualizationUnitPercent = linkedSignal(
    () => this.user()?.uiSettings?.contentVisualizationUnitPercent ?? true
  );
  contentAnswersDirectlyBelowChart = linkedSignal(
    () => this.user()?.uiSettings?.contentAnswersDirectlyBelowChart ?? false
  );
  showContentResultsDirectly = linkedSignal(
    () => this.user()?.uiSettings?.showContentResultsDirectly ?? false
  );
  rotateWordcloudItems = linkedSignal(
    () => this.user()?.uiSettings?.rotateWordcloudItems ?? true
  );

  // Route data inputs below
  accountSettingsName = input<string>();
  apiConfig = input<ApiConfig>();

  activeSettings = linkedSignal(() => this.accountSettingsName());
  localAccountsEnabled = computed(
    () =>
      this.apiConfig()?.authenticationProviders.some(
        (p) => p.id === 'user-db'
      ) ?? false
  );

  HintType = HintType;

  newMailAddressFormControl = new FormControl('', {
    validators: [Validators.required, Validators.email],
  });

  deleteAccount() {
    const dialogRef = this.dialogService.openDeleteDialog(
      'account',
      'dialog.really-delete-account',
      undefined,
      undefined,
      () => this.deleteUser.mutate()
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.authenticationService.logout();
        const msg = this.translationService.translate('header.account-deleted');

        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
        this.navToHome();
        const event = new AccountDeleted();
        this.eventService.broadcast(event.type);
      }
    });
  }

  navToHome() {
    this.router.navigate(['/']);
  }

  updateSettings() {
    const settings = {
      contentVisualizationUnitPercent: this.contentVisualizationUnitPercent(),
      contentAnswersDirectlyBelowChart: this.contentAnswersDirectlyBelowChart(),
      showContentResultsDirectly: this.showContentResultsDirectly(),
      rotateWordcloudItems: this.rotateWordcloudItems(),
    };
    this.updateUserSettings
      .mutate({
        variables: settings,
        update: (cache) => {
          const cacheId = cache.identify({
            __typename: 'User',
            id: this.user()?.id,
          });
          if (cacheId) {
            cache.modify({
              id: cacheId,
              fields: {
                uiSettings() {
                  return settings;
                },
              },
            });
          }
        },
      })
      .subscribe();
  }

  updatePage(page: string) {
    this.activeSettings.set(page);
    this.location.replaceState(`account/${page}`);
  }

  updateMailAddress(mailAddress: string) {
    if (this.newMailAddressFormControl.invalid) {
      const msg = this.translationService.translate(
        'user-profile.please-enter-valid-address'
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      this.newMailAddress().nativeElement.focus();
      return;
    }
    const password = this.passwordForMailUpdate().getPassword();
    if (!password) {
      const msg = this.translationService.translate(
        'user-profile.current-password-missing'
      );
      this.passwordForMailUpdate().passwordInput.nativeElement.focus();
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      return;
    }
    this.disableForm();
    this.updateUserMail
      .mutate({
        variables: {
          mailAddress,
          password,
        },
      })
      .subscribe({
        next: () => {
          this.enableForm();
          const msg = this.translationService.translate(
            'user-profile.verification-mail-has-been-sent'
          );
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.SUCCESS
          );
          this.newMailAddressFormControl.setValue('');
          this.newMailAddressFormControl.setErrors(null);
          this.newPasswordForUpdate().passwordFormControl.setErrors(null);
          this.passwordForMailUpdate().passwordFormControl.setValue('');
          this.unverifiedMailAddress.set(mailAddress);
          this.cooldownService.startResendCooldown();
          this.authenticationService.refetchCurrentUser();
          this.globalHintsService.addHint({
            id: 'verify-mail-update-hint',
            type: GlobalHintType.CUSTOM,
            icon: 'mail',
            message: 'user-profile.verify-new-mail-address',
            action: () => this.openVerifyDialog(mailAddress),
            actionLabel: 'user-activation.verify-mail',
            dismissible: true,
            translate: true,
          });
        },
        error: (e) => {
          this.enableForm();
          this.notificationService.showOnRequestClientError(e, {
            [ErrorClassification.BadRequest]: {
              message: this.translationService.translate(
                'user-profile.wrong-password'
              ),
              type: AdvancedSnackBarTypes.FAILED,
            },
          });
        },
      });
  }

  openVerifyDialog(mailAddress: string) {
    const dialogRef = this.dialogService.openUserActivationDialog(
      false,
      'user-profile.new-mail-address-has-been-verified'
    );
    dialogRef.afterClosed().subscribe((result?: { success: boolean }) => {
      if (result?.success) {
        this.globalHintsService.removeHint('verify-mail-update-hint');
        this.mailAddress.set(mailAddress);
        this.unverifiedMailAddress.set(undefined);
      }
    });
  }

  updatePassword() {
    if (this.localPasswordSet()) {
      this.changePassword();
    } else {
      this.requestPasswordSetup();
    }
  }

  private changePassword() {
    const currentPassword = this.currentPasswordForUpdate();
    const oldPassword = currentPassword?.getPassword();
    if (!currentPassword || !oldPassword) {
      const msg = this.translationService.translate(
        'user-profile.current-password-missing'
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      currentPassword?.passwordInput.nativeElement.focus();
      return;
    }
    const newPassword = this.newPasswordForUpdate().getPassword();
    if (!newPassword) {
      const msg = this.translationService.translate(
        'user-profile.please-check-password'
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      this.newPasswordForUpdate().passwordInput.nativeElement.focus();
      return;
    }
    this.disableForm();
    this.updateUserPassword
      .mutate({
        variables: {
          oldPassword,
          newPassword,
        },
      })
      .subscribe({
        next: () => {
          this.enableForm();
          currentPassword.passwordFormControl.setValue('');
          this.newPasswordForUpdate().passwordFormControl.setValue('');
          this.newPasswordForUpdate().passwordFormControl.setErrors(null);
          const msg = this.translationService.translate(
            'user-profile.password-changed'
          );
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.SUCCESS
          );
        },
        error: (e) => {
          this.enableForm();
          this.notificationService.showOnRequestClientError(e, {
            [ErrorClassification.BadRequest]: {
              message: this.translationService.translate(
                'user-profile.wrong-password'
              ),
              type: AdvancedSnackBarTypes.FAILED,
            },
          });
        },
      });
  }

  /**
   * Adds a local password to an account which was created through an external
   * authentication provider. The password itself is set on the password reset
   * page, using the verification code sent by this mutation.
   */
  private requestPasswordSetup() {
    this.disableForm();
    this.requestUserPasswordSetup.mutate().subscribe({
      complete: () => this.enableForm(),
      next: (r) => {
        if (r.data?.requestUserPasswordSetup) {
          const msg = this.translationService.translate(
            'user-profile.password-setup-mail-sent'
          );
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.SUCCESS
          );
          this.router.navigate(['password-reset', this.mailAddress()]);
        } else {
          const msg = this.translationService.translate(
            'password-reset.request-failed'
          );
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.FAILED
          );
        }
      },
      error: (e) => {
        this.enableForm();
        // The setup is refused for several distinct reasons which are of no use
        // to the user, so they all share one message.
        const failure = {
          message: this.translationService.translate(
            'password-reset.request-failed'
          ),
          type: AdvancedSnackBarTypes.FAILED,
        };
        this.notificationService.showOnRequestClientError(e, {
          [ErrorClassification.BadRequest]: failure,
          [ErrorClassification.Forbidden]: failure,
        });
      },
    });
  }
}
