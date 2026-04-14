import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Signal,
} from '@angular/core';
import { SystemInfoService } from '@app/core/services/http/system-info.service';
import { FlexModule } from '@angular/flex-layout';
import { TranslocoPipe } from '@jsverse/transloco';
import { AdminStatsGql } from '@gql/generated/graphql';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { CoreModule } from '@app/core/core.module';
import {
  StatisticCardComponent,
  StatTable,
} from '@app/admin/statistic-card/statistic-card.component';

@Component({
  selector: 'app-statistics-summary',
  templateUrl: './statistics-summary.component.html',
  styleUrls: ['../admin-styles.scss', './statistics-summary.component.scss'],
  imports: [FlexModule, TranslocoPipe, CoreModule, StatisticCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsSummaryComponent {
  protected systemInfoService = inject(SystemInfoService);
  private core4AdminStats = inject(AdminStatsGql);

  adminStats = toSignal(this.core4AdminStats.fetch().pipe(map((s) => s.data)));
  roomStats = computed(() => this.adminStats()?.adminRoomStats);
  qnaPostCount = computed(() => this.adminStats()?.adminQnaStats?.postCount);
  connectedUserCount = toSignal(this.systemInfoService.getConnectedUserCount());
  core3Stats = toSignal(this.systemInfoService.getCore3Stats());

  userSummary: Signal<StatTable[]> = computed(() => {
    return [
      {
        name: 'admin.admin-area.managing-users',
        description: 'admin.admin-area.managing-users-description',
        value: this.roomStats()?.managingUserCount,
      },
      {
        name: 'admin.admin-area.participants',
        value: this.roomStats()?.participantCount,
      },
      {
        name: 'admin.admin-area.connected-users',
        description: 'admin.admin-area.connected-users-description',
        value: this.connectedUserCount(),
      },
    ];
  });

  roomSummary: Signal<StatTable[]> = computed(() => {
    return [
      {
        name: 'admin.admin-area.total-rooms',
        value: this.roomStats()?.totalCount,
      },
      {
        name: 'admin.admin-area.room-memberships',
        value: this.roomStats()?.membershipCount,
      },
      {
        name: 'admin.admin-area.active-rooms',
        description: 'admin.admin-area.active-rooms-description',
        value: this.roomStats()?.activeRoomCount,
      },
    ];
  });

  interactionSummary: Signal<StatTable[]> = computed(() => {
    return [
      {
        name: 'admin.admin-area.questions',
        description: 'admin.admin-area.questions-description',
        value: this.core3Stats()?.content.totalCount,
      },
      {
        name: 'admin.admin-area.answers',
        description: 'admin.admin-area.answers-description',
        value: this.core3Stats()?.answer.totalCount,
      },
      {
        name: 'admin.admin-area.qna-posts',
        description: 'admin.admin-area.qna-posts-description',
        value: this.qnaPostCount(),
      },
    ];
  });
}
