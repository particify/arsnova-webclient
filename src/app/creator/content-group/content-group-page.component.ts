import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthProvider } from '@app/core/models/auth-provider';
import { Content } from '@app/core/models/content';
import {
  ContentGroup,
  GroupType,
  PublishingMode,
} from '@app/core/models/content-group';
import { ContentGroupStatistics } from '@app/core/models/content-group-statistics';
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
import { ContentGroupSettingsComponent } from '@app/standalone/content-group-settings/content-group-settings.component';
import { TranslocoService } from '@ngneat/transloco';
import { Observable, Subject, mergeMap, of, takeUntil } from 'rxjs';

export interface ContentStats {
  count: number;
  correct?: number;
}

@Component({
  selector: 'app-content-group-page',
  templateUrl: './content-group-page.component.html',
  styleUrls: ['./content-group-page.component.scss'],
})
export class ContentGroupPageComponent implements OnInit, OnDestroy {
  destroyed$ = new Subject<void>();

  isLoading = true;

  room: Room;
  // TODO: non-null assertion operator is used here temporaly. We need to use a resolver here to move async logic out of component.
  contentGroup!: ContentGroup;
  contents: Content[] = [];
  contentGroupStats: ContentGroupStatistics[] = [];
  isModerator = false;
  isGuest = true;

  onInit = false;

  attributionsExist = false;

  GroupType = GroupType;

  contentStats = new Map<string, ContentStats>();
  totalCorrect?: number;
  status = {
    good: 85,
    okay: 50,
    zero: 0,
    empty: -1,
  };

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
    private routingService: RoutingService,
    private authService: AuthenticationService
  ) {
    this.isModerator = route.snapshot.data.userRole === UserRole.MODERATOR;
    this.room = route.snapshot.data.room;
    route.params.subscribe((params) => {
      const groupName = params['seriesName'];
      if (this.contentGroup?.name !== groupName)
        this.setContentGroup(groupName);
    });
  }

  ngOnInit(): void {
    this.onInit = true;
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
    if (!this.contentGroup || groupName !== this.contentGroup.name) {
      this.globalStorageService.setItem(STORAGE_KEYS.LAST_GROUP, groupName);
      this.reloadContentGroup(groupName);
    }
  }

  reloadContentGroup(groupName: string, imported = false) {
    this.isLoading = true;
    this.totalCorrect = undefined;
    this.contentGroupService
      .getByRoomIdAndName(this.room.id, groupName, true)
      .subscribe((group) => {
        this.contentGroup = { ...group };
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
              this.loadStats();
            });
          this.contentGroupService
            .getAttributions(this.room.id, this.contentGroup.id)
            .pipe(takeUntil(this.destroyed$))
            .subscribe((attributions) => {
              this.attributionsExist = attributions.some(
                (a) => a.license !== 'CC0-1.0'
              );
            });
        } else {
          this.contents = [];
          this.isLoading = false;
        }
      });
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

  updateContentGroup(changes: object): Observable<ContentGroup> {
    return this.contentGroupService.patchContentGroup(
      this.contentGroup,
      changes
    );
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
        this.reloadContentGroup(this.contentGroup.name, true);
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
          if (this.contentGroup.publishingMode === PublishingMode.LIVE) {
            this.updateContentGroup({ publishingIndex: 0 }).subscribe(
              (contentGroup) => {
                this.contentGroup.publishingIndex =
                  contentGroup.publishingIndex;
              }
            );
          }
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

  publishContentGroup(): void {
    const changes = { published: true };
    this.updateContentGroup(changes).subscribe((updatedContentGroup) => {
      this.contentGroup = updatedContentGroup;
      const msg = this.translateService.translate(
        'creator.content.group-published'
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
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

  openSettings(): void {
    const dialogRef = this.dialogService.openDialog(
      ContentGroupSettingsComponent,
      {
        width: '600px',
        data: {
          contentGroup: { ...this.contentGroup },
          groupNames: this.contentGroupStats.map((s) => s.groupName),
        },
      }
    );
    dialogRef.afterClosed().subscribe((contentGroup) => {
      if (contentGroup) {
        const msg = this.translateService.translate(
          'creator.content.changes-made'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.SUCCESS
        );
        if (this.contentGroup.name !== contentGroup.name) {
          this.contentGroupService.updateGroupInMemoryStorage(
            this.contentGroup.name,
            contentGroup.name
          );
          const groupStats = this.contentGroupStats.find(
            (s) => s.id === this.contentGroup.id
          );
          if (groupStats) {
            groupStats.groupName = contentGroup.name;
          }
          this.router.navigate(['..', contentGroup.name], {
            relativeTo: this.route,
          });
        }
        this.contentGroup = { ...contentGroup };
      }
    });
  }

  loadStats(): void {
    this.contentGroupService
      .getAnswerStatistics(
        this.contentGroup.roomId,
        this.contentGroup.id,
        this.contents
      )
      .subscribe((stats) => {
        this.contentStats = stats;
        let correct = 0;
        let total = 0;
        Array.from(this.contentStats.values()).forEach((stats) => {
          if (stats.correct !== undefined) {
            correct += stats.correct;
            total++;
          }
        });
        if (correct) {
          this.totalCorrect = correct / total;
        }
      });
  }
}
