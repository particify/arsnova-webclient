import { Component, OnInit } from '@angular/core';
import { SystemInfoService } from '../../../services/http/system-info.service';

export class AdminStats {
  userProfile: object;
  room: object;
  contentGroup: object;
  content: object;
  answer: object;
  announcement: object;
  comment: object;
  summary: object;

  constructor(
    userProfile: object,
    room: object,
    contentGroup: object,
    content: object,
    answer: object,
    announcement: object,
    comment: object,
    summary: object
  ) {
    this.userProfile = userProfile;
    this.room = room;
    this.contentGroup = contentGroup;
    this.content = content;
    this.answer = answer;
    this.announcement = announcement;
    this.comment = comment;
    this.summary = summary;
  }
}

@Component({
  selector: 'app-system-statistics',
  templateUrl: './system-statistics.component.html',
  styleUrls: ['../admin-styles.scss'],
})
export class SystemStatisticsComponent implements OnInit {
  stats: AdminStats;
  isLoading = true;
  showDetails = false;
  selectedTab = 0;
  tabs: string[] = [];

  constructor(protected systemInfoService: SystemInfoService) {}

  ngOnInit() {
    this.systemInfoService.getServiceStats().subscribe((stats) => {
      const coreStats = stats['coreServiceStats'];
      this.stats = new AdminStats(
        coreStats?.userProfile,
        coreStats?.room,
        coreStats?.contentGroup,
        coreStats?.content,
        coreStats?.answer,
        coreStats?.announcement,
        stats['commentServiceStats'],
        stats
      );
      this.initTabs();
      this.isLoading = false;
    });
  }

  initTabs() {
    Object.keys(this.stats).forEach((key) => {
      if (this.stats[key]) {
        this.tabs.push(key);
      }
    });
  }
}
