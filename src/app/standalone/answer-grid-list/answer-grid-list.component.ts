import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TextCount } from '@app/core/models/text-count';

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
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './answer-grid-list.component.scss',
})
export class AnswerGridListComponent implements OnChanges {
  @Input({ required: true }) answers!: TextCount[];
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
