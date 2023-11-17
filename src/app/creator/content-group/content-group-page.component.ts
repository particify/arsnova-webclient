import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthProvider } from '@app/core/models/auth-provider';
import { Content } from '@app/core/models/content';
import { ContentGroup } from '@app/core/models/content-group';
import { ContentGroupStatistics } from '@app/core/models/content-group-statistics';
import { ContentLicenseAttribution } from '@app/core/models/content-license-attribution';
import { Room } from '@app/core/models/room';
import { UserRole } from '@app/core/models/user-roles.enum';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ContentService } from '@app/core/services/http/content.service';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { LocalFileService } from '@app/core/services/util/local-file.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { PublishContentGroupTemplateComponent } from '@app/creator/content-group/_dialogs/publish-content-group-template/publish-content-group-template.component';
import { TranslocoService } from '@ngneat/transloco';
import { ExtensionFactory } from '@projects/extension-point/src/public-api';
import { Observable, Subject, mergeMap, of, takeUntil } from 'rxjs';

@Component({
  selector: 'app-content-group-page',
  templateUrl: './content-group-page.component.html',
  styleUrls: ['./content-group-page.component.scss'],
})
export class ContentGroupPageComponent implements OnInit, OnDestroy {
  destroyed$ = new Subject<void>();

  isLoading = true;

  room: Room;
  contentGroup: ContentGroup;
  contents: Content[] = [];
  contentGroupStats: ContentGroupStatistics[] = [];
  groupName: string;
  published = false;
  statisticsPublished = true;
  correctOptionsPublished = true;
  isModerator = false;
  isInSortingMode = false;
  copiedContents: Content[] = [];
  hasSeriesExportExtension = false;
  isGuest = true;

  onInit = false;

  attributionsExist = false;

  constructor(
    private route: ActivatedRoute,
    private contentService: ContentService,
    private notificationService: NotificationService,
    private translateService: TranslocoService,
    private globalStorageService: GlobalStorageService,
    private contentGroupService: ContentGroupService,
    private router: Router,
    private roomStatsService: RoomStatsService,
    private localFileService: LocalFileService,
    private dialogService: DialogService,
    private extensionFactory: ExtensionFactory,
    private routingService: RoutingService,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.onInit = true;
    this.route.data.subscribe((data) => {
      this.isModerator = data.userRole === UserRole.MODERATOR;
      this.room = data.room;
      this.route.params.subscribe((params) => {
        this.setContentGroup(params['seriesName']);
      });
    });
    this.hasSeriesExportExtension = !!this.extensionFactory.getExtension(
      'series-results-export'
    );
    this.authService
      .getCurrentAuthentication()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((auth) => {
        this.isGuest = auth.authProvider === AuthProvider.ARSNOVA_GUEST;
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  setContentGroup(groupName: string) {
    if (groupName !== this.groupName) {
      this.groupName = groupName;
      this.globalStorageService.setItem(
        STORAGE_KEYS.LAST_GROUP,
        this.groupName
      );
      this.reloadContentGroup();
    }
  }

  reloadContentGroup(imported = false) {
    this.isLoading = true;
    this.contentGroupService
      .getByRoomIdAndName(this.room.id, this.groupName, true)
      .subscribe((group) => {
        this.contentGroup = group;
        this.setSettings();
        this.getGroups();
        if (this.contentGroup.contentIds) {
          this.contentService
            .getContentsByIds(
              this.contentGroup.roomId,
              this.contentGroup.contentIds,
              true
            )
            .subscribe((contents) => {
              this.contents = contents;
              if (imported) {
                const msg = this.translateService.translate(
                  'creator.content.import-successful'
                );
                this.notificationService.showAdvanced(
                  msg,
                  AdvancedSnackBarTypes.SUCCESS
                );
              }
              this.isLoading = false;
            });
          this.contentGroupService
            .getAttributions(this.room.id, this.contentGroup.id)
            .pipe(takeUntil(this.destroyed$))
            .subscribe((attributions) => {
              this.attributionsExist = attributions.length > 0;
            });
        } else {
          this.isLoading = false;
        }
      });
  }

  setSettings() {
    this.published = this.contentGroup.published;
    this.statisticsPublished = this.contentGroup.statisticsPublished;
    this.correctOptionsPublished = this.contentGroup.correctOptionsPublished;
  }

  getGroups(): void {
    this.roomStatsService
      .getStats(this.room.id, true)
      .subscribe((roomStats) => {
        if (roomStats.groupStats) {
          this.contentGroupStats = roomStats.groupStats;
        }
      });
  }

  updateURL(): void {
    this.router.navigate([
      this.routingService.getRoleRoute(UserRole.EDITOR),
      this.room.shortId,
      'series',
      this.groupName,
    ]);
  }

  updateContentGroup(changes: object): Observable<ContentGroup> {
    return this.contentGroupService.patchContentGroup(
      this.contentGroup,
      changes
    );
  }

  updateName(name: string) {
    const changes: { name: string } = { name: name };
    this.updateContentGroup(changes).subscribe((updatedGroup) => {
      this.contentGroup = updatedGroup;
      this.contentGroupService.updateGroupInMemoryStorage(this.groupName, name);
      this.groupName = this.contentGroup.name;
      const groupStats = this.contentGroupStats.find(
        (s) => s.id === this.contentGroup.id
      );
      if (groupStats) {
        groupStats.groupName = this.groupName;
      }
      const msg = this.translateService.translate(
        'creator.content.updated-content-group'
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
      this.updateURL();
    });
  }

  goInSortingMode(): void {
    this.copiedContents = [...this.contents];
    this.isInSortingMode = true;
  }

  saveSorting(): void {
    const newContentIdOrder = this.copiedContents.map((c) => c.id);
    if (this.contentGroup.contentIds !== newContentIdOrder) {
      const changes: {
        contentIds: string[];
        firstPublishedIndex: number;
        lastPublishedIndex: number;
      } = {
        contentIds: newContentIdOrder,
        firstPublishedIndex: this.contentGroup.firstPublishedIndex,
        lastPublishedIndex: this.contentGroup.lastPublishedIndex,
      };
      this.updateContentGroup(changes).subscribe((updatedContentGroup) => {
        this.contentGroup = updatedContentGroup;
        this.contents = this.copiedContents;
        const msg = this.translateService.translate(
          'creator.content.updated-sorting'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.SUCCESS
        );
        this.leaveSortingMode();
      });
    }
  }

  leaveSortingMode(): void {
    this.isInSortingMode = false;
  }

  toggleStatisticsPublished() {
    const changes: { statisticsPublished: boolean } = {
      statisticsPublished: !this.contentGroup.statisticsPublished,
    };
    this.updateContentGroup(changes).subscribe((updatedContentGroup) => {
      this.contentGroup = updatedContentGroup;
      this.statisticsPublished = this.contentGroup.statisticsPublished;
    });
  }

  toggleCorrectOptionsPublished() {
    const changes: { correctOptionsPublished: boolean } = {
      correctOptionsPublished: !this.contentGroup.correctOptionsPublished,
    };
    this.updateContentGroup(changes).subscribe((updatedContentGroup) => {
      this.contentGroup = updatedContentGroup;
      this.correctOptionsPublished = this.contentGroup.correctOptionsPublished;
    });
  }

  generateExportFilename(extension: string): string {
    const name = this.localFileService.generateFilename(
      [this.contentGroup.name, this.room.shortId],
      true
    );
    return `${name}.${extension}`;
  }

  exportToCsv() {
    const dialogRef = this.dialogService.openExportDialog();
    dialogRef.afterClosed().subscribe((options) => {
      if (!this.contentGroup.contentIds) {
        return;
      }
      if (options) {
        const blob$ = this.contentService.export(
          options.exportType,
          this.room.id,
          this.contentGroup.contentIds,
          options.charset
        );
        this.localFileService.download(
          blob$,
          this.generateExportFilename('csv')
        );
      }
    });
  }

  importFromCsv() {
    const blob$ = this.localFileService.upload([
      'text/csv',
      'text/tab-separated-values',
    ]);
    blob$
      .pipe(
        mergeMap((blob) => {
          if (!blob) {
            return of();
          }
          return this.contentGroupService.import(
            this.room.id,
            this.contentGroup.id,
            blob
          );
        })
      )
      .subscribe(() => {
        this.reloadContentGroup(true);
      });
  }

  deleteAllAnswers() {
    this.contentService
      .showDeleteAllAnswersDialog(this.contentGroup)
      .subscribe((result) => {
        if (result) {
          const msg = this.translateService.translate(
            'creator.content.all-answers-deleted'
          );
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.WARNING
          );
        }
      });
  }

  deleteGroup() {
    const dialogRef = this.dialogService.openDeleteDialog(
      'content-group',
      'creator.dialog.really-delete-content-group',
      this.contentGroup.name,
      undefined,
      () => this.contentGroupService.delete(this.contentGroup)
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.routingService.goBack();
        this.globalStorageService.removeItem(STORAGE_KEYS.LAST_GROUP);
        const msg = this.translateService.translate(
          'creator.content.content-group-deleted'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
      }
    });
  }

  publishContents() {
    const changes: { published: boolean } = {
      published: !this.contentGroup.published,
    };
    this.updateContentGroup(changes).subscribe((updatedContentGroup) => {
      this.contentGroup = updatedContentGroup;
      this.published = this.contentGroup.published;
    });
  }

  publishAsTemplate() {
    this.dialogService.openDialog(PublishContentGroupTemplateComponent, {
      width: '600px',
      data: {
        name: this.contentGroup.name,
        contentGroupId: this.contentGroup.id,
      },
    });
  }
}
