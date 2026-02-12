import { Component, Input, computed, inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { SystemHealth } from '@app/admin/_models/system-health';
import { FlexModule } from '@angular/flex-layout';
import { HealthStatusComponent } from '@app/admin/health-status/health-status.component';
import { AsyncPipe } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { AdminStatsGql } from '@gql/generated/graphql';
import { toSignal } from '@angular/core/rxjs-interop';
import { SystemInfoService } from '@app/core/services/http/system-info.service';

@Component({
  selector: 'app-admin-summary-bar',
  templateUrl: './summary-bar.component.html',
  styleUrls: ['./summary-bar.component.scss'],
  imports: [FlexModule, HealthStatusComponent, AsyncPipe, TranslocoPipe],
})
export class SummaryBarComponent {
  private core4AdminStats = inject(AdminStatsGql);
  private systemInfoService = inject(SystemInfoService);

  adminStats = toSignal(this.core4AdminStats.fetch().pipe(map((s) => s.data)));
  roomCount = computed(() => this.adminStats()?.adminRoomStats?.totalCount);
  userCount = computed(() => this.adminStats()?.adminUserStats?.verifiedCount);
  connectedUserCount = toSignal(this.systemInfoService.getConnectedUserCount());

  @Input({ required: true }) healthInfo!: Observable<SystemHealth>;
}
