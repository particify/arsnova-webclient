import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoomService } from '../../../services/http/room.service';
import { ContentGroup } from '../../../models/content-group';
import { Room } from '../../../models/room';
import { MatTabGroup } from '@angular/material/tabs';
import { DialogService } from '../../../services/util/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalStorageService, MemoryStorageKey } from '../../../services/util/global-storage.service';
import { AnnounceService } from '../../../services/util/announce.service';


@Component({
  selector: 'app-statistics',
  templateUrl: './statistics-page.component.html',
  styleUrls: ['./statistics-page.component.scss']
})

export class StatisticsPageComponent implements OnInit {

  room: Room;
  contentGroups: ContentGroup[] = [];
  isLoading = true;
  lastGroup: string;

  @ViewChild(MatTabGroup) tabGroup: MatTabGroup;

  constructor(private route: ActivatedRoute,
              private roomService: RoomService,
              private dialogService: DialogService,
              private announceService: AnnounceService,
              private translateService: TranslateService,
              private globalStorageService: GlobalStorageService
  ) {
  }

  ngOnInit(): void {
    this.lastGroup = this.globalStorageService.getMemoryItem(MemoryStorageKey.LAST_GROUP);
    this.route.data.subscribe(data => {
      this.getContentGroups(data.room.id);
    });
  }

  getContentGroups(id: string): void {
    this.roomService.getStats(id).subscribe(roomStats => {
      let lastGroupIndex = 0;
      const contentGroupsLength = roomStats.groupStats.length;
      for (let i = 0; i < contentGroupsLength; i++) {
        this.roomService.getGroupByRoomIdAndName(id, roomStats.groupStats[i].groupName).subscribe(group => {
          this.contentGroups.push(group);
          if (this.lastGroup && this.lastGroup === group.name) {
            lastGroupIndex = i;
          }
          if (i === contentGroupsLength - 1) {
            this.isLoading = false;
            setTimeout(() => {
              this.tabGroup.selectedIndex = lastGroupIndex;
            }, 100);
          }
        });
      }
      setTimeout(() => {
        document.getElementById('message-button').focus();
      }, 700);
    });
  }

  announce() {
    this.announceService.announce('statistic.a11y-shortcuts-overview');
  }

  showHelp(): void {
    this.dialogService.openStatisticHelpDialog();
  }
}
