import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TextStatistic } from '@app/core/models/text-statistic';
import { TranslocoPipe } from '@ngneat/transloco';

@Component({
  selector: 'app-answer-grid-list',
  standalone: true,
  imports: [
    TranslocoPipe,
    MatCardModule,
    MatIconModule,
    NgClass,
    FlexModule,
    NgTemplateOutlet,
  ],
  templateUrl: './answer-grid-list.component.html',
  styleUrl: './answer-grid-list.component.scss',
})
export class AnswerGridListComponent {
  @Input({ required: true }) answers!: TextStatistic[];
  @Input() showCorrect = false;
  @Input() correctTerms?: string[];

  isCorrect(answer: string): boolean {
    return !!this.correctTerms && this.correctTerms.includes(answer);
  }

  getCorrectPercentage(): string {
    const correctTerms = this.answers.filter(
      (a) => !!this.correctTerms && this.correctTerms.includes(a.answer)
    );
    const totalCount = this.getAnswerCount(this.answers);
    const correctCount = this.getAnswerCount(correctTerms);
    const percent = (correctCount / totalCount) * 100;
    return percent.toFixed(0) + '\u202F%';
  }

  private getAnswerCount(answers: TextStatistic[]): number {
    return answers.map((a) => a.count).reduce((a, b) => a + b);
  }
}
