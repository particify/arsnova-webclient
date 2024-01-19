import { Component, Input } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { LocalizeDecimalSeperatorPipe } from '@app/core/pipes/localize-decimal-seperator.pipe';

@Component({
  selector: 'app-statistic-info',
  standalone: true,
  imports: [CoreModule],
  providers: [LocalizeDecimalSeperatorPipe],
  templateUrl: './statistic-info.component.html',
  styleUrl: './statistic-info.component.scss',
})
export class StatisticInfoComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) round!: number;
  @Input({ required: true }) data!: number[];
  @Input() hasAnswers = false;

  constructor(private localizeDecimalSeperator: LocalizeDecimalSeperatorPipe) {}

  getStat(round: number): string {
    return this.getRoundedWithoutTrailingZeros(
      this.data[this.round > 1 ? round : this.round]
    );
  }

  private getRoundedWithoutTrailingZeros(value: number): string {
    if (!this.hasAnswers) {
      return '–';
    }
    return this.localizeDecimalSeperator.transform(value);
  }
}
