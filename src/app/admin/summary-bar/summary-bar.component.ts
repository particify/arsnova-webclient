import { Component, Input } from '@angular/core';
import {
  SummarizedStats,
  SystemInfoService,
} from '@app/core/services/http/system-info.service';
import { share } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { SystemHealth } from '@app/admin/_models/system-health';

@Component({
  selector: 'app-admin-summary-bar',
  templateUrl: './summary-bar.component.html',
  styleUrls: ['./summary-bar.component.scss'],
  standalone: false,
})
export class SummaryBarComponent {
  @Input({ required: true }) healthInfo!: Observable<SystemHealth>;
  stats: Observable<SummarizedStats>;

  constructor(protected systemInfoService: SystemInfoService) {
    this.stats = this.getStats();
  }

  getStats() {
    return this.systemInfoService.getSummarizedStats().pipe(share());
  }
}
