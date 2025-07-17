import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TextStatistic } from '@app/core/models/text-statistic';

@Component({
  selector: 'app-answer-grid-list',
  imports: [
    MatCardModule,
    MatIconModule,
    NgClass,
    FlexModule,
    NgTemplateOutlet,
  ],
  templateUrl: './answer-grid-list.component.html',
  styleUrl: './answer-grid-list.component.scss',
})
export class AnswerGridListComponent implements OnChanges {
  @Input({ required: true }) answers!: TextStatistic[];
  @Input() showCorrect = false;
  @Input() correctTerms?: string[];

  ngOnChanges() {
    this.answers = this.answers.sort((a, b) => {
      return b.count - a.count;
    });
  }

  isCorrect(answer: string): boolean {
    return !!this.correctTerms && this.correctTerms.includes(answer);
  }
}
