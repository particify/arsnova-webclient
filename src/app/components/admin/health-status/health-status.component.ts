import { Component, Input } from '@angular/core';

enum HealthStatus {
  UP = 'UP',
  DOWN = 'DOWN',
}

@Component({
  selector: 'app-health-status',
  templateUrl: './health-status.component.html',
  styleUrls: ['./health-status.component.scss'],
})
export class HealthStatusComponent {
  @Input() status: HealthStatus;
  HealthStatus = HealthStatus;
}
