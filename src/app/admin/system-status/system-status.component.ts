import { Component, OnInit, inject } from '@angular/core';
import { catchError, of, shareReplay } from 'rxjs';
import { SystemInfoService } from '@app/core/services/http/system-info.service';
import { AdminPageHeaderComponent } from '../admin-page-header/admin-page-header.component';
import { LoadingIndicatorComponent } from '../../standalone/loading-indicator/loading-indicator.component';
import { MatCard } from '@angular/material/card';
import {
  MatTable,
  MatColumnDef,
  MatCellDef,
  MatCell,
  MatRowDef,
  MatRow,
} from '@angular/material/table';
import { HealthStatusComponent } from '../health-status/health-status.component';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { LowerCasePipe, JsonPipe, KeyValuePipe } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-system-status',
  templateUrl: './system-status.component.html',
  styleUrls: ['./system-status.component.scss'],
  imports: [
    AdminPageHeaderComponent,
    LoadingIndicatorComponent,
    MatCard,
    MatTable,
    MatColumnDef,
    MatCellDef,
    MatCell,
    HealthStatusComponent,
    MatIcon,
    MatTooltip,
    MatRowDef,
    MatRow,
    LowerCasePipe,
    JsonPipe,
    KeyValuePipe,
    TranslocoPipe,
  ],
})
export class SystemStatusComponent implements OnInit {
  protected systemInfoService = inject(SystemInfoService);

  // TODO: non-null assertion operator is used here temporaly. We need to use a resolver here to move async logic out of component.
  dataSource!: object;
  isLoading = true;

  ngOnInit() {
    this.systemInfoService
      .getHealthInfo()
      .pipe(
        catchError((response) => of(response.error)),
        shareReplay()
      )
      .subscribe((healthInfo) => {
        this.dataSource = healthInfo?.details;
        this.isLoading = false;
      });
  }
}
