import { Component, OnInit } from '@angular/core';
import { ContentService } from '../../../services/http/content.service';
import { Content } from '../../../models/content';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ContentChoice } from '../../../models/content-choice';
import { NotificationService } from '../../../services/util/notification.service';
import { Room } from '../../../models/room';
import { RoomService } from '../../../services/http/room.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { DialogService } from '../../../services/util/dialog.service';
import { GlobalStorageService, MemoryStorageKey, LocalStorageKey } from '../../../services/util/global-storage.service';
import { ContentListComponent } from '../content-list/content-list.component';

@Component({
  selector: 'app-loose-content',
  templateUrl: './loose-content.component.html',
  styleUrls: ['./loose-content.component.scss']
})


export class LooseContentComponent extends ContentListComponent implements OnInit {

  contents: Content[];
  room: Room;
  isLoading = true;
  labelMaxLength: number;
  labels: string[] = [];
  deviceType: string;
  contentGroups: string[] = [];
  currentGroupIndex: number;
  contentBackup: Content;
  contentCBackup: ContentChoice;

  constructor(
    protected contentService: ContentService,
    protected roomService: RoomService,
    protected route: ActivatedRoute,
    protected location: Location,
    protected notificationService: NotificationService,
    protected translateService: TranslateService,
    protected langService: LanguageService,
    protected dialogService: DialogService,
    protected globalStorageService: GlobalStorageService
  ) {
    super(contentService, roomService, route, location, notificationService, translateService, langService, dialogService,
      globalStorageService);
    this.deviceType = this.globalStorageService.getMemoryItem(MemoryStorageKey.DEVICE_TYPE);
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.room = data.room;
      this.contentService.findContentsWithoutGroup(this.room.id).subscribe(contents => {
        this.initContentList(contents);
      });
      this.labelMaxLength = innerWidth / 20;
      this.translateService.use(this.globalStorageService.getLocalStorageItem(LocalStorageKey.LANGUAGE));
    });
  }

  initContentList(contentList: Content[]) {
    this.contents = contentList;
    for (let i = 0; i < this.contents.length; i++) {
      if (this.contents[i].subject.length > this.labelMaxLength) {
        this.labels[i] = this.contents[i].subject.substr(0, this.labelMaxLength) + '..';
      } else {
        this.labels[i] = this.contents[i].subject;
      }
    }
    this.getGroups();
    this.isLoading = false;
  }

  createContentGroupWithLooseContents() {
    const dialogRef = this.dialogService.openContentGroupCreationDialog();
    dialogRef.afterClosed().subscribe(name => {
      if (name) {
        // Create CG with 'name' as name and ids of all contents
      }
    });
  }
}
