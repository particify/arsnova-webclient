import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-info-chart',
  templateUrl: './info-chart.component.html',
  styleUrls: ['./info-chart.component.scss'],
})
export class InfoChartComponent {
  @Input({ required: true }) chartId!: string;
  @Input({ required: true }) dataText!: string;
  @Input({ required: true }) infoText!: string;
}
