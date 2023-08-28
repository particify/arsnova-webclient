import { Component, OnInit } from '@angular/core';
import { SystemInfoService } from '@app/core/services/http/system-info.service';
import { ActivatedRoute } from '@angular/router';

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
  isLoading: boolean;
  showDetails = false;
  selectedTab = 0;
  tabs: string[];

  constructor(
    protected systemInfoService: SystemInfoService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    let tenantId = this.route.snapshot.params['tenantId'];
    this.loadStats(tenantId);
    this.route.params.subscribe((params) => {
      const newTenantId = params.tenantId;
      if (newTenantId !== tenantId) {
        tenantId = newTenantId;
        this.loadStats(tenantId);
      }
    });
  }

  loadStats(tenantId: string) {
    this.isLoading = true;
    this.systemInfoService.getServiceStats(tenantId).subscribe((stats) => {
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
    this.tabs = [];
    Object.keys(this.stats).forEach((key) => {
      if (this.stats[key as keyof AdminStats]) {
        this.tabs.push(key);
      }
    });
  }

  getStats(key: string) {
    return this.stats[key as keyof AdminStats];
  }
}
