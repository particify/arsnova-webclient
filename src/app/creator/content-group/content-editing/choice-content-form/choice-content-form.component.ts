import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { ContentChoice } from '@app/core/models/content-choice';
import { DisplayAnswer } from '@app/creator/content-group/content-editing/_models/display-answer';
import { CreateAnswerOptionComponent } from '@app/creator/content-group/content-editing/create-answer-option/create-answer-option.component';
import { Content } from '@app/core/models/content';
import { AnswerOptionListComponent } from '@app/creator/content-group/content-editing/answer-option-list/answer-option-list.component';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentForm } from '@app/creator/content-group/content-editing/content-form';
import { FormComponent } from '@app/standalone/form/form.component';
import { ContentType } from '@app/core/models/content-type.enum';
import { FlexModule } from '@angular/flex-layout';

@Component({
  selector: 'app-choice-content-form',
  templateUrl: './choice-content-form.component.html',
  providers: [
    {
      provide: 'ContentForm',
      useExisting: ChoiceContentFormComponent,
    },
  ],
  imports: [FlexModule, AnswerOptionListComponent, CreateAnswerOptionComponent],
})
export class ChoiceContentFormComponent
  extends FormComponent
  implements OnInit, OnChanges, ContentForm
{
  private contentService = inject(ContentService);

  @ViewChild(CreateAnswerOptionComponent)
  answerCreation!: CreateAnswerOptionComponent;
  @ViewChild(AnswerOptionListComponent)
  answerList!: AnswerOptionListComponent;

  @Input() content?: Content;
  @Input() isAnswered = false;
  @Input() isEditMode = false;
  @Input() correctAnswers = true;
  @Input() multipleCorrectAnswers = false;

  displayAnswers: DisplayAnswer[] = [];

  ngOnInit(): void {
    if (this.content?.format === ContentType.CHOICE) {
      this.initContentForEditing();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.correctAnswers) {
      this.displayAnswers.forEach((val) => (val.correct = false));
    } else if (
      !changes.multipleCorrectAnswers &&
      !changes.content?.currentValue
    ) {
      this.displayAnswers = [];
    }
  }

  getContent(): Content | undefined {
    if (!this.answerCreation || this.answerCreation.isFormValid()) {
      if (
        this.answerList.isListValid(
          this.correctAnswers,
          this.multipleCorrectAnswers
        )
      ) {
        this.prepareContent();
        return this.content;
      }
    }
    return;
  }

  private prepareContent() {
    if (!this.isEditMode) {
      this.content = new ContentChoice();
    }
    (this.content as ContentChoice).multiple = this.multipleCorrectAnswers;
    this.setAnswerOptions();
    (this.content as ContentChoice).correctOptionIndexes = this.correctAnswers
      ? this.getCorrectOptionIndexes()
      : [];
  }

  private setAnswerOptions(): void {
    (this.content as ContentChoice).options = this.displayAnswers.map(
      (d) => d.answerOption
    );
  }

  private getCorrectOptionIndexes(): number[] {
    const correctOptionIndexes: number[] = [];
    this.displayAnswers.forEach((val, index) => {
      if (val.correct) {
        correctOptionIndexes.push(index);
      }
    });
    return correctOptionIndexes;
  }

  private initContentForEditing() {
    const content = this.content as ContentChoice;
    this.displayAnswers = this.contentService.getAnswerOptions(
      content.options,
      content.correctOptionIndexes
    );
  }
}
