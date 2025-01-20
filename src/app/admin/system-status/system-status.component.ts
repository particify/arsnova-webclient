import { Component, OnInit } from '@angular/core';
import { catchError, of, shareReplay } from 'rxjs';
import { SystemInfoService } from '@app/core/services/http/system-info.service';

@Component({
  selector: 'app-system-status',
  templateUrl: './system-status.component.html',
  styleUrls: ['./system-status.component.scss'],
  standalone: false,
})
export class SystemStatusComponent implements OnInit {
  // TODO: non-null assertion operator is used here temporaly. We need to use a resolver here to move async logic out of component.
  dataSource!: object;
  isLoading = true;

  constructor(protected systemInfoService: SystemInfoService) {}

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
