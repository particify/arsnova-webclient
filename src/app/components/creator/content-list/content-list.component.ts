import { Component, OnInit } from '@angular/core';
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
import { GlobalStorageService, MemoryStorageKey } from '../../../services/util/global-storage.service';
import { ContentGroupService } from '../../../services/http/content-group.service';
import { AnnounceService } from '../../../services/util/announce.service';
import { EventService } from '../../../services/util/event.service';

@Component({
  selector: 'app-content-list',
  templateUrl: './content-list.component.html',
  styleUrls: ['./content-list.component.scss']
})


export class ContentListComponent implements OnInit {

  protected contents: Content[];
  room: Room;
  isLoading = true;
  labelMaxLength: number;
  labels: string[] = [];
  deviceType: string;
  contentBackup: Content;
  protected contentGroup: ContentGroup;
  contentGroups: string[] = [];
  currentGroupIndex: number;

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
    protected announceService: AnnounceService) {
    this.deviceType = this.globalStorageService.getMemoryItem(MemoryStorageKey.DEVICE_TYPE);
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit() {
  }

  initContentList(contentList: Content[]) {
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
    if (this.contentGroups && this.contentGroup && this.contentGroups.length > 0) {
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

  createChoiceContentBackup(content: ContentChoice): Content {
   return new ContentChoice(
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

  createTextContentBackup(content: ContentText): Content {
    return new ContentText(
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
      this.contentBackup = this.createTextContentBackup(edContent as ContentText);
    } else {
      this.contentBackup = this.createChoiceContentBackup(edContent as ContentChoice);
    }
    const index = this.findIndexOfSubject(edContent.subject);
    const dialogRef = this.dialogService.openContentEditDialog(this.contentBackup);
    dialogRef.afterClosed()
      .subscribe(result => {
        this.updateContentChanges(index, result);
      });
  }

  updateContentChanges(index: number, action: string) {
    if (!action) {
      this.contents[index] = this.contentBackup;
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
          this.contents[index] = this.contentBackup;
          this.labels[index] = this.contentBackup.subject;
          this.contentService.updateContent(this.contents[index]).subscribe();
          this.translateService.get('content.content-updated').subscribe(message => {
            this.notificationService.show(message);
          });
          break;
        case 'abort':
          this.contents[index] = this.contentBackup;
          break;
      }
    }
  }

  addToContentGroup(contentId: string, cgName: string, newGroup: boolean): void {
    this.contentGroupService.addContentToGroup(this.room.id, cgName, contentId).subscribe(() => {
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
}
