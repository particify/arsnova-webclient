import { BreakpointObserver } from '@angular/cdk/layout';
import {
  Component,
  DestroyRef,
  Input,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
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
import { CreateContentGroupTemplateComponent } from '@app/creator/content-group/_dialogs/create-content-group-template/create-content-group-template.component';
import { ContentGroupSettingsComponent } from '@app/standalone/content-group-settings/content-group-settings.component';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import {
  Observable,
  Subject,
  mergeMap,
  of,
  takeUntil,
  takeWhile,
  take,
  timer,
  filter,
} from 'rxjs';
import { ContentGroupPageService } from './content-group-page.service';
import { FlexModule } from '@angular/flex-layout';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import { HotkeyDirective } from '@app/core/directives/hotkey.directive';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { NgClass } from '@angular/common';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { ExtensionPointComponent } from '@projects/extension-point/src/lib/extension-point.component';
import { TrackInteractionDirective } from '@app/core/directives/track-interaction.directive';
import { FeatureFlagDirective } from '@app/core/directives/feature-flag.directive';
import { MatDivider } from '@angular/material/divider';
import { ContentGroupInfoComponent } from '@app/standalone/content-group-info/content-group-info.component';
import { MatProgressBar } from '@angular/material/progress-bar';
import { ContentListComponent } from './content-list/content-list.component';
import { MatCard } from '@angular/material/card';
import { BackButtonComponent } from '@app/standalone/back-button/back-button.component';

const STATS_REFRESH_INTERVAL = 10000;
const STATS_REFRESH_LIMIT = 60;

const STATUS_OKAY = 50;
const STATUS_BETTER = 62.5;
const STATUS_GOOD = 75;
const STATUS_EXCELLENT = 87.5;

export interface ContentStats {
  count: number;
  correct?: number;
  abstentions?: number;
}

@Component({
  selector: 'app-content-group-page',
  templateUrl: './content-group-page.component.html',
  styleUrls: ['./content-group-page.component.scss'],
  imports: [
    FlexModule,
    LoadingIndicatorComponent,
    MatButton,
    HotkeyDirective,
    RouterLink,
    MatIcon,
    MatIconButton,
    MatTooltip,
    NgClass,
    ExtendedModule,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    ExtensionPointComponent,
    TrackInteractionDirective,
    FeatureFlagDirective,
    MatDivider,
    ContentGroupInfoComponent,
    MatProgressBar,
    ContentListComponent,
    MatCard,
    RouterOutlet,
    BackButtonComponent,
    TranslocoPipe,
  ],
})
export class ContentGroupPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private contentService = inject(ContentService);
  private notificationService = inject(NotificationService);
  private translateService = inject(TranslocoService);
  private globalStorageService = inject(GlobalStorageService);
  private contentGroupService = inject(ContentGroupService);
  router = inject(Router);
  private roomStatsService = inject(RoomStatsService);
  private localFileService = inject(LocalFileService);
  private dialogService = inject(DialogService);
  private routingService = inject(RoutingService);
  private authService = inject(AuthenticationService);
  private destroyRef = inject(DestroyRef);
  private breakpointObserver = inject(BreakpointObserver);
  private contentGroupPageService = inject(ContentGroupPageService);

  // Route data input below
  @Input({ required: true }) userRole!: UserRole;
  @Input({ required: true }) room!: Room;
  @Input({ required: true }) seriesName!: string;
  destroyed$ = new Subject<void>();

  isLoading = true;

  // TODO: non-null assertion operator is used here temporaly. We need to use a resolver here to move async logic out of component.
  contentGroup!: ContentGroup;
  contents: Content[] = [];
  contentGroupStats: ContentGroupStatistics[] = [];
  isGuest = true;

  attributionsExist = false;

  GroupType = GroupType;

  contentStats = new Map<string, ContentStats>();
  totalCorrect?: number;
  totalAbstentions?: number;

  isContentStarted = false;

  showLeaderboard = false;
  creationMode = false;
  editMode = false;
  selectedContentIndex?: number;
  isDesktop?: boolean;
  childActive = false;

  constructor() {
    const route = this.route;
    const router = this.router;
    const breakpointObserver = this.breakpointObserver;

    route.params.subscribe((params) => {
      const groupName = params['seriesName'];
      if (this.contentGroup && this.contentGroup.name !== groupName) {
        this.selectedContentIndex = undefined;
        this.setContentGroup(groupName);
      }
    });
    router.events
      .pipe(
        takeUntil(this.destroyed$),
        filter((event) => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        this.determinateRouteState();
        this.navigateToFirstContent();
      });
    breakpointObserver.observe(['(min-width: 1000px)']).subscribe((changes) => {
      const temp = this.isDesktop;
      this.isDesktop = changes.matches;
      if (temp !== undefined && temp !== changes.matches) {
        this.determinateRouteState();
        this.navigateToFirstContent();
        if (this.contents.length === 0 && this.isDesktop) {
          this.openCreation();
        }
      }
    });
  }

  ngOnInit(): void {
    this.setContentGroup();
    this.authService
      .getCurrentAuthentication()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((auth) => {
        this.isGuest = auth.authProvider === AuthProvider.ARSNOVA_GUEST;
      });
    this.contentGroupPageService
      .getCreatedContent()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((content) => {
        this.addContentToList(content);
      });
    this.contentGroupPageService
      .getEditedContent()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((content) => {
        this.editContent(content);
        this.router.navigate(['.'], { relativeTo: this.route });
      });
    this.contentService
      .getAnswerCounts()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((counts) => {
        this.reloadStats(counts.answers);
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private determinateRouteState() {
    const child = this.route.firstChild;
    const childPath = child?.snapshot.routeConfig?.path;
    this.showLeaderboard = childPath === 'leaderboard';
    this.creationMode = childPath === 'create';
    this.editMode = !!childPath?.includes('edit');
    if (childPath === 'attributions' && this.isDesktop) {
      this.selectedContentIndex = -1;
    }
    this.childActive = !!child;
    this.evaluateRouteStateChild(child, childPath);
  }

  private evaluateRouteStateChild(
    route: ActivatedRoute | null,
    path: string | undefined
  ) {
    if (!route) {
      if (this.selectedContentIndex !== undefined && this.isDesktop) {
        this.router.navigate([this.selectedContentIndex + 1], {
          relativeTo: this.route,
          replaceUrl: true,
        });
      }
      return;
    }
    if (path) {
      const contentIndex = route.snapshot.params.contentIndex;
      if (contentIndex !== undefined) {
        this.selectedContentIndex = Number(contentIndex) - 1;
        return;
      }
      const contentId = route.snapshot.params.contentId;
      if (contentId) {
        this.editMode = true;
        const index = this.contents.map((c) => c.id).indexOf(contentId);
        if (index !== undefined) {
          this.selectedContentIndex = index;
        }
      }
    }
  }

  private navigateToFirstContent() {
    if (
      this.isDesktop &&
      this.selectedContentIndex === undefined &&
      !this.showLeaderboard &&
      !this.creationMode &&
      !this.editMode &&
      this.contents.length > 0
    ) {
      this.router.navigate([1], { relativeTo: this.route, replaceUrl: true });
    }
  }

  setContentGroup(groupName = this.seriesName) {
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
              this.determinateRouteState();
              this.navigateToFirstContent();
            });
          this.contentGroupService
            .getAttributions(this.room.id, this.contentGroup.id)
            .pipe(takeUntil(this.destroyed$))
            .subscribe((attributions) => {
              this.attributionsExist = attributions.length > 0;
            });
        } else {
          this.contents = [];
          if (this.isDesktop) {
            this.openCreation();
          }
          this.determinateRouteState();
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
            'creator.content.results-have-been-reset'
          );
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.WARNING
          );
          this.totalCorrect = 0;
          if (this.isLiveMode()) {
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
        this.router.navigate([
          this.routingService.getRoleRoute(),
          this.room.shortId,
        ]);
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

  createTemplate() {
    this.dialogService.openDialog(CreateContentGroupTemplateComponent, {
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
          alreadyAnswered:
            Array.from(this.contentStats.values()).filter(
              (stats) => stats.count > 0
            ).length > 0,
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
        let abstentions = 0;
        Array.from(this.contentStats.values()).forEach((stats) => {
          if (stats.correct !== undefined) {
            correct += stats.correct;
            total++;
            abstentions += stats.abstentions ?? 0;
          }
        });
        if (correct) {
          this.totalCorrect = Math.round(correct / total);
          this.totalAbstentions = Math.round(
            (abstentions / (total + abstentions)) * 100
          );
        }
      });
  }

  reloadStats(counts: number) {
    if (this.selectedContentIndex !== undefined) {
      const currentStats = this.contentStats.get(
        this.contents[this.selectedContentIndex].id
      );
      if (counts !== currentStats?.count) {
        this.loadStats();
      }
    }
  }

  handleActiveContentChanged(index?: number): void {
    this.isContentStarted = index !== undefined;
    if (this.isContentStarted) {
      this.startRefreshingStats();
      if (this.selectedContentIndex !== index && !this.childActive) {
        this.router.navigate(['.', index! + 1], { relativeTo: this.route });
      }
    }
  }

  startRefreshingStats(): void {
    timer(0, STATS_REFRESH_INTERVAL)
      .pipe(
        take(STATS_REFRESH_LIMIT),
        takeWhile(() => this.isContentStarted),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.loadStats();
      });
  }

  isLiveMode(): boolean {
    return this.contentGroup.publishingMode === PublishingMode.LIVE;
  }

  getProgressColor(): string {
    if (!this.totalCorrect) {
      return '';
    } else {
      if (this.totalCorrect < STATUS_OKAY) {
        return 'red';
      } else if (this.totalCorrect < STATUS_BETTER) {
        return 'orange';
      } else if (this.totalCorrect < STATUS_GOOD) {
        return 'yellow';
      } else if (this.totalCorrect < STATUS_EXCELLENT) {
        return 'green';
      } else {
        return 'blue';
      }
    }
  }

  isModerator(): boolean {
    return this.userRole === UserRole.MODERATOR;
  }

  toggleLeaderboard() {
    const url = ['.'];
    if (this.showLeaderboard) {
      if (
        this.selectedContentIndex !== undefined &&
        this.selectedContentIndex > -1
      ) {
        url.push((this.selectedContentIndex + 1).toString());
      }
    } else {
      url.push('leaderboard');
    }
    this.router.navigate(url, {
      relativeTo: this.route,
    });
    this.showLeaderboard = !this.showLeaderboard;
  }

  private addContentToList(content: Content) {
    this.contents.push(content);
    if (this.contentGroup.contentIds) {
      this.contentGroup.contentIds.push(content.id);
    } else {
      this.contentGroup.contentIds = [content.id];
    }
    this.contentStats.set(content.id, { count: 0 });
  }

  private editContent(content: Content) {
    const index = this.contents.map((c) => c.id).indexOf(content.id);
    if (index !== undefined) {
      this.contents[index] = content;
    }
  }

  private openCreation() {
    this.router.navigate(['create'], {
      relativeTo: this.route,
      replaceUrl: true,
    });
  }
}
