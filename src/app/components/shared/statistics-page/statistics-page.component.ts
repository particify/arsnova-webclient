import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoomStatsService } from '../../../services/http/room-stats.service';
import { ContentGroup } from '../../../models/content-group';
import { Room } from '../../../models/room';
import { TranslateService } from '@ngx-translate/core';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';
import { AnnounceService } from '../../../services/util/announce.service';
import { StatisticListComponent } from '../statistic-list/statistic-list.component';
import { ContentGroupService } from '../../../services/http/content-group.service';


@Component({
  selector: 'app-statistics',
  templateUrl: './statistics-page.component.html',
  styleUrls: ['./statistics-page.component.scss']
})

export class StatisticsPageComponent implements OnInit {

  room: Room;
  contentGroups: ContentGroup[] = [];
  isLoading = true;
  currentGroup: ContentGroup;

  @ViewChild(StatisticListComponent) statisticList: StatisticListComponent;

  constructor(private route: ActivatedRoute,
              private roomStatsService: RoomStatsService,
              private contentGroupService: ContentGroupService,
              private announceService: AnnounceService,
              private translateService: TranslateService,
              private globalStorageService: GlobalStorageService
  ) {
  }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.getContentGroups(data.room.id);
    });
  }

  getContentGroups(id: string): void {
    this.roomStatsService.getStats(id, true).subscribe(roomStats => {
      const contentGroupsLength = roomStats.groupStats.length;
      for (let i = 0; i < contentGroupsLength; i++) {
        this.contentGroupService.getById(roomStats.groupStats[i].id, { roomId: id}).subscribe(group => {
          this.contentGroups.push(group);
          if (this.contentGroups.length === contentGroupsLength) {
            this.initCurrentGroup();
            this.isLoading = false;
          }
        });
      }
      setTimeout(() => {
        document.getElementById('message-button').focus();
      }, 700);
    });
  }

  initCurrentGroup() {
    const lastGroup = this.globalStorageService.getItem(STORAGE_KEYS.LAST_GROUP);
    if (lastGroup) {
      this.setCurrentGroupByName(lastGroup);
    } else {
      this.currentGroup = this.contentGroups[0];
    }
  }

  setCurrentGroupByName(name: string) {
    this.currentGroup = this.contentGroups.find(cg => cg.name === name);
  }

  updateCollection() {
    if (this.statisticList.contentGroup !== this.currentGroup) {
      this.statisticList.contentGroup = this.currentGroup;
      this.statisticList.total = this.statisticList.status.empty;
      this.statisticList.getContents();
    }
  }

  showDeleteDialog() {
    this.statisticList.showDeleteAnswerDialog();
  }

  announce() {
    this.announceService.announce('statistic.a11y-shortcuts-overview');
  }
}
