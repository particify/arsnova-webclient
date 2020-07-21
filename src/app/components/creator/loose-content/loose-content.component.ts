import { Component, OnInit } from '@angular/core';
import { ContentService } from '../../../services/http/content.service';
import { Content } from '../../../models/content';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ContentChoice } from '../../../models/content-choice';
import { NotificationService } from '../../../services/util/notification.service';
import { Room } from '../../../models/room';
import { RoomService } from '../../../services/http/room.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/util/language.service';
import { DialogService } from '../../../services/util/dialog.service';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';
import { ContentListComponent } from '../content-list/content-list.component';
import { ContentGroup } from '../../../models/content-group';
import { ContentGroupService } from '../../../services/http/content-group.service';
import { AnnounceService } from '../../../services/util/announce.service';
import { EventService } from '../../../services/util/event.service';

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
  creationMode = false;
  newName: string;
  creationSelection: boolean[] = [];
  baseURL = 'creator/room/';

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
    private router: Router
  ) {
    super(contentService, roomService, route, location, notificationService, translateService, langService, dialogService,
      globalStorageService, contentGroupService, announceService);
    this.deviceType = this.globalStorageService.getItem(STORAGE_KEYS.DEVICE_TYPE);
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.room = data.room;
      this.contentService.findContentsWithoutGroup(this.room.id).subscribe(contents => {
        this.initContentList(contents);
      });
      this.labelMaxLength = innerWidth / 20;
      this.translateService.use(this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE));
    });
  }

  initContentList(contentList: Content[]) {
    this.contents = contentList;
    for (let i = 0; i < this.contents.length; i++) {
      if (this.contents[i].body.length > this.labelMaxLength) {
        this.labels[i] = this.contents[i].body.substr(0, this.labelMaxLength) + '..';
      } else {
        this.labels[i] = this.contents[i].body;
      }
      this.creationSelection[i] = true;
    }
    this.getGroups();
    this.isLoading = false;
    setTimeout(() => {
      document.getElementById('message').focus();
    }, 500);
  }

  createNewGroup() {
    if (!this.creationMode) {
      this.creationMode = true;
      setTimeout(() => {
        document.getElementById('content-group-input').focus();
      }, 500);
    } else {
      if (this.newName !== this.translateService.instant('content.loose-contents')) {
        const newGroup = new ContentGroup();
        newGroup.roomId = this.room.id;
        newGroup.name = this.newName;
        newGroup.contentIds = this.contents
          .map((value, index) => {
            if (this.creationSelection[index]) {
              return value.id;
            }
          })
          .filter(c => c);
        if (newGroup.contentIds.length > 0) {
          this.contentGroupService.post(this.room.id, this.newName, newGroup).subscribe(
            group => {
              this.contentGroups.push(group.name);
              this.translateService.get('content.content-group-update-failed').subscribe(string => {
                this.notificationService.show(string);
              });
              this.updateURL(group.name);
            }, error => {
              this.translateService.get('content.content-group-update-failed').subscribe(string => {
                this.notificationService.show(string);
              });
            }
          );
        }
      } else {
        this.translateService.get('content.new-group-name-restriction').subscribe(string => {
          this.notificationService.show(string);
        });
      }
    }
  }

  updateURL(name: string): void {
    this.router.navigate([`${this.baseURL}${this.room.shortId}/group/${name}`]);
  }


  exitCreation() {
    this.creationMode = false;
  }
}
