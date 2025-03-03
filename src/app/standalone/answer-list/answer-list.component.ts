import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TextStatistic } from '@app/core/models/text-statistic';
import { TranslocoPipe, provideTranslocoScope } from '@jsverse/transloco';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconButton } from '@angular/material/button';
import { FlexModule } from '@angular/flex-layout';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-answer-list',
  templateUrl: './answer-list.component.html',
  styleUrls: ['./answer-list.component.scss'],
  imports: [
    NgClass,
    FlexModule,
    MatIconButton,
    MatTooltip,
    MatIcon,
    TranslocoPipe,
  ],
  providers: [provideTranslocoScope('creator')],
})
export class AnswerListComponent implements OnInit {
  @Input({ required: true }) answers!: TextStatistic[];
  @Input() banMode = true;
  @Input() isPresentation = false;
  @Input() isModerator = true;
  @Input() showCorrect = false;
  @Input() correctAnswers?: string[];
  @Output() deleteClicked = new EventEmitter<TextStatistic>();

  ngOnInit(): void {
    this.answers = this.sortAnswers();
  }

  sortAnswers(): TextStatistic[] {
    return this.answers
      .sort((a, b) => (b.answer > a.answer ? -1 : 1))
      .sort((a, b) => b.count - a.count);
  }

  deleteAnswer(answer: TextStatistic): void {
    this.deleteClicked.emit(answer);
  }

  isCorrect(answer: string): boolean {
    return !!this.correctAnswers && this.correctAnswers.includes(answer);
  }

  hasCorrectAnswers(): boolean {
    return !!this.correctAnswers;
  }
}
