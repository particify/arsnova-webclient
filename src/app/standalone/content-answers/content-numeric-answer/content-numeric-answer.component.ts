import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { ContentNumeric } from '@app/core/models/content-numeric';
import { NumericAnswer } from '@app/core/models/numeric-answer';
import { LocalizeDecimalSeperatorPipe } from '@app/core/pipes/localize-decimal-seperator.pipe';

@Component({
  selector: 'app-content-numeric-answer',
  standalone: true,
  imports: [CoreModule],
  providers: [LocalizeDecimalSeperatorPipe],
  templateUrl: './content-numeric-answer.component.html',
  styleUrl: './content-numeric-answer.component.scss',
})
export class ContentNumericAnswerComponent implements OnInit {
  @Input({ required: true }) content!: ContentNumeric;
  @Input() answer?: NumericAnswer;
  @Input() correctOptionsPublished = false;
  @Input() isDisabled = false;
  @Output() selectedNumberUpdated = new EventEmitter<number>();

  selectedNumber?: number;

  ngOnInit() {
    this.selectedNumber = this.answer?.selectedNumber;
  }

  emitSelectedNumber(): void {
    this.selectedNumberUpdated.emit(this.selectedNumber);
  }

  showAnswerIndicator(): boolean {
    return (
      !!this.answer &&
      this.answer.selectedNumber !== undefined &&
      this.content.correctNumber !== undefined &&
      this.correctOptionsPublished
    );
  }

  isCorrect(): boolean {
    if (this.content.correctNumber !== undefined && this.answer) {
      return (
        this.answer.selectedNumber !== undefined &&
        this.answer.selectedNumber >=
          this.content.correctNumber - this.content.tolerance &&
        this.answer.selectedNumber <=
          this.content.correctNumber + this.content.tolerance
      );
    }
    return false;
  }
}
