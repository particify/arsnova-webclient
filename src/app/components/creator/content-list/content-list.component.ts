import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ContentService } from '../../../services/http/content.service';
import { Content } from '../../../models/content';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ContentChoice } from '../../../models/content-choice';
import { ContentText } from '../../../models/content-text';
import { ContentType } from '../../../models/content-type.enum';
import { ContentGroup } from '../../../models/content-group';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../../services/util/notification.service';
import { Room } from '../../../models/room';
import { RoomService } from '../../../services/http/room.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { ContentDeleteComponent } from '../_dialogs/content-delete/content-delete.component';
import { ContentEditComponent } from '../_dialogs/content-edit/content-edit.component';
import { ContentGroupCreationComponent } from '../_dialogs/content-group-creation/content-group-creation.component';

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
  deviceType = localStorage.getItem('deviceType');
  isTitleEdit = false;
  updatedName: string;
  baseURL = 'creator/room/';
  allowEditing = false;
  contentGroups: string[] = [];
  currentGroupIndex: number;
  locked = false;

  constructor(private contentService: ContentService,
              private roomService: RoomService,
              private route: ActivatedRoute,
              private location: Location,
              private notificationService: NotificationService,
              public dialog: MatDialog,
              private translateService: TranslateService,
              protected langService: LanguageService) {
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit() {
    this.labelMaxLength = innerWidth / 20;
    this.roomId = localStorage.getItem('roomId');
    this.roomService.getRoom(this.roomId).subscribe(room => {
      this.room = room;
    });
    this.route.params.subscribe(params => {
      this.collectionName = params['contentGroup'];
      this.roomService.getGroupByRoomIdAndName(this.roomId, this.collectionName).subscribe(group => {
        this.contentGroup = group;
        if (!this.contentGroup) {
          this.contentGroup = JSON.parse(sessionStorage.getItem('lastGroup'));
        } else {
          this.allowEditing = true;
        }
        this.contentService.getContentsByIds(this.contentGroup.contentIds).subscribe(contents => {
          this.contents = contents;
          for (let i = 0; i < this.contents.length; i++) {
            if (!contents[i].state.visible) {
              this.locked = true;
            }
            if (this.contents[i].subject.length > this.labelMaxLength) {
              this.labels[i] = this.contents[i].subject.substr(0, this.labelMaxLength) + '..';
            } else {
              this.labels[i] = this.contents[i].subject;
            }
          }
          this.getGroups();
          this.isLoading = false;
        });
      });
    });
    this.translateService.use(localStorage.getItem('currentLang'));
  }

  getGroups(): void {
    this.contentGroups = JSON.parse(sessionStorage.getItem('contentGroups'));
    if (this.contentGroups.length > 0) {
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
    const dialogRef = this.dialog.open(ContentDeleteComponent, {
      width: '400px'
    });
    dialogRef.componentInstance.content = delContent;
    dialogRef.afterClosed()
      .subscribe(result => {
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
    const dialogRef = this.dialog.open(ContentEditComponent, {
      width: '400px'
    });
    dialogRef.componentInstance.content = this.contentCBackup;
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
    this.location.replaceState(`${this.baseURL}${this.room.shortId}/${this.collectionName}`);
  }

  updateGroupInSessionStorage(oldName: string, newName: string) {
    const groups: string[] = JSON.parse(sessionStorage.getItem('contentGroups'));
    for (let i = 0; i < groups.length; i++) {
      if (groups[i] === oldName) {
        groups[i] = newName;
        sessionStorage.setItem('lastGroup', JSON.stringify(new ContentGroup('', '', groups[i], [], true)));
        break;
      }
    }
    sessionStorage.setItem('contentGroups', JSON.stringify(groups));
  }

  saveGroupName(): void {
    if (this.updatedName !== this.collectionName) {
      this.contentGroup.name = this.updatedName;
      this.roomService.updateGroup(this.room.id, this.updatedName, this.contentGroup).subscribe(() => {
        this.updateGroupInSessionStorage(this.collectionName, this.updatedName);
        this.collectionName = this.updatedName;
        this.translateService.get('content.updated-content-group').subscribe(msg => {
          this.notificationService.show(msg);
        });
        this.updateURL();
      });
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
    const dialogRef = this.dialog.open(ContentGroupCreationComponent, {
      width: '400px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addToContentGroup(contentId, result, true);
      }
    });
  }

  lockContents() {
    for (const content of this.contents) {
      this.lockContent(content, this.locked);
    }
  }

  lockContent(content: Content, locked?: boolean) {
    if (locked !== undefined) {
      content.state.visible = !locked;
    } else {
      content.state.visible = !content.state.visible;
    }
    this.contentService.updateContent(content).subscribe(updatedContent => content = updatedContent);
  }
}
