import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { TextCount } from '@app/core/models/text-count';
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
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [provideTranslocoScope('creator')],
})
export class AnswerListComponent implements OnInit {
  @Input({ required: true }) answers!: TextCount[];
  @Input() banMode = true;
  @Input() isPresentation = false;
  @Input() isModerator = true;
  @Input() showCorrect = false;
  @Input() correctAnswers?: string[];
  @Output() deleteClicked = new EventEmitter<TextCount>();

  ngOnInit(): void {
    this.answers = this.sortAnswers();
  }

  sortAnswers(): TextCount[] {
    return this.answers
      .sort((a, b) => (b.text > a.text ? -1 : 1))
      .sort((a, b) => b.count - a.count);
  }

  deleteAnswer(answer: TextCount): void {
    this.deleteClicked.emit(answer);
  }

  isCorrect(answer: string): boolean {
    return !!this.correctAnswers && this.correctAnswers.includes(answer);
  }

  hasCorrectAnswers(): boolean {
    return !!this.correctAnswers;
  }
}
