import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Content } from '@app/core/models/content';
import { ContentService } from '@app/core/services/http/content.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ContentGroup } from '@app/core/models/content-group';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { EventService } from '@app/core/services/util/event.service';
import { LocalFileService } from '@app/core/services/util/local-file.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Observable, Subject, Subscription } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { MatButton } from '@angular/material/button';
import { ContentType } from '@app/core/models/content-type.enum';
import { RoutingService } from '@app/core/services/util/routing.service';
import { Room } from '@app/core/models/room';
import { ContentGroupStatistics } from '@app/core/models/content-group-statistics';
import { MarkdownFeatureset } from '@app/core/services/http/formatting.service';
import { DragDropBaseComponent } from '@app/shared/drag-drop-base/drag-drop-base.component';
import { UserRole } from '@app/core/models/user-roles.enum';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { ExtensionFactory } from '@projects/extension-point/src/public-api';

@Component({
  selector: 'app-group-content',
  templateUrl: './group-content.component.html',
  styleUrls: ['./group-content.component.scss'],
})
export class GroupContentComponent
  extends DragDropBaseComponent
  implements OnInit, OnDestroy
{
  destroyed$ = new Subject<void>();

  @ViewChild('nameInput') nameInput: ElementRef;
  @ViewChildren('lockMenu') lockMenus: QueryList<MatButton>;

  room: Room;
  contents: Content[];
  contentGroupStats: ContentGroupStatistics[] = [];
  contentGroup: ContentGroup;
  currentGroupIndex: number;
  contentTypes: string[] = Object.values(ContentType);
  deviceWidth = innerWidth;
  isLoading = true;

  groupName: string;
  isInTitleEditMode = false;
  inputFocus = false;
  isInSortingMode = false;
  updatedName: string;
  baseURL = 'edit';
  published = false;
  statisticsPublished = true;
  correctOptionsPublished = true;
  firstPublishedIndex = 0;
  lastPublishedIndex = -1;
  lastPublishedIndexBackup = -1;
  firstPublishedIndexBackup = -1;
  copiedContents = [];
  activeMenuIndex: number;
  activeContentId: string;
  contentHotkeysRegistered = false;
  markdownFeatureset = MarkdownFeatureset.MINIMUM;

  private hotkeyRefs: symbol[] = [];

  ContentType: typeof ContentType = ContentType;
  resetAnswerEvent: Subject<string> = new Subject<string>();

  iconList: Map<ContentType, string>;

  onInit = false;

  isModerator = false;

  hasSeriesExportExtension = false;

  constructor(
    protected contentService: ContentService,
    protected roomStatsService: RoomStatsService,
    protected route: ActivatedRoute,
    protected notificationService: NotificationService,
    protected translateService: TranslateService,
    protected dialogService: DialogService,
    protected globalStorageService: GlobalStorageService,
    protected contentGroupService: ContentGroupService,
    protected announceService: AnnounceService,
    public eventService: EventService,
    protected localFileService: LocalFileService,
    protected router: Router,
    private hotkeyService: HotkeyService,
    private routingService: RoutingService,
    private contentPublishService: ContentPublishService,
    private extensionFactory: ExtensionFactory
  ) {
    super();
  }

  ngOnInit() {
    // this.roomService.getCurrentRoomStream().pipe(takeUntil(this.destroyed$)).subscribe(room => {
    //   this.navBarExists = !room?.focusModeEnabled;
    // })
    this.onInit = true;
    this.iconList = this.contentService.getTypeIcons();
    this.route.data.subscribe((data) => {
      this.isModerator = data.userRole === UserRole.MODERATOR;
      this.room = data.room;
      this.route.params.subscribe((params) => {
        this.setContentGroup(params['seriesName']);
      });
    });
    this.translateService.use(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
    this.contentService.getAnswersDeleted().subscribe((contentId) => {
      if (contentId) {
        const content = this.contents.find((c) => c.id === contentId);
        if (content) {
          content.state.round = 1;
          this.resetAnswerEvent.next(content.id);
        }
      }
    });
    this.hasSeriesExportExtension = !!this.extensionFactory.getExtension(
      'series-results-export'
    );
  }

  ngOnDestroy() {
    this.unregisterHotkeys();
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

  registerHotkeys() {
    this.translateService
      .get('control-bar.publish-or-lock-content')
      .subscribe((t) =>
        this.hotkeyService.registerHotkey(
          {
            key: 'l',
            action: () => {
              const activeIndex = this.contents
                .map((c) => c.id)
                .indexOf(this.activeContentId);
              this.lockMenus.toArray()[activeIndex].focus();
            },
            actionTitle: t,
          },
          this.hotkeyRefs
        )
      );
  }

  unregisterHotkeys() {
    this.hotkeyRefs.forEach((h) => this.hotkeyService.unregisterHotkey(h));
  }

  getGroups(): void {
    this.roomStatsService
      .getStats(this.room.id, true)
      .subscribe((roomStats) => {
        if (roomStats.groupStats) {
          this.contentGroupStats = roomStats.groupStats;
          this.getCurrentGroupIndex();
        }
      });
  }

  getCurrentGroupIndex() {
    if (
      this.contentGroupStats &&
      this.contentGroup &&
      this.contentGroupStats.length > 0
    ) {
      for (let i = 0; i < this.contentGroupStats.length; i++) {
        if (this.contentGroupStats[i].groupName === this.contentGroup.name) {
          this.currentGroupIndex = i;
        }
      }
    }
  }

  findIndexOfId(id: string): number {
    return this.contents.map((c) => c.id).indexOf(id);
  }

  deleteContent(delContent: Content) {
    const index = this.findIndexOfId(delContent.id);
    const dialogRef = this.dialogService.openDeleteDialog(
      'content',
      'really-delete-content',
      this.contents[index].body
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.updateContentChanges(index);
      }
    });
  }

  editContent(content: Content, group: string) {
    this.contentService.goToEdit(content.id, this.room.shortId, group);
  }

  updateContentChanges(index: number) {
    this.contentService
      .deleteContent(this.room.id, this.contents[index].id)
      .subscribe(() => {
        this.removeContentFromList(index);
        this.translateService
          .get('content.content-deleted')
          .subscribe((message) => {
            this.notificationService.showAdvanced(
              message,
              AdvancedSnackBarTypes.WARNING
            );
          });
      });
  }

  removeContentFromList(index: number) {
    this.contents.splice(index, 1);
  }

  useContentInOtherGroup(
    contentId: string,
    groupStats: ContentGroupStatistics,
    action: 'move' | 'copy'
  ): void {
    this.duplicateContent$(contentId, groupStats.id).subscribe(() => {
      if (action === 'move') {
        this.contentService
          .deleteContent(this.room.id, contentId)
          .subscribe(() => {
            this.contents = this.contents.filter((c) => c.id !== contentId);
            this.showSuccessNotification('moved', groupStats);
          });
      } else if (action === 'copy') {
        this.showSuccessNotification('copied', groupStats);
      }
    });
  }

  showSuccessNotification(
    actionString: string,
    groupStats: ContentGroupStatistics
  ) {
    const msg = this.translateService.instant(
      `content.${actionString}-to-content-group`,
      { series: groupStats.groupName }
    );
    this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
  }

  showContentGroupCreationDialog(
    contentId: string,
    action: 'move' | 'copy'
  ): void {
    const dialogRef = this.dialogService.openContentGroupCreationDialog();
    dialogRef.afterClosed().subscribe((groupName) => {
      if (groupName) {
        const newGroup = new ContentGroup();
        newGroup.roomId = this.room.id;
        newGroup.name = groupName;
        this.contentGroupService.post(newGroup).subscribe((group) => {
          const groupStats = new ContentGroupStatistics(
            group.id,
            group.name,
            0
          );
          this.contentGroupStats.push(groupStats);
          this.useContentInOtherGroup(contentId, groupStats, action);
        });
      }
    });
  }

  initContentList(contentList: Content[]) {
    this.contents = contentList;
    this.isLoading = false;
  }

  reloadContentGroup(imported = false) {
    this.isLoading = true;
    this.contentGroupService
      .getByRoomIdAndName(this.room.id, this.groupName, true)
      .subscribe((group) => {
        this.contentGroup = group;
        this.getGroups();
        this.setSettings();
        this.updatedName = this.contentGroup.name;
        this.setRange();
        if (this.contentGroup.contentIds) {
          this.contentService
            .getContentsByIds(
              this.contentGroup.roomId,
              this.contentGroup.contentIds,
              true
            )
            .subscribe((contents) => {
              this.initContentList(contents);
              if (imported) {
                const msg = this.translateService.instant(
                  'content.import-successful'
                );
                this.notificationService.showAdvanced(
                  msg,
                  AdvancedSnackBarTypes.SUCCESS
                );
              }
              this.isLoading = false;
            });
        } else {
          this.initContentList([]);
          this.isLoading = false;
        }
      });
  }

  setSettings() {
    this.published = this.contentGroup.published;
    this.statisticsPublished = this.contentGroup.statisticsPublished;
    this.correctOptionsPublished = this.contentGroup.correctOptionsPublished;
  }

  goToEdit(content: Content) {
    this.router.navigate([
      'edit',
      this.room.shortId,
      'series',
      this.contentGroup.name,
      'edit',
      content.id,
    ]);
  }

  announce() {
    this.announceService.announce('content.a11y-content-list-shortcuts');
  }

  goInTitleEditMode(): void {
    this.updatedName = this.groupName;
    this.isInTitleEditMode = true;
    this.nameInput.nativeElement.selectionStart = this.updatedName.length;
  }

  leaveTitleEditMode(): void {
    this.isInTitleEditMode = false;
    this.saveGroupName();
  }

  removeFocusFromInput() {
    this.nameInput.nativeElement.blur();
  }

  updateURL(): void {
    this.router.navigate([
      this.baseURL,
      this.room.shortId,
      'series',
      this.groupName,
    ]);
  }

  saveGroupName(): void {
    if (this.updatedName !== this.groupName && this.isNoDuplicateName()) {
      const changes: { name: string } = { name: this.updatedName };
      this.updateContentGroup(changes).subscribe((updatedGroup) => {
        this.contentGroup = updatedGroup;
        this.contentGroupService.updateGroupInMemoryStorage(
          this.groupName,
          this.updatedName
        );
        this.groupName = this.contentGroup.name;
        this.contentGroupStats.find(
          (s) => s.id === this.contentGroup.id
        ).groupName = this.groupName;
        this.translateService
          .get('content.updated-content-group')
          .subscribe((msg) => {
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.SUCCESS
            );
          });
        this.updateURL();
      });
    }
  }

  isNoDuplicateName() {
    const groupNames = this.contentGroupStats.map((s) => s.groupName);
    if (groupNames.includes(this.updatedName)) {
      this.updatedName = this.groupName;
      const msg = this.translateService.instant(
        'content.duplicate-series-name'
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.FAILED);
      return false;
    } else {
      return true;
    }
  }

  createCopy() {
    this.copiedContents = this.contents.map((content) => ({ ...content }));
    this.dragDroplist = this.copiedContents;
    this.firstPublishedIndexBackup = this.firstPublishedIndex;
    this.lastPublishedIndexBackup = this.lastPublishedIndex;
  }

  goInSortingMode(): void {
    this.createCopy();
    this.isInSortingMode = true;
  }

  leaveSortingMode(abort?: boolean): void {
    this.isInSortingMode = false;
    if (abort) {
      this.setPublishedIndexesToBackup();
    }
  }

  setPublishedIndexesToBackup() {
    this.firstPublishedIndex = this.firstPublishedIndexBackup;
    this.lastPublishedIndex = this.lastPublishedIndexBackup;
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
        firstPublishedIndex: this.firstPublishedIndex,
        lastPublishedIndex: this.lastPublishedIndex,
      };
      this.updateContentGroup(changes).subscribe(
        (updatedContentGroup) => {
          this.contentGroup = updatedContentGroup;
          this.contents = this.copiedContents;
          this.initContentList(this.contents);
          this.translateService
            .get('content.updated-sorting')
            .subscribe((msg) => {
              this.notificationService.showAdvanced(
                msg,
                AdvancedSnackBarTypes.SUCCESS
              );
            });
          this.leaveSortingMode();
        },
        () => {
          this.setPublishedIndexesToBackup();
        }
      );
    }
  }

  updateContentGroup(changes: object): Observable<ContentGroup> {
    return this.contentGroupService.patchContentGroup(
      this.contentGroup,
      changes
    );
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

  publishContent(index: number, publish: boolean) {
    if (publish) {
      this.updatePublishedIndexes(index, index);
    } else {
      if (this.lastPublishedIndex === this.firstPublishedIndex) {
        this.resetPublishing();
      } else {
        if (index === this.firstPublishedIndex) {
          this.updatePublishedIndexes(index + 1, this.lastPublishedIndex);
        } else if (this.isEnd(index)) {
          this.updatePublishedIndexes(this.firstPublishedIndex, index - 1);
        }
      }
    }
  }

  publishContentFrom(index: number, publish: boolean) {
    if (publish) {
      const last =
        this.lastPublishedIndex === -1 || this.lastPublishedIndex < index
          ? this.contents.length - 1
          : this.lastPublishedIndex;
      this.updatePublishedIndexes(index, last);
    } else {
      if (index === this.firstPublishedIndex) {
        this.resetPublishing();
      } else {
        const first =
          this.firstPublishedIndex === -1 || this.firstPublishedIndex > index
            ? 0
            : this.firstPublishedIndex;
        this.updatePublishedIndexes(first, index - 1);
      }
    }
  }

  publishContentUpTo(index: number, publish: boolean) {
    if (publish) {
      const first =
        this.firstPublishedIndex === -1 || this.firstPublishedIndex > index
          ? 0
          : this.firstPublishedIndex;
      this.updatePublishedIndexes(first, index);
    } else {
      if (index === this.lastPublishedIndex) {
        this.resetPublishing();
      } else {
        const last =
          this.lastPublishedIndex === -1 || this.lastPublishedIndex < index
            ? this.contents.length - 1
            : this.lastPublishedIndex;
        this.updatePublishedIndexes(index + 1, last);
      }
    }
  }

  resetPublishing() {
    this.updatePublishedIndexes(-1, -1);
  }

  deleteAnswers(content: Content) {
    const multipleRoundsHint =
      content.state.round > 1
        ? this.translateService.instant('dialog.all-rounds-will-be-deleted')
        : null;
    const dialogRef = this.dialogService.openDeleteDialog(
      'content-answers',
      'really-delete-answers',
      multipleRoundsHint
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.contentService.deleteAnswersOfContent(content.id, this.room.id);
      }
    });
  }

  deleteAllAnswers() {
    this.contentService
      .showDeleteAllAnswersDialog(this.contentGroup)
      .subscribe(() => {
        this.translateService
          .get('content.all-answers-deleted')
          .subscribe((msg) => {
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.WARNING
            );
          });
      });
  }

  toggleAnswersPublished(content: Content, answersPublished?: boolean) {
    if (answersPublished !== undefined) {
      content.state.answersPublished = answersPublished;
    } else {
      content.state.answersPublished = !content.state.answersPublished;
    }
    this.contentService
      .changeState(content)
      .subscribe((updatedContent) => (content = updatedContent));
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

  dropContent(event: CdkDragDrop<string[]>) {
    const current = event.currentIndex;
    const prev = event.previousIndex;
    this.moveItem(prev, current);
    this.sortPublishedIndexes(prev, current);
  }

  sortPublishedIndexes(prev: number, current: number) {
    if (this.firstPublishedIndex !== -1 && this.lastPublishedIndex !== -1) {
      if (this.publishedRangeHasChanged(prev, current)) {
        this.setNewRange(prev, current);
      }
    }
  }

  setNewRange(prev, current: number) {
    if (this.firstPublishedIndex === this.lastPublishedIndex) {
      this.setRangeForSingleContent(prev, current);
    } else {
      this.setRangeForMultipleContents(prev, current);
    }
  }

  setRangeForSingleContent(prev, current: number) {
    const publishedIndex = this.firstPublishedIndex;
    if (prev === publishedIndex) {
      this.setTempRange(current, current);
    } else {
      const newPublishedIndex =
        prev < publishedIndex ? publishedIndex - 1 : publishedIndex + 1;
      this.setTempRange(newPublishedIndex, newPublishedIndex);
    }
  }

  setRangeForMultipleContents(prev, current: number) {
    if (this.isInCurrentRange(prev)) {
      this.setNewRangeInCurrentRange(current);
    } else {
      if (this.isOutsideOfCurrentRange(prev, current)) {
        this.setNewRangeOutsideOfCurrentRange(prev);
      } else {
        if (
          current <= this.firstPublishedIndex ||
          current >= this.lastPublishedIndex
        ) {
          const adjustment = this.isBelowRange(prev) ? -1 : 1;
          this.setTempRange(
            this.firstPublishedIndex + adjustment,
            this.lastPublishedIndex + adjustment
          );
        }
      }
    }
  }

  isOutsideOfCurrentRange(prev, current: number) {
    return (
      this.isInRangeExclusive(current) ||
      (this.isAboveRange(prev) && this.isEnd(current)) ||
      (this.isBelowRange(prev) && this.isStart(current))
    );
  }

  setNewRangeInCurrentRange(current: number) {
    if (!this.isInRangeExclusive(current)) {
      if (this.isAboveRange(current)) {
        this.setTempRange(
          this.firstPublishedIndex,
          this.lastPublishedIndex - 1
        );
      } else if (this.isBelowRange(current)) {
        this.setTempRange(
          this.firstPublishedIndex + 1,
          this.lastPublishedIndex
        );
      }
    }
  }

  setNewRangeOutsideOfCurrentRange(prev: number) {
    if (this.isBelowRange(prev)) {
      this.setTempRange(this.firstPublishedIndex - 1, this.lastPublishedIndex);
    } else if (this.isAboveRange(prev)) {
      this.setTempRange(this.firstPublishedIndex, this.lastPublishedIndex + 1);
    }
  }

  publishedRangeHasChanged(prev, current: number): boolean {
    return (
      prev !== current &&
      !(
        (this.isAboveRange(prev) && this.isAboveRange(current)) ||
        (this.isBelowRange(prev) && this.isBelowRange(current))
      )
    );
  }

  isInCurrentRange(index: number): boolean {
    return (
      index <= this.lastPublishedIndex && index >= this.firstPublishedIndex
    );
  }

  isInRangeExclusive(index: number): boolean {
    return index < this.lastPublishedIndex && index > this.firstPublishedIndex;
  }

  navigateToSubroute(subRoute: string) {
    this.router.navigate([
      'edit',
      this.room.shortId,
      'series',
      this.contentGroup.name,
      subRoute,
    ]);
  }

  navigateToContentStats(content: Content) {
    const index = this.contents
      .filter((c) => this.contentTypes.indexOf(c.format) > -1)
      .map((co) => co.id)
      .indexOf(content.id);
    if (index > -1) {
      this.navigateToSubroute((index + 1).toString());
    }
  }

  updatePublishedIndexes(first: number, last: number) {
    const changes: { firstPublishedIndex: number; lastPublishedIndex: number } =
      { firstPublishedIndex: first, lastPublishedIndex: last };
    this.updateContentGroup(changes).subscribe((updatedContentGroup) => {
      this.contentGroup = updatedContentGroup;
      this.setRange();
    });
  }

  setRange() {
    this.firstPublishedIndex = this.contentGroup.firstPublishedIndex;
    this.lastPublishedIndex = this.contentGroup.lastPublishedIndex;
    const key =
      this.firstPublishedIndex === -1
        ? 'no'
        : this.lastPublishedIndex === -1
        ? 'all'
        : this.firstPublishedIndex === this.lastPublishedIndex
        ? 'single'
        : 'range';
    const msg = this.translateService.instant(
      'content.a11y-' + key + '-published',
      { first: this.firstPublishedIndex + 1, last: this.lastPublishedIndex + 1 }
    );
    this.announceService.announce(msg);
  }

  setTempRange(first: number, last: number) {
    this.firstPublishedIndex = first;
    this.lastPublishedIndex = last;
  }

  isBelowRange(index: number): boolean {
    return index < this.firstPublishedIndex;
  }

  isAboveRange(index: number): boolean {
    return index > this.lastPublishedIndex;
  }

  isStart(index: number): boolean {
    return index === this.firstPublishedIndex;
  }

  isEnd(index: number): boolean {
    return (
      index === this.lastPublishedIndex ||
      (this.lastPublishedIndex === -1 && index === this.contents.length - 1)
    );
  }

  isPublished(index: number): boolean {
    // Using this.firstPublishedIndex and this.lastPublishedIndex here to show correct state for sorting mode as well
    const group = this.contentGroup;
    group.firstPublishedIndex = this.firstPublishedIndex;
    group.lastPublishedIndex = this.lastPublishedIndex;
    return this.contentPublishService.isIndexPublished(group, index);
  }

  exportToCsv() {
    const dialogRef = this.dialogService.openExportDialog();
    dialogRef.afterClosed().subscribe((options) => {
      const blob$ = this.contentService.export(
        options.exportType,
        this.room.id,
        this.contentGroup.contentIds,
        options.charset
      );
      this.localFileService.download(blob$, this.generateExportFilename('csv'));
    });
  }

  importFromCsv() {
    const blob$ = this.localFileService.upload([
      'text/csv',
      'text/tab-separated-values',
    ]);
    blob$
      .pipe(
        mergeMap((blob) =>
          this.contentGroupService.import(
            this.room.id,
            this.contentGroup.id,
            blob
          )
        )
      )
      .subscribe(() => {
        this.reloadContentGroup(true);
      });
  }

  generateExportFilename(extension: string): string {
    const name = this.localFileService.generateFilename(
      [this.contentGroup.name, this.room.shortId],
      true
    );
    return `${name}.${extension}`;
  }

  openedMenu(index: number) {
    this.activeMenuIndex = index;
  }

  closedMenu() {
    this.activeMenuIndex = null;
  }

  deleteGroup() {
    const dialogRef = this.dialogService.openDeleteDialog(
      'content-group',
      'really-delete-content-group',
      this.contentGroup.name,
      'delete'
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.contentGroupService.delete(this.contentGroup).subscribe(() => {
          this.routingService.goBack();
          this.globalStorageService.removeItem(STORAGE_KEYS.LAST_GROUP);
          this.translateService
            .get('content.content-group-deleted')
            .subscribe((msg) => {
              this.notificationService.showAdvanced(
                msg,
                AdvancedSnackBarTypes.WARNING
              );
            });
        });
      }
    });
  }

  updateActive(contentId: string) {
    this.activeContentId = contentId;
    if (this.activeContentId) {
      if (!this.contentHotkeysRegistered) {
        this.registerHotkeys();
        this.contentHotkeysRegistered = true;
      }
    } else {
      this.unregisterHotkeys();
      this.contentHotkeysRegistered = false;
    }
  }

  duplicate(contentId: string) {
    this.duplicateContent$(contentId).subscribe((content) => {
      this.contents.push(content);
      const msg = this.translateService.instant(
        'content.content-has-been-duplicated'
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
    });
  }

  duplicateContent$(contentId: string, contentGroupId = this.contentGroup.id) {
    return this.contentService.duplicateContent(
      this.room.id,
      contentGroupId,
      contentId
    );
  }

  resetBannedAnswers(contentId: string) {
    this.contentService
      .resetBannedKeywords(this.room.id, contentId)
      .subscribe(() => {
        const msg = this.translateService.instant(
          'content.banned-keywords-reset'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
      });
  }

  startNewRound(content: Content) {
    this.contentService.startNewRound(content);
  }
}
