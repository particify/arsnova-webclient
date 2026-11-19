import {
  Component,
  Input,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { LocalizeDecimalSeperatorPipe } from '@app/core/pipes/localize-decimal-seperator.pipe';

@Component({
  selector: 'app-statistic-info',
  imports: [CoreModule],
  providers: [LocalizeDecimalSeperatorPipe],
  templateUrl: './statistic-info.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './statistic-info.component.scss',
})
export class StatisticInfoComponent {
  private localizeDecimalSeperator = inject(LocalizeDecimalSeperatorPipe);

  @Input({ required: true }) label!: string;
  @Input({ required: true }) round!: number;
  @Input({ required: true }) data!: number[];
  @Input() hasAnswers = false;

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
