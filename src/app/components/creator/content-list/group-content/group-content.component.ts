import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Content } from '../../../../models/content';
import { ContentService } from '../../../../services/http/content.service';
import { RoomService } from '../../../../services/http/room.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { AdvancedSnackBarTypes, NotificationService } from '../../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../services/util/language.service';
import { DialogService } from '../../../../services/util/dialog.service';
import { GlobalStorageService, STORAGE_KEYS } from '../../../../services/util/global-storage.service';
import { ContentGroupService } from '../../../../services/http/content-group.service';
import { ContentListBaseComponent } from '../content-list-base.component';
import { ContentGroup } from '../../../../models/content-group';
import { AnnounceService } from '../../../../services/util/announce.service';
import { KeyboardUtils } from '../../../../utils/keyboard';
import { KeyboardKey } from '../../../../utils/keyboard/keys';
import { EventService } from '../../../../services/util/event.service';
import { LocalFileService } from '../../../../services/util/local-file.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { RoomStatsService } from '../../../../services/http/room-stats.service';

@Component({
  selector: 'app-group-content',
  templateUrl: './group-content.component.html',
  styleUrls: ['./group-content.component.scss']
})
export class GroupContentComponent extends ContentListBaseComponent implements OnInit {

  @ViewChild('nameInput') nameInput: ElementRef;

  collectionName: string;
  isInTitleEditMode = false;
  inputFocus = false;
  isInSortingMode = false;
  updatedName: string;
  baseURL = 'creator/room';
  published = false;
  statisticsPublished = true;
  correctOptionsPublished = true;
  firstPublishedIndex = 0;
  lastPublishedIndex = -1;
  lastPublishedIndexBackup = -1;
  firstPublishedIndexBackup = -1;
  copiedContents = [];
  activeMenuIndex: number;

  constructor(
    protected contentService: ContentService,
    protected roomStatsService: RoomStatsService,
    protected route: ActivatedRoute,
    protected location: Location,
    protected notificationService: NotificationService,
    protected translateService: TranslateService,
    protected langService: LanguageService,
    protected dialogService: DialogService,
    protected globalStorageService: GlobalStorageService,
    protected contentGroupService: ContentGroupService,
    protected announceService: AnnounceService,
    public eventService: EventService,
    protected localFileService: LocalFileService,
    protected router: Router
  ) {
    super(contentService, roomStatsService, route, location, notificationService, translateService, langService, dialogService,
    globalStorageService, contentGroupService, announceService, router);
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    const focusOnInput = this.eventService.focusOnInput;
    if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit1) === true && focusOnInput === false) {
      document.getElementById('content-create-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit2) === true && focusOnInput === false) {
      document.getElementById('statistic-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit3) === true && focusOnInput === false) {
      document.getElementById('settings-button').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit4) === true && focusOnInput === false) {
      document.getElementById('lock-group-slide').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit5) === true && focusOnInput === false) {
      document.getElementById('content-list').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit6) === true && focusOnInput === false) {
      document.getElementById('nameInput').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Escape) === true) {
      if (focusOnInput) {
        this.removeFocusFromInput();
      }
      setTimeout(() => {
        document.getElementById('keys-button').focus();
      }, 200);
    }
  }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.room = data.room;
      this.route.params.subscribe(params => {
        this.collectionName = params['contentGroup'];
        this.globalStorageService.setItem(STORAGE_KEYS.LAST_GROUP, this.collectionName);
        this.reloadContentGroup()
      });
    });
    this.translateService.use(this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE));
  }

  reloadContentGroup(imported = false) {
    this.contentGroupService.getByRoomIdAndName(this.room.id, this.collectionName, true).subscribe(group => {
      this.contentGroup = group;
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
          });
      } else {
        this.initContentList([]);
      }
    });
  }

  setSettings() {
    this.published = this.contentGroup.published;
    this.statisticsPublished = this.contentGroup.statisticsPublished;
    this.correctOptionsPublished = this.contentGroup.correctOptionsPublished;
  }

  goToEdit(content: Content) {
    this.router.navigate(['creator', 'room', this.room.shortId, 'group', this.contentGroup.name, 'edit', content.id]);
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
      this.eventService.makeFocusOnInputTrue();
    }, 100);

  }

  leaveTitleEditMode(): void {
    this.isInTitleEditMode = false;
    this.eventService.makeFocusOnInputFalse();
    this.saveGroupName();
  }

  removeFocusFromInput() {
    this.nameInput.nativeElement.blur();
  }

  updateURL(): void {
    const urlTree = this.router.createUrlTree([this.baseURL, this.room.shortId, 'group', this.collectionName]);
    this.location.replaceState(this.router.serializeUrl(urlTree));
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

  showDeleteAnswerDialog(content: Content): void {
    const dialogRef = this.dialogService.openDeleteDialog('really-delete-answers');
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteAnswers(content.id);
      }
    });
  }

  deleteAnswers(contentId: string) {
    this.contentService.deleteAnswers(this.contentGroup.roomId, contentId).subscribe(() => {
      this.translateService.get('content.answers-deleted').subscribe(msg => {
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
  removeContent(delContent: Content) {
    const index = this.findIndexOfId(delContent.id);
    const dialogRef = this.dialogService.openDeleteDialog('really-remove-content', this.contents[index].body, 'remove');
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateContentChanges(index, result);
      }
    });
  }

  navigateToContentStats(content: Content) {
    const index = this.contents.filter(c => this.contentTypes.indexOf(c.format) > -1).
    map(co => co.id).indexOf(content.id);
    if (index > -1) {
      this.router.navigate(['creator', 'room', this.room.shortId, 'group', this.contentGroup.name, 'statistics', index + 1]);
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
    const dialogRef = this.dialogService.openDeleteDialog('really-delete-content-group', this.contentGroup.name, 'delete');
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.contentGroupService.delete(this.contentGroup).subscribe(() => {
          this.location.back();
          this.translateService.get('content.content-group-deleted').subscribe(msg => {
            this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
          });
        })
      }
    });
  }

}
