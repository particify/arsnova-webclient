import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChoiceAnswer } from '../../../../models/choice-answer';
import { SelectableAnswer } from '../../../../models/selectable-answer';

@Component({
  selector: 'app-content-choice-answer',
  templateUrl: './content-choice-answer.component.html',
  styleUrls: ['./content-choice-answer.component.scss'],
})
export class ContentChoiceAnswerComponent {
  @Input() answer: ChoiceAnswer;
  @Input() selectableAnswers: SelectableAnswer[] = [];
  @Input() isDisabled: boolean;
  @Input() multipleAnswersAllowed: boolean;
  @Input() hasAbstained: boolean;
  @Input() hasCorrectAnswer: boolean;
  @Input() isCorrectAnswerPublished: boolean;
  @Input() selectedAnswerIndex: number;
  @Input() correctOptionIndexes: number[] = [];
  @Input() contentId: string;
  @Input() dynamicRendering: boolean;
  @Output() answerIndexSelected = new EventEmitter<number>();

  selectSingleAnswer(index: number) {
    this.answerIndexSelected.emit(index);
  }

  isCorrectOptionVisible(index: number): boolean {
    return (
      this.isAnsweredWithOption() &&
      this.hasCorrectAnswer &&
      this.isCorrectAnswerPublished &&
      this.isCorrectOrSelectedOption(index)
    );
  }

  isAnsweredWithOption(): boolean {
    return this.isDisabled && !this.hasAbstained;
  }

  isCorrectOrSelectedOption(index: number): boolean {
    return (
      this.isAnswerOptionSelected(index) ||
      this.correctOptionIndexes.includes(index)
    );
  }

  checkOption(index: number, checkCorrect: boolean) {
    if (this.hasCorrectAnswer && this.isAnswerOptionSelected(index)) {
      if (checkCorrect) {
        return this.correctOptionIndexes.includes(index);
      } else {
        return !this.correctOptionIndexes.includes(index);
      }
    }
  }

  isAnswerOptionSelected(index: number): boolean {
    return this.answer?.selectedChoiceIndexes.includes(index);
  }

  isAnswerOptionCorrect(index: number): boolean {
    return this.correctOptionIndexes.includes(index);
  }
}
