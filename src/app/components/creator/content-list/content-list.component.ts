import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ContentService } from '../../../services/http/content.service';
import { Content } from '../../../models/content';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ContentChoice } from '../../../models/content-choice';
import { ContentText } from '../../../models/content-text';
import { ContentType } from '../../../models/content-type.enum';
import { ContentGroup } from '../../../models/content-group';
import { NotificationService } from '../../../services/util/notification.service';
import { Room } from '../../../models/room';
import { RoomService } from '../../../services/http/room.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { DialogService } from '../../../services/util/dialog.service';
import { GlobalStorageService, MemoryStorageKey, LocalStorageKey } from '../../../services/util/global-storage.service';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { User } from '../../../models/user';
import { UserRole } from '../../../models/user-roles.enum';
import { ContentGroupService } from '../../../services/http/content-group.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-content-list',
  templateUrl: './content-list.component.html',
  styleUrls: ['./content-list.component.scss']
})


export class ContentListComponent implements OnInit {

  @ViewChild('nameInput', { static: true }) nameInput: ElementRef;

  contents: Content[];
  contentBackup: Content;
  contentCBackup: ContentChoice;
  roomId: string;
  contentGroup: ContentGroup;
  room: Room;
  isLoading = true;
  collectionName: string;
  labelMaxLength: number;
  labels: string[] = [];
  deviceType: string;
  isTitleEdit = false;
  updatedName: string;
  baseURL = 'creator/room/';
  allowEditing = true;
  contentGroups: string[] = [];
  currentGroupIndex: number;
  unlocked = false;
  directAnswer = false;
  isFakeGroup = false;

  constructor(
    private contentService: ContentService,
    private roomService: RoomService,
    private route: ActivatedRoute,
    private location: Location,
    private notificationService: NotificationService,
    private translateService: TranslateService,
    protected langService: LanguageService,
    private dialogService: DialogService,
    private globalStorageService: GlobalStorageService,
    private contentGroupService: ContentGroupService
  ) {
    this.deviceType = this.globalStorageService.getMemoryItem(MemoryStorageKey.DEVICE_TYPE);
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.room = data.room;
      this.route.params.subscribe(params => {
        this.collectionName = params['contentGroup'];
        this.globalStorageService.setMemoryItem(MemoryStorageKey.LAST_GROUP, this.collectionName);
        if (this.collectionName !== 'Contents without a collection') {
          this.roomService.getGroupByRoomIdAndName(this.room.id, this.collectionName).subscribe(group => {
            this.contentGroup = group;
            this.contentService.getContentsByIds(this.contentGroup.contentIds).subscribe(contents => {
              this.initContentList(contents);
            });
          });
        } else {
          this.isFakeGroup = true;
          this.contentGroup = new ContentGroup();
          this.contentGroup.name = 'Contents without a collection';
          this.contentGroup.roomId = this.room.id;
          this.contentService.findContentsWithoutGroup(this.room.id).subscribe(contents => {
            this.initContentList(contents);
          });
        }
      });
    });
    this.labelMaxLength = innerWidth / 20;
    this.translateService.use(this.globalStorageService.getLocalStorageItem(LocalStorageKey.LANGUAGE));
  }

  initContentList(contentList: Content[]) {
    this.contents = contentList;
    for (let i = 0; i < this.contents.length; i++) {
      if (this.contents[i].state.visible) {
        this.unlocked = true;
      }
      if (this.contents[i].state.responsesVisible) {
        this.directAnswer = true;
      }
      if (this.contents[i].subject.length > this.labelMaxLength) {
        this.labels[i] = this.contents[i].subject.substr(0, this.labelMaxLength) + '..';
      } else {
        this.labels[i] = this.contents[i].subject;
      }
    }
    this.getGroups();
    this.isLoading = false;
  }

  getGroups(): void {
    this.contentGroups = this.globalStorageService.getMemoryItem(MemoryStorageKey.CONTENT_GROUPS);
    if (!this.contentGroups) {
      this.roomService.getStats(this.room.id).subscribe(roomStats => {
        if (roomStats.groupStats) {
          this.contentGroups = roomStats.groupStats.map(stat => stat.groupName);
        }
      });
    }
    if (this.contentGroups && this.contentGroups.length > 0) {
      for (let i = 0; i < this.contentGroups.length; i++) {
        if (this.contentGroups[i] === this.contentGroup.name) {
          this.currentGroupIndex = i;
        }
      }
    }
  }

  findIndexOfSubject(subject: string): number {
    let index = -1;
    for (let i = 0; i < this.contents.length; i++) {
      if (this.contents[i].subject.valueOf() === subject.valueOf()) {
        index = i;
        break;
      }
    }
    return index;
  }

  createChoiceContentBackup(content: ContentChoice) {
    this.contentCBackup = new ContentChoice(
      content.id,
      content.revision,
      content.roomId,
      content.subject,
      content.body,
      content.groups,
      content.options,
      content.correctOptionIndexes,
      content.multiple,
      content.format,
      content.state
    );
  }

  createTextContentBackup(content: ContentText) {
    this.contentBackup = new ContentText(
      content.id,
      content.revision,
      content.roomId,
      content.subject,
      content.body,
      [],
      content.state
    );
  }

  deleteContent(delContent: Content) {
    const index = this.findIndexOfSubject(delContent.subject);
    this.createChoiceContentBackup(delContent as ContentChoice);
    const dialogRef = this.dialogService.openDeleteDialog('really-delete-content', delContent.subject);
    dialogRef.afterClosed().subscribe(result => {
      this.updateContentChanges(index, result);
    });
  }

  editContent(edContent: Content) {
    if (edContent.format === ContentType.TEXT) {
      this.createTextContentBackup(edContent as ContentText);
    } else {
      this.createChoiceContentBackup(edContent as ContentChoice);
    }
    const index = this.findIndexOfSubject(edContent.subject);
    const dialogRef = this.dialogService.openContentEditDialog(this.contentCBackup);
    dialogRef.afterClosed()
      .subscribe(result => {
        this.updateContentChanges(index, result);
      });
  }

  updateContentChanges(index: number, action: string) {
    if (!action) {
      this.contents[index] = this.contentCBackup;
    } else {
      switch (action.valueOf()) {
        case 'delete':
          this.translateService.get('content.content-deleted').subscribe(message => {
            this.notificationService.show(message);
          });
          this.contentService.deleteContent(this.contents[index].id).subscribe();
          this.contents.splice(index, 1);
          this.labels.splice(index, 1);
          if (this.contents.length === 0) {
            this.globalStorageService.setMemoryItem(MemoryStorageKey.LAST_GROUP, this.contentGroups[0]);
            this.location.back();
          }
          break;
        case 'update':
          this.contents[index] = this.contentCBackup;
          this.labels[index] = this.contentCBackup.subject;
          this.contentService.updateContent(this.contents[index]).subscribe();
          this.translateService.get('content.content-updated').subscribe(message => {
            this.notificationService.show(message);
          });
          break;
        case 'abort':
          this.contents[index] = this.contentCBackup;
          break;
      }
    }
  }

  goInEditMode(): void {
    this.updatedName = this.collectionName;
    this.isTitleEdit = true;
    this.nameInput.nativeElement.focus();
  }

  leaveEditMode(): void {
    this.isTitleEdit = false;
  }

  updateURL(): void {
    this.location.replaceState(`${this.baseURL}${this.room.shortId}/group/${this.collectionName}`);
  }

  saveGroupName(): void {
    if (this.updatedName !== this.collectionName) {
      this.contentGroup.name = this.updatedName;
      if (!this.isFakeGroup) {
        this.roomService.updateGroup(this.room.id, this.updatedName, this.contentGroup).subscribe(() => {
        this.contentGroupService.updateGroupInMemoryStorage(this.collectionName, this.updatedName);
          this.collectionName = this.updatedName;
          this.translateService.get('content.updated-content-group').subscribe(msg => {
            this.notificationService.show(msg);
          });
          this.updateURL();
        });
      } else {
        this.contentGroup.contentIds = this.contents.map(c => c.id);
        this.contentGroupService.post(this.room.id, this.contentGroup.name, this.contentGroup).subscribe(
          cg => {
            this.collectionName = cg.name;
            this.contentGroup = cg;
            this.isFakeGroup = false;
            this.translateService.get('content.updated-content-group').subscribe(msg => {
              this.notificationService.show(msg);
            });
            this.updateURL();
          }, error => {
            this.translateService.get('content.content-group-update-failed').subscribe(msg => {
              this.notificationService.show(msg);
            });
          }
        );
      }
    }
    this.leaveEditMode();
  }

  addToContentGroup(contentId: string, cgName: string, newGroup: boolean): void {
    this.roomService.addContentToGroup(this.roomId, cgName, contentId).subscribe(() => {
      if (!newGroup) {
        this.translateService.get('content.added-to-content-group').subscribe(msg => {
          this.notificationService.show(msg);
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
}
