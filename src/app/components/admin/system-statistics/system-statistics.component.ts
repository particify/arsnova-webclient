import { Component } from '@angular/core';
import { SystemInfoService } from '../../../services/http/system-info.service';

@Component({
  selector: 'app-system-statistics',
  templateUrl: './system-statistics.component.html',
  styleUrls: ['./system-statistics.component.scss']
})
export class SystemStatisticsComponent {
  stats: any;

  constructor(
    protected systemInfoService: SystemInfoService
  ) {
  }

  ngOnInit() {
    this.stats = this.getStats();
  }

  getStats() {
    return this.systemInfoService.getStats();
  }
}
