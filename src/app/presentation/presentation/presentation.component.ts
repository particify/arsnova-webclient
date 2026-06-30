import {
  Component,
  OnDestroy,
  inject,
  input,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { RoutingFeature } from '@app/core/models/routing-feature.enum';
import { PresentationService } from '@app/core/services/util/presentation.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { Room } from '@app/core/models/room';
import { UserRole } from '@app/core/models/user-roles.enum';
import { ControlBarComponent } from '@app/presentation/bars/control-bar/control-bar.component';
import { AutofocusDirective } from '@app/core/directives/autofocus.directive';
import { FlexModule } from '@angular/flex-layout';
import { MatIcon } from '@angular/material/icon';
import { RoomSettingsService } from '@app/core/services/http/room-settings.service';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { first, switchMap } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-presentation',
  templateUrl: './presentation.component.html',
  styleUrl: './presentation.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    ControlBarComponent,
    AutofocusDirective,
    FlexModule,
    RouterOutlet,
    MatIcon,
    TranslocoPipe,
  ],
})
export class PresentationComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly globalStorageService = inject(GlobalStorageService);
  private readonly translateService = inject(TranslocoService);
  private readonly presentationService = inject(PresentationService);
  private readonly notificationService = inject(NotificationService);
  private readonly roomSettingsService = inject(RoomSettingsService);
  private readonly focusModeService = inject(FocusModeService);

  // Route data input below
  roomId = input.required<string>();
  room = input.required<Room>();
  userRole = input.required<UserRole>();
  viewRole = input.required<UserRole>();
  activeQuestionnaireId = signal<string | undefined>(undefined);
  featureString?: string;

  roomSettings = toSignal(
    toObservable(this.room).pipe(
      switchMap((r) => this.roomSettingsService.getByRoomId(r.id))
    )
  );

  constructor() {
    const childRoute = this.route.snapshot?.firstChild?.firstChild;
    if (childRoute) {
      this.featureString = childRoute.url[0]?.path;
      this.activeQuestionnaireId.set(childRoute.params.questionnaireId);
    }
    this.focusModeService
      .getFocusModeEnabled()
      .pipe(first())
      .subscribe((focusModeEnabled) => {
        if (focusModeEnabled) {
          const msg = this.translateService.translate(
            'creator.presentation.focus-mode-enabled-info'
          );
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.INFO
          );
        }
      });
    document.body.style.background = 'var(--surface)';
  }

  ngOnDestroy(): void {
    this.globalStorageService.removeItem(STORAGE_KEYS.LAST_INDEX);
  }

  updateFeature(feature?: string) {
    this.featureString = feature;
    this.updateUrl();
  }

  updateUrl(questionnaireId?: string) {
    const isGroup = this.featureString === RoutingFeature.CONTENTS;
    if (questionnaireId) {
      if (questionnaireId === this.activeQuestionnaireId()) {
        return;
      }
      this.activeQuestionnaireId.set(questionnaireId);
      this.presentationService.updateCurrentGroup(questionnaireId);
      this.globalStorageService.removeItem(STORAGE_KEYS.LAST_INDEX);
    }
    const urlList = ['present', this.room().shortId];
    if (this.featureString) {
      urlList.push(this.featureString);
      if (isGroup) {
        questionnaireId = questionnaireId || this.activeQuestionnaireId();
        if (questionnaireId) {
          urlList.push(questionnaireId);
        }
      }
    }
    this.router.navigate(urlList);
  }

  setGroupInSessionStorage(group: string) {
    this.globalStorageService.setItem(STORAGE_KEYS.LAST_GROUP, group);
  }
}
