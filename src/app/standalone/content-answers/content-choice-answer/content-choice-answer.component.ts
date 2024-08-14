import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CoreModule } from '@app/core/core.module';
import { ChoiceAnswer } from '@app/core/models/choice-answer';
import { SelectableAnswer } from '@app/core/models/selectable-answer';
import { LanguageService } from '@app/core/services/util/language.service';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';

@Component({
  selector: 'app-content-choice-answer',
  standalone: true,
  imports: [CoreModule, RenderedTextComponent],
  templateUrl: './content-choice-answer.component.html',
  styleUrls: ['./content-choice-answer.component.scss'],
})
export class ContentChoiceAnswerComponent {
  @Input() answer?: ChoiceAnswer;
  @Input() selectableAnswers: SelectableAnswer[] = [];
  @Input() isDisabled = false;
  @Input() multipleAnswersAllowed = false;
  @Input() hasAbstained = false;
  @Input() hasCorrectAnswer = false;
  @Input() isCorrectAnswerPublished = false;
  @Input() selectedAnswerIndex?: number;
  @Input() correctOptionIndexes: number[] = [];
  @Input() contentId?: string;
  @Input() dynamicRendering = false;
  @Output() answerIndexSelected = new EventEmitter<number>();

  language: string;

  constructor(route: ActivatedRoute, languageService: LanguageService) {
    this.language = languageService.ensureValidLang(
      route.snapshot.data.room?.language
    );
  }

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
    return this.isAnswerOptionSelected(index);
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
    return !this.answer || this.answer.selectedChoiceIndexes.includes(index);
  }

  isAnswerOptionCorrect(index: number): boolean {
    return this.correctOptionIndexes.includes(index);
  }
}
