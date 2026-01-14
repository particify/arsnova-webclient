import {
  Component,
  Input,
  OnInit,
  computed,
  effect,
  inject,
} from '@angular/core';
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
import { AdminStatsGql } from '@gql/generated/graphql';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

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
    comment: object
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
  private core4Stats = inject(AdminStatsGql);

  // Route data input below
  @Input({ required: true }) tenantId!: string;

  stats?: AdminStats;
  isLoading = true;
  showDetails = false;
  selectedTab = 0;
  tabs: string[] = [];

  adminStats = toSignal(this.core4Stats.fetch().pipe(map((s) => s.data)));
  roomStats = computed(() => this.adminStats()?.adminRoomStats);
  userStats = computed(() => this.adminStats()?.adminUserStats);
  announcementStats = computed(() => this.adminStats()?.adminAnnouncementStats);

  constructor() {
    effect(() => {
      if (this.userStats()) {
        if (this.stats) {
          this.stats.userProfile = this.userStats() ?? {};
        }
      }
      if (this.roomStats()) {
        if (this.stats) {
          this.stats.room = this.roomStats() ?? {};
        }
      }
      if (this.announcementStats()) {
        if (this.stats) {
          this.stats.announcement = this.announcementStats() ?? {};
        }
      }
    });
  }

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
    this.systemInfoService.getCore3Stats(tenantId).subscribe((stats) => {
      this.stats = new AdminStats(
        this.userStats() ?? {},
        this.roomStats() ?? {},
        stats?.contentGroup,
        stats?.content,
        stats?.answer,
        stats?.contentGroupTemplate,
        stats?.contentTemplate,
        stats?.violationReport,
        this.announcementStats() ?? {},
        stats['commentServiceStats']
      );
      this.initTabs();
      this.isLoading = false;
    });
  }

  initTabs() {
    this.tabs = [];
    if (!this.stats) {
      return;
    }
    Object.keys(this.stats).forEach((key) => {
      if (this.stats) {
        if (this.stats[key as keyof AdminStats]) {
          this.tabs.push(key);
        }
      }
    });
  }

  getStats(key: string) {
    if (this.stats) {
      return this.stats[key as keyof AdminStats];
    }
    return {};
  }
}
