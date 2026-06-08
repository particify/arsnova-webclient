import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';

@Component({
  selector: 'app-info-chart',
  templateUrl: './info-chart.component.html',
  styleUrls: ['./info-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FlexModule],
})
export class InfoChartComponent {
  @Input({ required: true }) chartId!: string;
  @Input({ required: true }) dataText!: string;
  @Input({ required: true }) infoText!: string;
}
