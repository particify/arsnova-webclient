import {
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
import {
  ContentGroup,
  GroupType,
  PublishingMode,
} from '@app/core/models/content-group';
import { take } from 'rxjs/operators';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { MatButton } from '@angular/material/button';
import { ContentType } from '@app/core/models/content-type.enum';
import { Room } from '@app/core/models/room';
import { ContentGroupStatistics } from '@app/core/models/content-group-statistics';
import { MarkdownFeatureset } from '@app/core/services/http/formatting.service';
import { Observable } from 'rxjs';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';

@Component({
  selector: 'app-content-list',
  templateUrl: './content-list.component.html',
  styleUrls: ['./content-list.component.scss'],
})
export class ContentListComponent implements OnInit, OnDestroy {
  @ViewChildren('lockMenu') lockMenus!: QueryList<MatButton>;

  @Input({ required: true }) room!: Room;
  @Input({ required: true }) contentGroup!: ContentGroup;
  @Input({ required: true }) contents!: Content[];
  @Input({ required: true }) contentGroupStats!: ContentGroupStatistics[];
  @Input() isModerator = false;
  @Input() attributionsExist = false;
  @Output() contentGroupUpdated = new EventEmitter<ContentGroup>();

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

  constructor(
    private contentService: ContentService,
    private notificationService: NotificationService,
    private translateService: TranslocoService,
    private dialogService: DialogService,
    private contentGroupService: ContentGroupService,
    private contentPublishService: ContentPublishService,
    private hotkeyService: HotkeyService
  ) {
    this.iconList = this.contentService.getTypeIcons();
  }

  ngOnInit() {
    this.getCurrentGroupIndex();
    this.contentService.getAnswersDeleted().subscribe((contentId) => {
      if (contentId) {
        const content = this.contents.find((c) => c.id === contentId);
        if (content) {
          content.state.round = 1;
        }
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
    this.contentGroupService
      .patchContentGroup(this.contentGroup, changes)
      .subscribe((updatedContentGroup) => {
        this.contentGroup = updatedContentGroup;
      });
  }

  lockContentGroup(): Observable<ContentGroup> {
    const changes: { publishingMode: PublishingMode } = {
      publishingMode: PublishingMode.NONE,
    };
    return this.contentGroupService.patchContentGroup(
      this.contentGroup,
      changes
    );
  }

  hasSpecificPublishing(): boolean {
    return this.contentPublishService.hasSpecificPublishing(this.contentGroup);
  }

  isSinglePublished(): boolean {
    return this.contentPublishService.isSinglePublished(this.contentGroup);
  }

  isPublished(index: number): boolean {
    return this.contentPublishService.isIndexPublished(
      this.contentGroup,
      index
    );
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
}
