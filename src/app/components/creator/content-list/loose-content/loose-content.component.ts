import { Component, OnInit } from '@angular/core';
import { ContentService } from '../../../../services/http/content.service';
import { Content } from '../../../../models/content';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { AdvancedSnackBarTypes, NotificationService } from '../../../../services/util/notification.service';
import { Room } from '../../../../models/room';
import { RoomStatsService } from '../../../../services/http/room-stats.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../services/util/language.service';
import { DialogService } from '../../../../services/util/dialog.service';
import { GlobalStorageService, STORAGE_KEYS } from '../../../../services/util/global-storage.service';
import { ContentListBaseComponent } from '../content-list-base.component';
import { ContentGroup } from '../../../../models/content-group';
import { ContentGroupService } from '../../../../services/http/content-group.service';
import { AnnounceService } from '../../../../services/util/announce.service';

@Component({
  selector: 'app-loose-content',
  templateUrl: './loose-content.component.html',
  styleUrls: ['./loose-content.component.scss']
})

export class LooseContentComponent extends ContentListBaseComponent implements OnInit {

  contents: Content[];
  room: Room;
  isLoading = true;
  deviceType: string;
  contentGroups: string[] = [];
  currentGroupIndex: number;
  creationMode = false;
  newName: string;
  creationSelection: boolean[] = [];
  baseURL = 'creator/room/';

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
    protected router: Router
  ) {
    super(contentService, roomStatsService, route, location, notificationService, translateService, langService, dialogService,
      globalStorageService, contentGroupService, announceService, router);
    this.deviceType = this.globalStorageService.getItem(STORAGE_KEYS.DEVICE_TYPE);
    langService.langEmitter.subscribe(lang => translateService.use(lang));
  }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.room = data.room;
      this.contentService.findContentsWithoutGroup(this.room.id).subscribe(contents => {
        this.initContentList(contents);
      });
      this.translateService.use(this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE));
    });
  }

  setSettings() {
    this.creationSelection = new Array<boolean>(this.contents.length);
    this.creationSelection.fill(true);
  }

  goToEdit(content: Content) {
    this.router.navigate(['creator', 'room', this.room.shortId, 'group', 'archive', 'edit', content.id]);
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
          this.contentGroupService.post(newGroup).subscribe(
            group => {
              this.contentGroups.push(group.name);
              this.translateService.get('content.content-group-created').subscribe(string => {
                this.notificationService.showAdvanced(string, AdvancedSnackBarTypes.SUCCESS);
              });
              this.updateURL(group.name);
            }, error => {
              this.translateService.get('content.content-group-update-failed').subscribe(string => {
                this.notificationService.showAdvanced(string, AdvancedSnackBarTypes.FAILED);
              });
            }
          );
        }
      } else {
        this.translateService.get('content.content-group-name-restriction').subscribe(string => {
          this.notificationService.showAdvanced(string, AdvancedSnackBarTypes.WARNING);
        });
      }
    }
  }

  updateURL(name: string): void {
    this.router.navigate([this.baseURL, this.room.shortId, 'group', name]);
  }


  exitCreation() {
    this.creationMode = false;
  }
}
