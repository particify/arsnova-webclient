import { Component, OnInit } from '@angular/core';
import { SummarizedStats, SystemInfoService } from '../../../services/http/system-info.service';
import { catchError, share } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-admin-summary-bar',
  templateUrl: './summary-bar.component.html',
  styleUrls: ['./summary-bar.component.scss']
})
export class SummaryBarComponent implements OnInit {
  readonly STATUS_UP = 'UP';
  readonly STATUS_DOWN = 'DOWN';
  healthInfo: Observable<any>;
  stats: Observable<SummarizedStats>;

  constructor(
    protected systemInfoService: SystemInfoService
  ) {
  }

  ngOnInit() {
    this.healthInfo = this.getHealthInfo();
    this.stats = this.getStats();
  }

  getHealthInfo() {
    return this.systemInfoService.getHealthInfo().pipe(
      catchError((response) => of(response.error)),
      share()
    );
  }

  getStats() {
    return this.systemInfoService.getSummarizedStats().pipe(
      share()
    );
  }
}
