import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatCard } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { CoreModule } from '@app/core/core.module';
import { TranslocoPipe } from '@jsverse/transloco';

export interface StatTable {
  name: string;
  description?: string;
  value?: number;
}

@Component({
  selector: 'app-statistic-card',
  templateUrl: './statistic-card.component.html',
  styleUrls: ['./statistic-card.component.scss'],
  imports: [FlexModule, MatCard, MatTableModule, CoreModule, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticCardComponent {
  headerName = input.required<string>();
  tableData = input.required<StatTable[]>();
}
