import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { ContentGroup } from '@app/core/models/content-group';
import { StatisticListComponent } from '@app/creator/content-group/statistic-list/statistic-list.component';
import { ContentGroupService } from '@app/core/services/http/content-group.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics-page.component.html',
  styleUrls: ['./statistics-page.component.scss'],
})
export class StatisticsPageComponent {
  shortId: string;
  contentGroups: ContentGroup[] = [];
  isLoading = true;
  // TODO: non-null assertion operator is used here temporaly. We need to use a resolver here to move async logic out of component.
  currentGroup!: ContentGroup;

  @ViewChild(StatisticListComponent) statisticList!: StatisticListComponent;

  constructor(
    private route: ActivatedRoute,
    private roomStatsService: RoomStatsService,
    private contentGroupService: ContentGroupService,
    private router: Router
  ) {
    this.shortId = route.snapshot.data.room.shortId;
    this.getContentGroups(
      route.snapshot.data.room.id,
      route.snapshot.params['seriesName']
    );
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
                (cg) => cg?.contentIds
              );
              this.initCurrentGroup(groupName);
              this.isLoading = false;
            }
          });
      }
    });
  }

  initCurrentGroup(name: string) {
    const group = this.contentGroups.find((cg) => cg.name === name);
    if (group) {
      this.currentGroup = group;
    }
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
    this.router.navigate([
      'edit',
      this.shortId,
      'series',
      this.currentGroup.name,
      'statistics',
    ]);
  }

  showDeleteDialog() {
    this.statisticList.deleteAllAnswers();
  }
}
