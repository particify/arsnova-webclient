import { Component } from '@angular/core';
import { SystemInfoService } from '../../../services/http/system-info.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-admin-summary-bar',
  templateUrl: './summary-bar.component.html',
  styleUrls: ['./summary-bar.component.scss']
})
export class SummaryBarComponent {
  readonly STATUS_UP = 'UP';
  readonly STATUS_DOWN = 'DOWN';
  healthInfo: any;
  stats: any;

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
      catchError((response) => of(response.error)
    ));
  }

  getStats() {
    return this.systemInfoService.getStats();
  }
}
