import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { ContentGroup } from '@app/core/models/content-group';
import { StatisticListComponent } from '@app/creator/statistic-list/statistic-list.component';
import { ContentGroupService } from '@app/core/services/http/content-group.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics-page.component.html',
  styleUrls: ['./statistics-page.component.scss'],
})
export class StatisticsPageComponent implements OnInit {
  shortId: string;
  contentGroups: ContentGroup[] = [];
  isLoading = true;
  currentGroup: ContentGroup;

  @ViewChild(StatisticListComponent) statisticList: StatisticListComponent;

  constructor(
    private route: ActivatedRoute,
    private roomStatsService: RoomStatsService,
    private contentGroupService: ContentGroupService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.shortId = data.room.shortId;
      this.getContentGroups(
        data.room.id,
        this.route.snapshot.params['seriesName']
      );
    });
  }

  getContentGroups(id: string, groupName: string): void {
    this.roomStatsService.getStats(id, true).subscribe((roomStats) => {
      const contentGroupsLength = roomStats.groupStats.length;
      for (let i = 0; i < contentGroupsLength; i++) {
        this.contentGroupService
          .getById(roomStats.groupStats[i].id, { roomId: id })
          .subscribe((group) => {
            this.contentGroups.push(group);
            if (this.contentGroups.length === contentGroupsLength) {
              this.contentGroups = this.contentGroups.filter(
                (cg) => cg.contentIds?.length > 0
              );
              this.initCurrentGroup(groupName);
              this.isLoading = false;
            }
          });
      }
    });
  }

  initCurrentGroup(routeGroup: string) {
    if (routeGroup) {
      this.setCurrentGroupByName(routeGroup);
    } else {
      this.currentGroup = this.contentGroups[0];
    }
  }

  setCurrentGroupByName(name: string) {
    this.currentGroup = this.contentGroups.find((cg) => cg.name === name);
  }

  updateCollection() {
    if (this.statisticList.contentGroup !== this.currentGroup) {
      this.updateUrl();
      this.statisticList.contentGroup = this.currentGroup;
      this.statisticList.total = this.statisticList.status.empty;
      this.statisticList.getContents();
    }
  }

  updateUrl() {
    const urlList = [
      'edit',
      this.shortId,
      'series',
      this.currentGroup.name,
      'statistics',
    ];
    this.router.navigate(urlList);
  }

  showDeleteDialog() {
    this.statisticList.deleteAllAnswers();
  }
}
