import { Component, OnInit } from '@angular/core';
import { SystemInfoService } from '../../../services/http/system-info.service';

@Component({
  selector: 'app-system-statistics',
  templateUrl: './system-statistics.component.html',
  styleUrls: ['../admin-styles.scss'],
})
export class SystemStatisticsComponent implements OnInit {
  stats: object;
  isLoading = true;

  constructor(protected systemInfoService: SystemInfoService) {}

  ngOnInit() {
    this.systemInfoService.getServiceStats().subscribe((stats) => {
      this.stats = stats;
      this.isLoading = false;
    });
  }
}
