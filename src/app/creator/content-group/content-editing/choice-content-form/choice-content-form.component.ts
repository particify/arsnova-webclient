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
import { MatCheckboxChange, MatCheckbox } from '@angular/material/checkbox';
import { AnswerOptionListComponent } from '@app/creator/content-group/content-editing/answer-option-list/answer-option-list.component';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentForm } from '@app/creator/content-group/content-editing/content-form';
import { FormComponent } from '@app/standalone/form/form.component';
import { ContentType } from '@app/core/models/content-type.enum';
import { FlexModule } from '@angular/flex-layout';
import { DividerComponent } from '../../../../standalone/divider/divider.component';
import { AnswerOptionListComponent as AnswerOptionListComponent_1 } from '../answer-option-list/answer-option-list.component';
import { CreateAnswerOptionComponent as CreateAnswerOptionComponent_1 } from '../create-answer-option/create-answer-option.component';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-choice-content-form',
  templateUrl: './choice-content-form.component.html',
  styleUrls: ['./choice-content-form.component.scss'],
  providers: [
    {
      provide: 'ContentForm',
      useExisting: ChoiceContentFormComponent,
    },
  ],
  imports: [
    FlexModule,
    MatCheckbox,
    DividerComponent,
    AnswerOptionListComponent_1,
    CreateAnswerOptionComponent_1,
    TranslocoPipe,
  ],
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
  @Input() correctAnswerSelection = false;
  @Input() isQuiz = false;

  displayAnswers: DisplayAnswer[] = [];
  multipleCorrectAnswers = false;
  noCorrectAnswers = false;

  ngOnInit(): void {
    if (this.content?.format === ContentType.CHOICE) {
      this.initContentForEditing();
    } else {
      if (!this.correctAnswerSelection) {
        this.noCorrectAnswers = !this.isQuiz;
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.content?.currentValue) {
      this.displayAnswers = [];
    }
  }

  changeMultiple(change: MatCheckboxChange) {
    this.multipleCorrectAnswers = change.checked;
  }

  changeNoCorrect(change: MatCheckboxChange) {
    this.noCorrectAnswers = change.checked;
    this.displayAnswers.forEach((val) => (val.correct = false));
  }

  getContent(): Content | undefined {
    if (!this.answerCreation || this.answerCreation.isFormValid()) {
      if (
        this.answerList.isListValid(
          !this.noCorrectAnswers,
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
    (this.content as ContentChoice).correctOptionIndexes = this.noCorrectAnswers
      ? []
      : this.getCorrectOptionIndexes();
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
    this.multipleCorrectAnswers = (this.content as ContentChoice).multiple;
    this.noCorrectAnswers =
      !(this.content as ContentChoice).correctOptionIndexes ||
      (this.content as ContentChoice).correctOptionIndexes.length === 0;
  }
}
