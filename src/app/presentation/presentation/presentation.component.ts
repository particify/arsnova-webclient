import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { TranslocoService } from '@ngneat/transloco';
import { RoutingFeature } from '@app/core/models/routing-feature.enum';
import { PresentationService } from '@app/core/services/util/presentation.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';

@Component({
  selector: 'app-presentation',
  templateUrl: './presentation.component.html',
})
export class PresentationComponent implements OnInit, OnDestroy {
  shortId: string;
  roomId: string;
  passwordProtected: boolean;
  lastGroup: string;
  featureString: string;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private globalStorageService: GlobalStorageService,
    private roomStatsService: RoomStatsService,
    private translateService: TranslocoService,
    private presentationService: PresentationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    document.body.style.background = 'var(--surface)';
    this.translateService.setActiveLang(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
    const params = this.route.snapshot.params;
    this.shortId = params['shortId'];
    const childRoute = this.route.snapshot?.firstChild?.firstChild;
    if (childRoute) {
      this.featureString = childRoute.url[0]?.path;
      this.lastGroup = childRoute.params['seriesName'];
    }
    this.route.data.subscribe((data) => {
      this.roomId = data.room.id;
      this.passwordProtected = data.room.passwordProtected;
      if (this.lastGroup === undefined) {
        this.lastGroup = this.globalStorageService.getItem(
          STORAGE_KEYS.LAST_GROUP
        );
        if (this.lastGroup === undefined) {
          this.roomStatsService
            .getStats(this.roomId, true)
            .subscribe((stats) => {
              if (stats.groupStats) {
                this.lastGroup = stats.groupStats[0].groupName;
                this.setGroupInSessionStorage(this.lastGroup);
              }
            });
        }
      }
      if (data.room.focusModeEnabled) {
        this.translateService
          .selectTranslate('creator.presentation.focus-mode-enabled-info')
          .subscribe((msg) => {
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.INFO
            );
          });
      }
    });
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
    const urlList = ['present', this.shortId];
    if (this.featureString) {
      urlList.push(this.featureString);
      if (isGroup) {
        const groupName = group || this.lastGroup;
        urlList.push(groupName);
      }
    }
    this.router.navigate(urlList);
  }

  setGroupInSessionStorage(group: string) {
    this.globalStorageService.setItem(STORAGE_KEYS.LAST_GROUP, group);
  }
}
