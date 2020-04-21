import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Content } from '../../../models/content';
import { ContentService } from '../../../services/http/content.service';
import { RoomService } from '../../../services/http/room.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { NotificationService } from '../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { DialogService } from '../../../services/util/dialog.service';
import { GlobalStorageService, LocalStorageKey, MemoryStorageKey } from '../../../services/util/global-storage.service';
import { ContentGroupService } from '../../../services/http/content-group.service';
import { ContentListComponent } from '../content-list/content-list.component';
import { ContentGroup } from '../../../models/content-group';

@Component({
  selector: 'app-group-content',
  templateUrl: './group-content.component.html',
  styleUrls: ['./group-content.component.scss']
})
export class GroupContentComponent extends ContentListComponent implements OnInit {

  @ViewChild('nameInput', { static: true }) nameInput: ElementRef;

  collectionName: string;
  isTitleEdit = false;
  updatedName: string;
  baseURL = 'creator/room/';
  unlocked = false;
  directAnswer = false;

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
    protected contentGroupService: ContentGroupService
  ) {
    super(contentService, roomService, route, location, notificationService, translateService, langService, dialogService,
    globalStorageService, contentGroupService);
    this.deviceType = this.globalStorageService.getMemoryItem(MemoryStorageKey.DEVICE_TYPE);
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.room = data.room;
      this.route.params.subscribe(params => {
        this.collectionName = params['contentGroup'];
        this.globalStorageService.setMemoryItem(MemoryStorageKey.LAST_GROUP, this.collectionName);
        this.roomService.getGroupByRoomIdAndName(this.room.id, this.collectionName).subscribe(group => {
          this.contentGroup = group;
          this.contentService.getContentsByIds(this.contentGroup.contentIds).subscribe(contents => {
            this.initContentList(contents);
          });
        });
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
      const oldGroup = new ContentGroup();
      oldGroup.id = this.contentGroup.id;
      oldGroup.revision = this.contentGroup.revision;
      oldGroup.roomId = this.contentGroup.roomId;
      oldGroup.name = this.contentGroup.name;
      this.contentGroupService.delete(oldGroup).subscribe(() => {
        this.contentGroup.name = this.updatedName;
        this.contentGroupService.post(this.room.id, this.updatedName, this.contentGroup).subscribe(() => {
          this.contentGroupService.updateGroupInMemoryStorage(this.collectionName, this.updatedName);
          this.collectionName = this.updatedName;
          this.translateService.get('content.updated-content-group').subscribe(msg => {
            this.notificationService.show(msg);
          });
          this.updateURL();
        });
      });
    }
    this.leaveEditMode();
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
