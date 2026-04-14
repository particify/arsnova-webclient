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
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatCard } from '@angular/material/card';
import { EntityPropertiesComponent } from '@app/admin/entity-properties/entity-properties.component';
import { TranslocoPipe } from '@jsverse/transloco';
import { AdminStatsGql } from '@gql/generated/graphql';
import { debounceTime, map, Subject } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { CoreModule } from '@app/core/core.module';
import { StatisticsSummaryComponent } from '@app/admin/statistics-summary/statistics-summary.component';

export interface AdminStats {
  userProfile?: object;
  room?: object;
  contentGroup?: object;
  content?: { [index: string]: number; totalCount: number };
  answer?: { [index: string]: number; totalCount: number };
  contentGroupTemplate?: object;
  contentTemplate?: object;
  violationReport?: object;
  announcement?: object;
  comment?: object;
}

@Component({
  selector: 'app-system-statistics',
  templateUrl: './system-statistics.component.html',
  styleUrls: ['../admin-styles.scss'],
  imports: [
    FlexModule,
    AdminPageHeaderComponent,
    ExtensionPointComponent,
    MatTabGroup,
    MatTab,
    MatCard,
    EntityPropertiesComponent,
    TranslocoPipe,
    CoreModule,
    StatisticsSummaryComponent,
  ],
})
export class SystemStatisticsComponent implements OnInit {
  protected systemInfoService = inject(SystemInfoService);
  private route = inject(ActivatedRoute);
  private core4AdminStats = inject(AdminStatsGql);

  // Route data input below
  @Input({ required: true }) tenantId!: string;

  core3Stats: AdminStats = {};
  core4Stats: AdminStats = {};
  stats: AdminStats = {};
  isLoading = true;
  showDetails = false;
  tabs: string[] = [];

  adminStats = toSignal(this.core4AdminStats.fetch().pipe(map((s) => s.data)));
  roomStats = computed(() => this.adminStats()?.adminRoomStats);
  userStats = computed(() => this.adminStats()?.adminUserStats);
  announcementStats = computed(() => this.adminStats()?.adminAnnouncementStats);
  qnaStats = computed(() => this.adminStats()?.adminQnaStats);

  shouldInitTabs$ = new Subject<void>();

  constructor() {
    this.shouldInitTabs$
      .pipe(debounceTime(100))
      .subscribe(() => this.initTabs());
    effect(() => {
      const userStats = this.userStats();
      const roomStats = this.roomStats();
      const announcementStats = this.announcementStats();
      const qnaStats = this.qnaStats();
      if (userStats) {
        this.core4Stats.userProfile = userStats;
      }
      if (roomStats) {
        this.core4Stats.room = roomStats;
      }
      if (announcementStats) {
        this.core4Stats.announcement = announcementStats;
      }
      if (qnaStats) {
        this.core4Stats.comment = qnaStats;
      }
      this.shouldInitTabs$.next();
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
    this.systemInfoService.getCore3Stats(tenantId).subscribe({
      next: (stats) => {
        this.core3Stats.contentGroup = stats.contentGroup;
        this.core3Stats.content = stats.content;
        this.core3Stats.answer = stats.answer;
        this.core3Stats.contentGroupTemplate = stats.contentGroupTemplate;
        this.core3Stats.contentTemplate = stats.contentTemplate;
        this.core3Stats.violationReport = stats.violationReport;
        this.shouldInitTabs$.next();
      },
    });
  }

  initTabs() {
    this.isLoading = true;
    this.stats = { ...this.core4Stats, ...this.core3Stats };
    this.tabs = [];
    Object.keys(this.stats).forEach((key) => {
      if (this.stats[key as keyof AdminStats]) {
        this.tabs.push(key);
      }
    });
    this.isLoading = false;
  }

  getStats(key: string): object {
    return this.stats[key as keyof AdminStats] ?? {};
  }
}
