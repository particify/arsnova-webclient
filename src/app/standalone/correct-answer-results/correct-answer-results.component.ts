import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-correct-answer-results',
  imports: [NgClass, TranslocoPipe, FlexLayoutModule],
  templateUrl: './correct-answer-results.component.html',
  styleUrl: './correct-answer-results.component.scss',
})
export class CorrectAnswerResultsComponent {
  @Input() answerCounts?: number[];
  @Input() correctAnswerCounts?: number[];
  @Input() correctAnswerFractions?: number[];
  @Input() abstentionCounts?: number[];
  @Input() round = 1;
  @Input() compareRounds = false;
  @Input() show = false;

  getCorrectPercentage(round: number): string {
    let percent = 0;
    if (
      this.answerCounts &&
      this.correctAnswerFractions &&
      this.correctAnswerFractions[round]
    ) {
      percent =
        this.correctAnswerFractions[round] *
        (this.answerCounts[round] / this.getTotalResponses(round)) *
        100;
    } else {
      if (
        this.answerCounts &&
        this.correctAnswerCounts &&
        this.answerCounts[round] > 0 &&
        this.correctAnswerCounts[round] > 0
      ) {
        percent =
          (this.correctAnswerCounts[round] / this.getTotalResponses(round)) *
          100;
      }
    }
    return this.getCountWithPercentageSign(percent);
  }

  getAbstentionPercentage(round: number): string | undefined {
    if (this.abstentionCounts && this.abstentionCounts[round] > 0) {
      const percent =
        (this.abstentionCounts[round] / this.getTotalResponses(round)) * 100;
      return this.getCountWithPercentageSign(percent);
    }
  }

  private getCountWithPercentageSign(percent: number): string {
    return percent.toFixed(0) + '\u202F%';
  }

  private getTotalResponses(round: number): number {
    if (this.answerCounts && this.abstentionCounts) {
      return this.answerCounts[round] + this.abstentionCounts[round];
    }
    return 0;
  }
}
