import { NgClass } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  computed,
  input,
} from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-correct-answer-results',
  imports: [NgClass, TranslocoPipe, FlexLayoutModule],
  templateUrl: './correct-answer-results.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './correct-answer-results.component.scss',
})
export class CorrectAnswerResultsComponent {
  show = input(false);
  answerCount = input(0);
  correctAnswerCount = input(0);
  abstentionCount = input(0);

  private readonly totalResponses = computed(
    () => this.answerCount() + this.abstentionCount()
  );

  readonly correctPercentage = computed(() => {
    let percent = 0;
    if (this.answerCount() > 0 && this.correctAnswerCount() > 0) {
      percent = (this.correctAnswerCount() / this.totalResponses()) * 100;
    }
    return this.formatPercentage(percent);
  });

  readonly abstentionPercentage = computed(() => {
    if (this.abstentionCount() > 0) {
      return this.formatPercentage(
        (this.abstentionCount() / this.totalResponses()) * 100
      );
    }
    return undefined;
  });

  private formatPercentage(percent: number): string {
    return percent.toFixed(0) + '\u202F%';
  }
}
