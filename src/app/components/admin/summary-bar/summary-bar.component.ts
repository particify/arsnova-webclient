import { Component, Input, OnInit } from '@angular/core';
import {
  SummarizedStats,
  SystemInfoService,
} from '../../../services/http/system-info.service';
import { share } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-summary-bar',
  templateUrl: './summary-bar.component.html',
  styleUrls: ['./summary-bar.component.scss'],
})
export class SummaryBarComponent implements OnInit {
  @Input() healthInfo: Observable<object>;
  stats: Observable<SummarizedStats>;

  constructor(protected systemInfoService: SystemInfoService) {}

  ngOnInit() {
    this.stats = this.getStats();
  }

  getStats() {
    return this.systemInfoService.getSummarizedStats().pipe(share());
  }
}
