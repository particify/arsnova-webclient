import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-correct-answer-results',
  standalone: true,
  imports: [NgClass, TranslocoPipe, FlexLayoutModule],
  templateUrl: './correct-answer-results.component.html',
  styleUrl: './correct-answer-results.component.scss',
})
export class CorrectAnswerResultsComponent {
  @Input() answerCounts?: number[];
  @Input() correctAnswerCounts?: number[];
  @Input() correctAnswerFractions?: number[];
  @Input() round = 1;
  @Input() compareRounds = false;
  @Input() show = false;

  getCorrectPercentage(round: number): string {
    let percent = 0;
    if (this.correctAnswerFractions && this.correctAnswerFractions[round]) {
      percent = this.correctAnswerFractions[round] * 100;
    } else {
      if (
        this.answerCounts &&
        this.correctAnswerCounts &&
        this.answerCounts[round] > 0 &&
        this.correctAnswerCounts[round] > 0
      ) {
        percent =
          (this.correctAnswerCounts[round] / this.answerCounts[round]) * 100;
      }
    }
    return percent.toFixed(0) + '\u202F%';
  }
}
