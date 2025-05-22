import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { RoutingFeature } from '@app/core/models/routing-feature.enum';
import { PresentationService } from '@app/core/services/util/presentation.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { take } from 'rxjs';
import { Room } from '@app/core/models/room';
import { UserRole } from '@app/core/models/user-roles.enum';
import { ControlBarComponent } from '@app/presentation/bars/control-bar/control-bar.component';
import { AutofocusDirective } from '@app/core/directives/autofocus.directive';
import { FlexModule } from '@angular/flex-layout';
import { MatIcon } from '@angular/material/icon';
import { RoomSettings } from '@app/core/models/room-settings';
import { RoomSettingsService } from '@app/core/services/http/room-settings.service';

@Component({
  selector: 'app-presentation',
  templateUrl: './presentation.component.html',
  styleUrl: './presentation.component.scss',
  imports: [
    ControlBarComponent,
    AutofocusDirective,
    FlexModule,
    RouterOutlet,
    MatIcon,
    TranslocoPipe,
  ],
})
export class PresentationComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private globalStorageService = inject(GlobalStorageService);
  private roomStatsService = inject(RoomStatsService);
  private translateService = inject(TranslocoService);
  private presentationService = inject(PresentationService);
  private notificationService = inject(NotificationService);
  private roomSettingsService = inject(RoomSettingsService);

  // Route data input below
  @Input({ required: true }) room!: Room;
  @Input({ required: true }) userRole!: UserRole;
  @Input({ required: true }) viewRole!: UserRole;
  lastGroup?: string;
  featureString?: string;

  roomSettings?: RoomSettings;

  constructor() {
    const childRoute = this.route.snapshot?.firstChild?.firstChild;
    if (childRoute) {
      this.featureString = childRoute.url[0]?.path;
      this.lastGroup = childRoute.params['seriesName'];
    }
  }

  ngOnInit(): void {
    this.roomSettingsService.getByRoomId(this.room.id).subscribe((settings) => {
      this.roomSettings = settings;
      if (this.roomSettings.focusModeEnabled) {
        this.translateService
          .selectTranslate(
            'presentation.focus-mode-enabled-info',
            undefined,
            'creator'
          )
          .pipe(take(1))
          .subscribe((msg) => {
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.INFO
            );
          });
      }
    });
    document.body.style.background = 'var(--surface)';
    this.translateService.setActiveLang(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
    if (this.lastGroup === undefined) {
      this.lastGroup = this.globalStorageService.getItem(
        STORAGE_KEYS.LAST_GROUP
      );
      if (this.lastGroup === undefined) {
        this.roomStatsService
          .getStats(this.room.id, true)
          .subscribe((stats) => {
            if (stats.groupStats) {
              this.lastGroup = stats.groupStats[0].groupName;
              if (this.lastGroup) {
                this.setGroupInSessionStorage(this.lastGroup);
              }
            }
          });
      }
    }
  }

  ngOnDestroy(): void {
    this.globalStorageService.removeItem(STORAGE_KEYS.LAST_INDEX);
  }

  updateFeature(feature: string) {
    this.featureString = feature;
    this.updateUrl();
  }

  updateUrl(group?: string) {
    const isGroup = this.featureString === RoutingFeature.CONTENTS;
    if (group) {
      this.lastGroup = group;
      this.presentationService.updateCurrentGroup(group);
      this.globalStorageService.removeItem(STORAGE_KEYS.LAST_INDEX);
    }
    const urlList = ['present', this.room.shortId];
    if (this.featureString) {
      urlList.push(this.featureString);
      if (isGroup) {
        const groupName = group || this.lastGroup;
        if (groupName) {
          urlList.push(groupName);
        }
      }
    }
    this.router.navigate(urlList);
  }

  setGroupInSessionStorage(group: string) {
    this.globalStorageService.setItem(STORAGE_KEYS.LAST_GROUP, group);
  }
}
