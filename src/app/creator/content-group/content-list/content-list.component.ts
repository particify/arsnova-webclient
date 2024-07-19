import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { Content } from '@app/core/models/content';
import { ContentService } from '@app/core/services/http/content.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService } from '@ngneat/transloco';
import { DialogService } from '@app/core/services/util/dialog.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ContentGroup, GroupType } from '@app/core/models/content-group';
import { take } from 'rxjs/operators';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { MatButton } from '@angular/material/button';
import { ContentType } from '@app/core/models/content-type.enum';
import { Room } from '@app/core/models/room';
import { ContentGroupStatistics } from '@app/core/models/content-group-statistics';
import { MarkdownFeatureset } from '@app/core/services/http/formatting.service';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { DragDropBaseComponent } from '@app/standalone/drag-drop-base/drag-drop-base.component';
import { CdkDragDrop, CdkDragSortEvent } from '@angular/cdk/drag-drop';
import { MatListItem } from '@angular/material/list';
import { ContentStats } from '@app/creator/content-group/content-group-page.component';
import { Observable, tap } from 'rxjs';

@Component({
  selector: 'app-content-list',
  templateUrl: './content-list.component.html',
  styleUrls: ['./content-list.component.scss'],
})
export class ContentListComponent
  extends DragDropBaseComponent
  implements OnInit, OnDestroy
{
  @ViewChildren('lockMenu') lockMenus!: QueryList<MatButton>;
  @ViewChildren('sortListItem') sortItems!: QueryList<MatListItem>;

  @Input({ required: true }) room!: Room;
  @Input({ required: true }) contentGroup!: ContentGroup;
  @Input({ required: true }) contents!: Content[];
  @Input({ required: true }) contentGroupStats!: ContentGroupStatistics[];
  @Input() isModerator = false;
  @Input() attributionsExist = false;
  @Input() contentStats = new Map<string, ContentStats>();
  @Output() hasStartedContentChanged = new EventEmitter<boolean>();

  currentGroupIndex?: number;
  contentTypes: string[] = Object.values(ContentType);

  activeMenuIndex?: number;
  activeContentId?: string;
  contentHotkeysRegistered = false;
  markdownFeatureset = MarkdownFeatureset.MINIMUM;

  private hotkeyRefs: symbol[] = [];

  ContentType: typeof ContentType = ContentType;
  GroupType = GroupType;

  iconList: Map<ContentType, string>;

  publishingChangeActive = false;
  publishingChangePosition?: number;

  startedContentIndex?: number;
  endDate?: Date;

  finishedContents = new Map<string, boolean>();

  constructor(
    private contentService: ContentService,
    private notificationService: NotificationService,
    private translateService: TranslocoService,
    private dialogService: DialogService,
    private contentGroupService: ContentGroupService,
    private contentPublishService: ContentPublishService,
    private hotkeyService: HotkeyService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super();
    this.iconList = this.contentService.getTypeIcons();
  }

  ngOnInit() {
    this.dragDroplist = this.contents;
    this.getCurrentGroupIndex();
    this.contentService.getAnswersDeleted().subscribe((contentId) => {
      if (contentId) {
        const content = this.contents.find((c) => c.id === contentId);
        if (content) {
          content.state.answeringEndTime = undefined;
          content.state.round = 1;
          this.finishedContents.set(content.id, false);
        }
      }
    });
    this.contents.forEach((c) => {
      this.finishedContents.set(
        c.id,
        !!c.state.answeringEndTime && !this.isTimerRunning(c)
      );
      if (this.isTimerRunning(c)) {
        this.setTimerData(c);
      }
    });
  }

  ngOnDestroy() {
    this.unregisterHotkeys();
  }

  registerHotkeys() {
    this.translateService
      .selectTranslate('creator.control-bar.publish-or-lock-content')
      .pipe(take(1))
      .subscribe((t) =>
        this.hotkeyService.registerHotkey(
          {
            key: 'l',
            action: () => {
              if (!this.activeContentId) {
                return;
              }
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

  getCurrentGroupIndex() {
    if (
      this.contentGroupStats &&
      this.contentGroup &&
      this.contentGroupStats.length > 0
    ) {
      this.currentGroupIndex = this.contentGroupStats.findIndex(
        (s) => s.groupName === this.contentGroup.name
      );
    }
  }

  deleteContent(index: number) {
    const dialogRef = this.dialogService.openDeleteDialog(
      'content',
      'creator.dialog.really-delete-content',
      this.contents[index].body,
      undefined,
      () =>
        this.contentService.deleteContent(this.room.id, this.contents[index].id)
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.removeContentFromList(index);
        const msg = this.translateService.translate(
          'creator.content.content-deleted'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
      }
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
    const msg = this.translateService.translate(
      `creator.content.${actionString}-to-content-group`,
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
          const groupStats = {
            id: group.id,
            groupName: group.name,
            contentCount: 0,
            groupType: group.groupType,
          };
          this.contentGroupStats.push(groupStats);
          this.useContentInOtherGroup(contentId, groupStats, action);
        });
      }
    });
  }

  deleteAnswers(content: Content) {
    const multipleRoundsHint =
      content.state.round > 1
        ? this.translateService.translate(
            'creator.dialog.all-rounds-will-be-deleted'
          )
        : undefined;
    this.dialogService.openDeleteDialog(
      'content-answers',
      'creator.dialog.really-delete-answers',
      multipleRoundsHint,
      undefined,
      () => this.contentService.deleteAnswersOfContent(content.id, this.room.id)
    );
  }

  toggleAnswersPublished(content: Content, answersPublished?: boolean) {
    if (answersPublished !== undefined) {
      content.state.answersPublished = answersPublished;
    } else {
      content.state.answersPublished = !content.state.answersPublished;
    }
    this.contentService
      .changeState(content, content.state)
      .subscribe((updatedContent) => (content = updatedContent));
  }

  updatePublishingIndex(index: number) {
    const changes: { publishingIndex: number } = { publishingIndex: index };
    return this.contentGroupService
      .patchContentGroup(this.contentGroup, changes)
      .pipe(
        tap((contentGroup: ContentGroup) => (this.contentGroup = contentGroup))
      );
  }

  isRangePublished(): boolean {
    return this.contentPublishService.isRangePublished(this.contentGroup);
  }

  isPublished(index: number): boolean {
    return this.contentPublishService.isIndexPublished(
      this.contentGroup,
      index
    );
  }

  isLiveMode(): boolean {
    return this.contentPublishService.isGroupLive(this.contentGroup);
  }

  openedMenu(index: number) {
    this.activeMenuIndex = index;
  }

  closedMenu() {
    this.activeMenuIndex = undefined;
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
      const msg = this.translateService.translate(
        'creator.content.content-has-been-duplicated'
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
        const msg = this.translateService.translate(
          'creator.content.banned-keywords-reset'
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

  private getSortIndex(
    index: number,
    indexIsNotPublishingIndex = true
  ): number {
    return (
      index -
      (this.isRangePublished() &&
      index > this.contentGroup.publishingIndex &&
      indexIsNotPublishingIndex
        ? 1
        : 0)
    );
  }

  dropContent(prev: number, current: number) {
    if (prev === current) {
      return;
    }
    const oldPublishingIndex = this.contentGroup.publishingIndex;
    this.updatePublishingIndexOnSorting(prev, current);
    const prevContentIndex = this.getSortIndex(
      prev,
      prev !== oldPublishingIndex
    );
    const currentContentIndex = this.getSortIndex(current);
    this.moveItem(prevContentIndex, currentContentIndex);
    const changes: {
      contentIds: string[];
      publishingIndex: number;
    } = {
      contentIds: this.contents.map((c) => c.id),
      publishingIndex: this.contentGroup.publishingIndex,
    };
    this.contentGroupService
      .patchContentGroup(this.contentGroup, changes)
      .subscribe((updatedContentGroup) => {
        this.contentGroup = updatedContentGroup;
      });
  }

  private updatePublishingIndexOnSorting(prev: number, current: number): void {
    if (this.isRangePublished()) {
      if (this.isMovedIntoLocked(prev, current)) {
        this.contentGroup.publishingIndex--;
      } else if (this.isMovedIntoPublished(prev, current)) {
        this.contentGroup.publishingIndex++;
      }
    }
  }

  private isMovedIntoPublished(prev: number, current: number): boolean {
    return (
      prev > this.contentGroup.publishingIndex &&
      current - 1 <= this.contentGroup.publishingIndex
    );
  }

  private isMovedIntoLocked(prev: number, current: number): boolean {
    return (
      (prev > 0 || this.contentGroup.publishingIndex > 0) &&
      prev <= this.contentGroup.publishingIndex &&
      current > this.contentGroup.publishingIndex
    );
  }

  dropPublishingDivider(event: CdkDragDrop<Content[]>) {
    this.publishingChangeActive = false;
    this.publishingChangePosition = undefined;
    const newPublishingIndex = event.currentIndex - 1;
    if (this.contentGroup.publishingIndex !== newPublishingIndex) {
      this.contentGroup.publishingIndex = newPublishingIndex;
      this.updatePublishingIndex(newPublishingIndex).subscribe();
    }
  }

  onSortChanged(event: CdkDragSortEvent) {
    if (this.publishingChangeActive) {
      this.publishingChangePosition = event.currentIndex;
    }
    this.changeDetectorRef.detectChanges();
  }

  getPercentageString(value?: number): string {
    return value?.toFixed() + '\u202F%';
  }

  isStarted(index: number): boolean {
    return (
      this.startedContentIndex === index &&
      this.isTimerRunning(this.contents[index])
    );
  }

  private isTimerRunning(content: Content): boolean {
    return (
      !!content.state.answeringEndTime &&
      new Date(content.state.answeringEndTime) > new Date()
    );
  }

  startContent(index: number): void {
    const contentId = this.contents[index].id;
    this.contentGroupService
      .startContent(this.room.id, this.contentGroup.id, contentId)
      .subscribe(() => {
        this.reloadContent(contentId).subscribe(() => {
          if (this.contentGroup.publishingIndex < index) {
            this.contentGroup.publishingIndex = index;
          }
          const msg = this.translateService.translate(
            'creator.content.content-started'
          );
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.SUCCESS
          );
        });
      });
  }

  stopContent(index: number): void {
    const contentId = this.contents[index].id;
    this.contentService.stopContent(this.room.id, contentId).subscribe(() => {
      this.reloadContent(contentId).subscribe(() => {
        this.finishAnswering();
        const msg = this.translateService.translate(
          'creator.content.content-stopped'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
      });
    });
  }

  finishAnswering(): void {
    if (this.startedContentIndex !== undefined) {
      this.finishedContents.set(
        this.contents[this.startedContentIndex].id,
        true
      );
    }
    this.endDate = undefined;
    this.setStartedContent();
  }

  private reloadContent(contentId: string): Observable<Content> {
    return this.contentService.getContent(this.room.id, contentId).pipe(
      tap((content: Content) => {
        this.finishedContents.set(
          content.id,
          !!content.state.answeringEndTime && !this.isTimerRunning(content)
        );
        const index = this.contents.map((c) => c.id).indexOf(contentId);
        this.contents[index] = content;
        this.setTimerData(content);
      })
    );
  }

  private setTimerData(content: Content): void {
    if (content.state.answeringEndTime) {
      this.endDate = new Date(content.state.answeringEndTime);
      this.setStartedContent(
        this.contents.map((c) => c.id).indexOf(content.id)
      );
    } else {
      this.endDate = undefined;
      this.setStartedContent();
    }
  }

  setStartedContent(index?: number): void {
    this.startedContentIndex = index;
    this.hasStartedContentChanged.emit(this.startedContentIndex !== undefined);
  }

  isCompatibleWithGroupType(content: Content, groupType: GroupType): boolean {
    return this.contentGroupService.isContentCompatibleWithGroupType(
      content,
      groupType
    );
  }
}
