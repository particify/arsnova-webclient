import { Component } from '@angular/core';
import { SystemInfoService } from '../../../services/http/system-info.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-system-status',
  templateUrl: './system-status.component.html',
  styleUrls: ['./system-status.component.scss']
})
export class SystemStatusComponent {
  healthInfo: any;

  constructor(
    protected systemInfoService: SystemInfoService
  ) {
  }

  ngOnInit() {
    this.healthInfo = this.getHealthInfo();
  }

  getHealthInfo() {
    return this.systemInfoService.getHealthInfo().pipe(
      catchError((response) => of(response.error)
    ));
  }
}
