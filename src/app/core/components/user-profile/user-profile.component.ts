import {
  Component,
  Input,
  computed,
  inject,
  linkedSignal,
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
import { SettingsPanelHeaderComponent } from '@app/standalone/settings-panel-header/settings-panel-header.component';
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
  UpdateUserSettingsGql,
} from '@gql/generated/graphql';
import { toSignal } from '@angular/core/rxjs-interop';
import { AccountDeleted } from '@app/core/models/events/account-deleted';
import { EventService } from '@app/core/services/util/event.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  imports: [
    AutofocusDirective,
    FlexModule,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    SettingsPanelHeaderComponent,
    LoadingIndicatorComponent,
    ExtensionPointComponent,
    HintComponent,
    MatButton,
    MatIcon,
    SettingsSlideToggleComponent,
    AsyncPipe,
    A11yIntroPipe,
    TranslocoPipe,
  ],
})
export class UserProfileComponent {
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

  userResult = toSignal(
    this.currentUserGql
      .watch()
      .valueChanges.pipe(filter((r) => r.dataState === 'complete'))
  );

  user = computed(() => this.userResult()?.data.currentUser);

  isLoading = computed(() => this.userResult()?.loading);
  verified = computed(() => this.user()?.verified);
  displayId = computed(() => this.user()?.displayId);
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

  // Route data input below
  @Input() accountSettingsName?: string;

  HintType = HintType;

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
    this.accountSettingsName = page;
    this.location.replaceState(`account/${this.accountSettingsName}`);
  }
}
