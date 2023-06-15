import { Component, Input } from '@angular/core';
import { HealthStatus } from '@app/admin/_models/health-status.enum';

@Component({
  selector: 'app-health-status',
  templateUrl: './health-status.component.html',
  styleUrls: ['./health-status.component.scss'],
})
export class HealthStatusComponent {
  @Input() status: HealthStatus;
  HealthStatus = HealthStatus;
}
