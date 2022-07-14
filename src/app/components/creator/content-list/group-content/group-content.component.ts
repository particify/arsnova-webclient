import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Content } from '../../../../models/content';
import { ContentService } from '../../../../services/http/content.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AdvancedSnackBarTypes, NotificationService } from '../../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../services/util/language.service';
import { DialogService } from '../../../../services/util/dialog.service';
import { GlobalStorageService, STORAGE_KEYS } from '../../../../services/util/global-storage.service';
import { ContentGroupService } from '../../../../services/http/content-group.service';
import { ContentGroup } from '../../../../models/content-group';
import { AnnounceService } from '../../../../services/util/announce.service';
import { EventService } from '../../../../services/util/event.service';
import { LocalFileService } from '../../../../services/util/local-file.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Observable, Subject, Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { RoomStatsService } from '../../../../services/http/room-stats.service';
import { HotkeyService } from '../../../../services/util/hotkey.service';
import { MatButton } from '@angular/material/button';
import { ContentType } from '../../../../models/content-type.enum';
import { ContentMessages } from '../../../../models/events/content-messages.enum';
import { UiState } from '../../../../models/events/ui/ui-state.enum';
import { RoutingService } from '../../../../services/util/routing.service';
import { Room } from '../../../../models/room';

@Component({
  selector: 'app-group-content',
  templateUrl: './group-content.component.html',
  styleUrls: ['./group-content.component.scss']
})
export class GroupContentComponent implements OnInit, OnDestroy {

  @ViewChild('nameInput') nameInput: ElementRef;
  @ViewChildren('lockMenu') lockMenus: QueryList<MatButton>;

  room: Room;
  contents: Content[];
  contentGroups: string[] = [];
  contentGroup: ContentGroup;
  currentGroupIndex: number;
  contentTypes: string[] = Object.values(ContentType);
  deviceWidth = innerWidth;
  isLoading = true;

  collectionName: string;
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

  private hotkeyRefs: Symbol[] = [];

  ContentType: typeof ContentType = ContentType;
  resetAnswerEvent: Subject<string> = new Subject<string>();

  iconList: Map<ContentType, string>;

  navBarExists = false;
  onInit = false;

  navBarStateSubscription: Subscription;

  constructor(
    protected contentService: ContentService,
    protected roomStatsService: RoomStatsService,
    protected route: ActivatedRoute,
    protected notificationService: NotificationService,
    protected translateService: TranslateService,
    protected langService: LanguageService,
    protected dialogService: DialogService,
    protected globalStorageService: GlobalStorageService,
    protected contentGroupService: ContentGroupService,
    protected announceService: AnnounceService,
    public eventService: EventService,
    protected localFileService: LocalFileService,
    protected router: Router,
    private hotkeyService: HotkeyService,
    private routingService: RoutingService
  ) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit() {
    this.navBarStateSubscription = this.eventService.on<boolean>(UiState.NAV_BAR_VISIBLE).subscribe(isVisible => {
      this.navBarExists = isVisible;
    });
    this.onInit = true;
    this.iconList = this.contentService.getTypeIcons();
    this.route.data.subscribe(data => {
      this.room = data.room;
      this.getGroups();
      this.collectionName = this.route.snapshot.params['seriesName'];
      this.globalStorageService.setItem(STORAGE_KEYS.LAST_GROUP, this.collectionName);
      this.reloadContentGroup();
    });
    this.translateService.use(this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE));
    this.eventService.on(ContentMessages.ANSWERS_DELETED).subscribe(contentId => {
      const content = this.contents.find(c => c.id === contentId);
      content.state.round = 1;
      this.resetAnswerEvent.next(content.id);
    });
    this.eventService.on<string>(UiState.NEW_GROUP_SELECTED).subscribe(newGroup => {
      this.collectionName = newGroup;
      this.reloadContentGroup();
    });
  }

  ngOnDestroy() {
    this.unregisterHotkeys();
  }

  registerHotkeys() {
    this.translateService.get('control-bar.publish-or-lock-content').subscribe(t =>
      this.hotkeyService.registerHotkey({
        key: 'l',
        action: () => {
          const activeIndex = this.contents.map(c => c.id).indexOf(this.activeContentId);
          this.lockMenus.toArray()[activeIndex].focus();
        },
        actionTitle: t
      }, this.hotkeyRefs)
    );
  }

  unregisterHotkeys() {
    this.hotkeyRefs.forEach(h => this.hotkeyService.unregisterHotkey(h));
  }

  getGroups(): void {
    this.contentGroups = this.globalStorageService.getItem(STORAGE_KEYS.CONTENT_GROUPS);
    if (!this.contentGroups) {
      this.roomStatsService.getStats(this.room.id, true).subscribe(roomStats => {
        if (roomStats.groupStats) {
          this.contentGroups = roomStats.groupStats.map(stat => stat.groupName);
        }
      });
    }
    if (this.contentGroups && this.contentGroup && this.contentGroups.length > 0) {
      for (let i = 0; i < this.contentGroups.length; i++) {
        if (this.contentGroups[i] === this.contentGroup.name) {
          this.currentGroupIndex = i;
        }
      }
    }
  }

  findIndexOfId(id: string): number {
    return this.contents.map(c => c.id).indexOf(id);
  }

  deleteContent(delContent: Content) {
    const index = this.findIndexOfId(delContent.id);
    const dialogRef = this.dialogService.openDeleteDialog('content', 'really-delete-content', this.contents[index].body);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateContentChanges(index, result);
      }
    });
  }

  editContent(content: Content, group: string) {
    this.contentService.goToEdit(content.id, this.room.shortId, group);
  }


  updateContentChanges(index: number, action: string) {
    if (action) {
      switch (action.valueOf()) {
        case 'delete':
          this.contentService.deleteContent(this.room.id, this.contents[index].id).subscribe(() => {
            this.removeContentFromList(index);
            this.translateService.get('content.content-deleted').subscribe(message => {
              this.notificationService.showAdvanced(message, AdvancedSnackBarTypes.WARNING);
            });
          });
          break;
        case 'remove':
          this.contentGroupService.removeContentFromGroup(this.room.id, this.contentGroup.id, this.contents[index].id)
            .subscribe(() => {
            this.removeContentFromList(index);
          });

      }
    }
  }

  removeContentFromList(index: number) {
    this.contents.splice(index, 1);
  }

  addToContentGroup(contentId: string, cgName: string, newGroup: boolean): void {
    this.contentGroupService.addContentToGroup(this.room.id, cgName, contentId).subscribe(() => {
      if (!newGroup) {
        this.translateService.get('content.added-to-content-group').subscribe(msg => {
          this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
        });
      } else {
        this.translateService.get('dialog.content-group-created').subscribe(msg => {
          this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
        });
      }
    });
  }

  showContentGroupCreationDialog(contentId: string): void {
    const dialogRef = this.dialogService.openContentGroupCreationDialog();
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addToContentGroup(contentId, result, true);
      }
    });
  }

  initContentList(contentList: Content[]) {
    this.contents = contentList;
    this.isLoading = false;
    setTimeout(() => {
      document.getElementById('message-button').focus();
    }, 500);
  }

  reloadContentGroup(imported = false) {
    this.isLoading = true;
    this.contentGroupService.getByRoomIdAndName(this.room.id, this.collectionName, true).subscribe(group => {
      this.contentGroup = group;
      this.setSettings();
      this.updatedName = this.contentGroup.name;
      this.setRange();
      if (this.contentGroup.contentIds) {
        this.contentService.getContentsByIds(this.contentGroup.roomId, this.contentGroup.contentIds, true)
          .subscribe(contents => {
            this.initContentList(contents);
            if (imported) {
              const msg = this.translateService.instant('content.import-successful');
              this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
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
    this.router.navigate(['edit', this.room.shortId, 'series', this.contentGroup.name, 'edit', content.id]);
  }

  announce() {
    this.announceService.announce('content.a11y-content-list-shortcuts');
  }

  goInTitleEditMode(): void {
    this.updatedName = this.collectionName;
    this.isInTitleEditMode = true;
    setTimeout(() => {
      document.getElementById('nameInput').focus();
      this.nameInput.nativeElement.selectionStart = this.updatedName.length;
    }, 100);

  }

  leaveTitleEditMode(): void {
    this.isInTitleEditMode = false;
    this.saveGroupName();
  }

  removeFocusFromInput() {
    this.nameInput.nativeElement.blur();
  }

  updateURL(): void {
    this.router.navigate([this.baseURL, this.room.shortId, 'series', this.collectionName]);
  }

  saveGroupName(): void {
    if (this.updatedName !== this.collectionName) {
      const changes: { name: string } = { name: this.updatedName };
      this.updateContentGroup(changes).subscribe(updatedGroup => {
          this.contentGroup = updatedGroup;
          this.contentGroupService.updateGroupInMemoryStorage(this.collectionName, this.updatedName);
          this.collectionName = this.contentGroup.name;
          this.translateService.get('content.updated-content-group').subscribe(msg => {
            this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
          });
          this.updateURL();
        });
    }
  }

  createCopy() {
    this.copiedContents = this.contents.map(content => ({ ...content }));
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
    const newContentIdOrder = this.copiedContents.map(c => c.id);
    if (this.contentGroup.contentIds !== newContentIdOrder) {
      const changes: { contentIds: string[], firstPublishedIndex: number, lastPublishedIndex: number } =
        { contentIds: newContentIdOrder, firstPublishedIndex: this.firstPublishedIndex, lastPublishedIndex: this.lastPublishedIndex };
      this.updateContentGroup(changes).subscribe(updatedContentGroup => {
        this.contentGroup = updatedContentGroup;
        this.contents = this.copiedContents;
        this.initContentList(this.contents);
        this.translateService.get('content.updated-sorting').subscribe(msg => {
          this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
        });
        this.leaveSortingMode();
      },
        error => {
        this.setPublishedIndexesToBackup()
      });
    }
  }

  updateContentGroup(changes: object): Observable<ContentGroup> {
    return this.contentGroupService.patchContentGroup(this.contentGroup, changes);
  }

  publishContents() {
    const changes: { published: boolean } = { published: !this.contentGroup.published };
    this.updateContentGroup(changes).subscribe(updatedContentGroup => {
      this.contentGroup = updatedContentGroup;
      this.published = this.contentGroup.published;
    });
  }

  publishContent(index: number, publish: boolean) {
    if (publish) {
      this.updatePublishedIndexes(index, index);
    } else {
      if (this.lastPublishedIndex === this.firstPublishedIndex) {
        this.resetPublishing()
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
      const last = this.lastPublishedIndex === -1 || this.lastPublishedIndex < index ? this.contents.length - 1 : this.lastPublishedIndex;
      this.updatePublishedIndexes(index, last);
    } else {
      if (index === this.firstPublishedIndex) {
        this.resetPublishing();
      } else {
        const first = this.firstPublishedIndex === -1 || this.firstPublishedIndex > index ? 0 : this.firstPublishedIndex;
        this.updatePublishedIndexes(first, index - 1);
      }
    }
  }

  publishContentUpTo(index: number, publish: boolean) {
    if (publish) {
      const first = (this.firstPublishedIndex === -1 || this.firstPublishedIndex > index) ? 0 : this.firstPublishedIndex;
      this.updatePublishedIndexes(first, index);
    } else {
      if (index === this.lastPublishedIndex) {
        this.resetPublishing();
      } else {
        const last = this.lastPublishedIndex === -1 || this.lastPublishedIndex < index ? this.contents.length - 1 : this.lastPublishedIndex;
        this.updatePublishedIndexes(index + 1, last);
      }
    }
  }

  resetPublishing() {
    this.updatePublishedIndexes(-1, -1);
  }

  deleteAnswers(content: Content) {
    const dialogRef = this.dialogService.openDeleteDialog('content-answers', 'really-delete-answers');
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.contentService.deleteAnswersOfContent(content.id, this.room.id);
      }
    });
  }

  deleteAllAnswers() {
    this.contentService.showDeleteAllAnswersDialog(this.contentGroup).subscribe(() => {
      this.translateService.get('content.all-answers-deleted').subscribe(msg => {
        this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      });
    });
  }

  toggleAnswersPublished(content: Content, answersPublished?: boolean) {
    if (answersPublished !== undefined) {
      content.state.answersPublished = answersPublished;
    } else {
      content.state.answersPublished = !content.state.answersPublished;
    }
    this.contentService.changeState(content).subscribe(updatedContent => content = updatedContent);
  }

  toggleStatisticsPublished() {
    const changes: { statisticsPublished: boolean } = { statisticsPublished: !this.contentGroup.statisticsPublished };
    this.updateContentGroup(changes).subscribe(updatedContentGroup => {
      this.contentGroup = updatedContentGroup;
      this.statisticsPublished = this.contentGroup.statisticsPublished;
    });
  }

  toggleCorrectOptionsPublished() {
    const changes: { correctOptionsPublished: boolean } = { correctOptionsPublished: !this.contentGroup.correctOptionsPublished };
    this.updateContentGroup(changes).subscribe(updatedContentGroup => {
      this.contentGroup = updatedContentGroup;
      this.correctOptionsPublished = this.contentGroup.correctOptionsPublished;
    });
  }

  drop(event: CdkDragDrop<Content[]>) {
    const prev = event.previousIndex;
    const current = event.currentIndex;
    moveItemInArray(this.copiedContents, prev, current);
    this.sortPublishedIndexes(prev, current);
  }

  sortPublishedIndexes(prev: number, current: number) {
    if (this.firstPublishedIndex !== -1 && this.lastPublishedIndex !== -1) {
      if (prev !== current && !(this.isAboveRange(prev) && this.isAboveRange(current)
        || this.isBelowRange(prev) && this.isBelowRange(current))) {
        if (this.firstPublishedIndex === this.lastPublishedIndex) {
          const publishedIndex = this.firstPublishedIndex;
          if (prev === publishedIndex) {
            this.setTempRange(current, current);
          } else {
            const newPublishedIndex = prev < publishedIndex ? publishedIndex - 1 : publishedIndex + 1;
            this.setTempRange(newPublishedIndex, newPublishedIndex);
          }
        } else {
          if (this.isInRange(prev)) {
            if (!this.isInRangeExclusive(current)) {
              if (this.isAboveRange(current)) {
                this.setTempRange(this.firstPublishedIndex, this.lastPublishedIndex - 1);
              } else if (this.isBelowRange(current)) {
                this.setTempRange(this.firstPublishedIndex + 1, this.lastPublishedIndex);
              }
            }
          } else {
            if (this.isInRangeExclusive(current) || (this.isAboveRange(prev) && this.isEnd(current))
              || (this.isBelowRange(prev) && this.isStart(current))) {
              if (this.isBelowRange(prev)) {
                this.setTempRange(this.firstPublishedIndex - 1, this.lastPublishedIndex);
              } else if (this.isAboveRange(prev)) {
                this.setTempRange(this.firstPublishedIndex, this.lastPublishedIndex + 1);
              }
            } else {
              if (current <= this.firstPublishedIndex || current >= this.lastPublishedIndex) {
                const adjustment = this.isBelowRange(prev) ? -1 : 1;
                this.setTempRange(this.firstPublishedIndex + adjustment, this.lastPublishedIndex + adjustment);
              }
            }
          }
        }
      }
    }
  }

  isInRange(index: number): boolean {
    return index <= this.lastPublishedIndex && index >= this.firstPublishedIndex;
  }

  isInRangeExclusive(index: number): boolean {
    return index < this.lastPublishedIndex && index > this.firstPublishedIndex;
  }

  navigateToSubroute(subRoute: string) {
    this.router.navigate(['edit', this.room.shortId, 'series', this.contentGroup.name, subRoute]);
  }

  navigateToContentStats(content: Content) {
    const index = this.contents.filter(c => this.contentTypes.indexOf(c.format) > -1).
    map(co => co.id).indexOf(content.id);
    if (index > -1) {
      this.navigateToSubroute((index + 1).toString());
    }
  }

  updatePublishedIndexes(first: number, last: number) {
    const changes: { firstPublishedIndex: number, lastPublishedIndex: number } = { firstPublishedIndex: first, lastPublishedIndex: last };
    this.updateContentGroup(changes).subscribe(updatedContentGroup => {
      this.contentGroup = updatedContentGroup;
      this.setRange();
    });
  }

  setRange() {
    this.firstPublishedIndex = this.contentGroup.firstPublishedIndex;
    this.lastPublishedIndex = this.contentGroup.lastPublishedIndex;
    const key = this.firstPublishedIndex === - 1 ? 'no' : this.lastPublishedIndex === -1 ? 'all'
      : this.firstPublishedIndex === this.lastPublishedIndex ? 'single' : 'range';
    const msg = this.translateService.instant('content.a11y-' + key + '-published',
      { first: this.firstPublishedIndex + 1, last: this.lastPublishedIndex + 1 });
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
    return index === this.lastPublishedIndex || (this.lastPublishedIndex === -1 && index === this.contents.length -1);
  }

  isPublished(index: number): boolean {
    return this.contentGroupService.isIndexPublished(this.firstPublishedIndex, this.lastPublishedIndex, index);
  }

  exportToCsv() {
    const dialogRef = this.dialogService.openExportDialog();
    dialogRef.afterClosed().subscribe(options => {
      const blob$ = this.contentService.export(
          options.exportType,
          this.room.id,
          this.contentGroup.contentIds,
          options.charset);
      this.localFileService.download(blob$, this.generateExportFilename('csv'));
    });
  }

  importFromCsv() {
    const blob$ = this.localFileService.upload([
        'text/csv',
        'text/tab-separated-values']);
    blob$.pipe(mergeMap(blob => this.contentGroupService.import(this.room.id, this.contentGroup.id, blob)))
        .subscribe(() => {
          this.reloadContentGroup(true);
        });
  }

  generateExportFilename(extension: string): string {
    const name = this.localFileService.generateFilename([this.contentGroup.name, this.room.shortId], true);
    return `${name}.${extension}`;
  }

  openedMenu(index: number) {
    this.activeMenuIndex = index;
  }

  closedMenu() {
    this.activeMenuIndex = null;
  }

  deleteGroup() {
    const dialogRef = this.dialogService.openDeleteDialog('content-group', 'really-delete-content-group', this.contentGroup.name, 'delete');
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.contentGroupService.delete(this.contentGroup).subscribe(() => {
          this.routingService.goBack();
          this.globalStorageService.removeItem(STORAGE_KEYS.LAST_GROUP);
          this.translateService.get('content.content-group-deleted').subscribe(msg => {
            this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
          });
        })
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
}
