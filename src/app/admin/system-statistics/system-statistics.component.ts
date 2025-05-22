import { Component, Input, OnInit, inject } from '@angular/core';
import { SystemInfoService } from '@app/core/services/http/system-info.service';
import { ActivatedRoute } from '@angular/router';
import { FlexModule } from '@angular/flex-layout';
import { AdminPageHeaderComponent } from '@app/admin/admin-page-header/admin-page-header.component';
import { ExtensionPointComponent } from '@projects/extension-point/src/lib/extension-point.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatCard } from '@angular/material/card';
import { EntityPropertiesComponent } from '@app/admin/entity-properties/entity-properties.component';
import { TranslocoPipe } from '@jsverse/transloco';

export class AdminStats {
  userProfile: object;
  room: object;
  contentGroup: object;
  content: object;
  answer: object;
  contentGroupTemplate: object;
  contentTemplate: object;
  violationReport: object;
  announcement: object;
  comment: object;
  summary: object;

  constructor(
    userProfile: object,
    room: object,
    contentGroup: object,
    content: object,
    answer: object,
    contentGroupTemplate: object,
    contentTemplate: object,
    violationReport: object,
    announcement: object,
    comment: object,
    summary: object
  ) {
    this.userProfile = userProfile;
    this.room = room;
    this.contentGroup = contentGroup;
    this.content = content;
    this.answer = answer;
    this.contentGroupTemplate = contentGroupTemplate;
    this.contentTemplate = contentTemplate;
    this.violationReport = violationReport;
    this.announcement = announcement;
    this.comment = comment;
    this.summary = summary;
  }
}

@Component({
  selector: 'app-system-statistics',
  templateUrl: './system-statistics.component.html',
  styleUrls: ['../admin-styles.scss'],
  imports: [
    FlexModule,
    AdminPageHeaderComponent,
    ExtensionPointComponent,
    LoadingIndicatorComponent,
    MatTabGroup,
    MatTab,
    MatCard,
    EntityPropertiesComponent,
    TranslocoPipe,
  ],
})
export class SystemStatisticsComponent implements OnInit {
  protected systemInfoService = inject(SystemInfoService);
  private route = inject(ActivatedRoute);

  // Route data input below
  @Input({ required: true }) tenantId!: string;

  // TODO: non-null assertion operator is used here temporaly. We need to use a resolver here to move async logic out of component.
  stats!: AdminStats;
  isLoading = true;
  showDetails = false;
  selectedTab = 0;
  tabs: string[] = [];

  ngOnInit() {
    this.loadStats(this.tenantId);
    this.route.params.subscribe((params) => {
      const newTenantId = params.tenantId;
      if (newTenantId !== this.tenantId) {
        this.tenantId = newTenantId;
        this.loadStats(this.tenantId);
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
        coreStats?.contentGroupTemplate,
        coreStats?.contentTemplate,
        coreStats?.violationReport,
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
