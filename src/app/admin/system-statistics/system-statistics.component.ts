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
import { debounceTime, map, Subject } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

export interface AdminStats {
  userProfile?: object;
  room?: object;
  contentGroup?: object;
  content?: object;
  answer?: object;
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

  shouldInitTabs$ = new Subject<void>();

  constructor() {
    this.shouldInitTabs$
      .pipe(debounceTime(100))
      .subscribe(() => this.initTabs());
    effect(() => {
      if (this.userStats()) {
        this.core4Stats.userProfile = this.userStats() ?? {};
      }
      if (this.roomStats()) {
        this.core4Stats.room = this.roomStats() ?? {};
      }
      if (this.announcementStats()) {
        this.core4Stats.announcement = this.announcementStats() ?? {};
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
        this.core3Stats.comment = stats.commentServiceStats;
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
