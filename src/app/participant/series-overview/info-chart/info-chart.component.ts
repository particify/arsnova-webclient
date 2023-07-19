import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-info-chart',
  templateUrl: './info-chart.component.html',
  styleUrls: ['./info-chart.component.scss'],
})
export class InfoChartComponent {
  @Input() chartId: string;
  @Input() dataText: string;
  @Input() infoText: string;
}
