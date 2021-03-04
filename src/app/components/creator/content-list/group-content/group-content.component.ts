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
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-group-content',
  templateUrl: './group-content.component.html',
  styleUrls: ['./group-content.component.scss']
})
export class GroupContentComponent extends ContentListBaseComponent implements OnInit {

  collectionName: string;
  isInTitleEditMode = false;
  isInSortingMode = false;
  updatedName: string;
  baseURL = 'creator/room/';
  unlocked = false;
  directAnswer = false;
  copiedContents = [];

  constructor(
    protected contentService: ContentService,
    protected roomService: RoomService,
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
    protected router: Router
  ) {
    super(contentService, roomService, route, location, notificationService, translateService, langService, dialogService,
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
      document.getElementById('direct-send-slide').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit4) === true && focusOnInput === false) {
      document.getElementById('lock-questions-slide').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit5) === true && focusOnInput === false) {
      document.getElementById('content-list').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit6) === true && focusOnInput === false) {
      document.getElementById('edit-group-name').focus();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Escape) === true) {
      if (focusOnInput) {
        this.leaveTitleEditMode();
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
        this.roomService.getGroupByRoomIdAndName(this.room.id, this.collectionName).subscribe(group => {
          this.contentGroup = group;
          this.contentService.getContentsByIds(this.contentGroup.roomId, this.contentGroup.contentIds).subscribe(contents => {
            this.initContentList(contents);
          });
        });
      });
    });
    this.translateService.use(this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE));
  }

  setSettings() {
    if (this.contents.filter(c => c.state.visible).length) {
      this.unlocked = true;
    }
    if (this.contents.filter(c => c.state.responsesVisible).length) {
      this.directAnswer = true;
    }
  }

  goToEdit(content: Content) {
    const url = `creator/room/${this.room.shortId}/group/${this.contentGroup.name}/edit/${content.id}`;
    this.router.navigate([url]);
  }

  announce() {
    this.announceService.announce('content.a11y-content-list-shortcuts');
  }

  goInTitleEditMode(): void {
    this.updatedName = this.collectionName;
    this.isInTitleEditMode = true;
    setTimeout(() => {
      document.getElementById('nameInput').focus();
    }, 100);

  }

  leaveTitleEditMode(saved?: boolean): void {
    this.isInTitleEditMode = false;
    this.eventService.focusOnInput = false;
    if (!saved) {
      const msg = this.translateService.instant('content.not-updated-content-group');
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
    }
  }

  updateURL(): void {
    this.location.replaceState(`${this.baseURL}${this.room.shortId}/group/${this.collectionName}`);
  }

  saveGroupName(): void {
    if (this.updatedName !== this.collectionName) {
      const newGroup = new ContentGroup();
      newGroup.roomId = this.contentGroup.roomId;
      newGroup.contentIds = this.contentGroup.contentIds;
      this.contentGroupService.delete(this.contentGroup).subscribe(() => {
        newGroup.name = this.updatedName;
        this.contentGroupService.post(this.room.id, this.updatedName, newGroup).subscribe(postedContentGroup => {
          this.contentGroup = postedContentGroup;
          this.contentGroupService.updateGroupInMemoryStorage(this.collectionName, this.updatedName);
          this.collectionName = postedContentGroup.name;
          this.translateService.get('content.updated-content-group').subscribe(msg => {
            this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
          });
          this.updateURL();
        });
      });
    }
    this.leaveTitleEditMode(true);
  }

  createCopy() {
    this.copiedContents = this.contents.map(content => ({ ...content }));
  }

  goInSortingMode(): void {
    this.createCopy();
    this.isInSortingMode = true;
  }

  leaveSortingMode(): void {
    this.isInSortingMode = false;
  }

  saveSorting(): void {
    const newContentIdOrder = this.copiedContents.map(c => c.id);
    if (this.contentGroup.contentIds !== newContentIdOrder) {
      this.contentGroup.contentIds = newContentIdOrder;
      this.contentGroup.autoSort = false;
      this.contentGroupService.updateGroup(this.contentGroup.roomId, this.contentGroup.name, this.contentGroup).
      subscribe(postedContentGroup => {
        this.contentGroup = postedContentGroup;
        this.contents = this.copiedContents;
        this.initContentList(this.contents);
        this.translateService.get('content.updated-sorting').subscribe(msg => {
          this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
        });
        this.leaveSortingMode();
      });
    }
  }

  lockContents() {
    for (const content of this.contents) {
      this.lockContent(content, this.unlocked);
    }
  }

  lockContent(content: Content, unlocked?: boolean) {
    if (unlocked !== undefined) {
      content.state.visible = unlocked;
    } else {
      content.state.visible = !content.state.visible;
    }
    this.contentService.changeState(content).subscribe(updatedContent => content = updatedContent);
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

  toggleDirectAnswer(content: Content, directAnswer?: boolean) {
    if (directAnswer !== undefined) {
      content.state.responsesVisible = directAnswer;
    } else {
      content.state.responsesVisible = !content.state.responsesVisible;
    }
    this.contentService.changeState(content).subscribe(updatedContent => content = updatedContent);
  }

  toggleDirectAnswers() {
    for (const content of this.contents) {
      this.toggleDirectAnswer(content, this.directAnswer);
    }
  }

  drop(event: CdkDragDrop<Content[]>) {
    moveItemInArray(this.copiedContents, event.previousIndex, event.currentIndex);
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
      this.router.navigate([`/creator/room/${this.room.shortId}/group/${this.contentGroup.name}/statistics/${index + 1}`]);
    }
  }
}
