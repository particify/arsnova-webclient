import { Component, Input } from '@angular/core';
import { HealthStatus } from '@app/admin/_models/health-status.enum';
import { MatIcon } from '@angular/material/icon';
import { LowerCasePipe } from '@angular/common';

@Component({
  selector: 'app-health-status',
  templateUrl: './health-status.component.html',
  styleUrls: ['./health-status.component.scss'],
  imports: [MatIcon, LowerCasePipe],
})
export class HealthStatusComponent {
  @Input() status?: HealthStatus;
  HealthStatus = HealthStatus;
}
