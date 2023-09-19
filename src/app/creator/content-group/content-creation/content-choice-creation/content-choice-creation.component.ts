import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ContentChoice } from '@app/core/models/content-choice';
import { DisplayAnswer } from '@app/creator/content-group/content-creation/_models/display-answer';
import { CreateAnswerOptionComponent } from '@app/creator/content-group/content-creation/create-answer-option/create-answer-option.component';
import { FormService } from '@app/core/services/util/form.service';
import { Content } from '@app/core/models/content';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { AnswerOptionListComponent } from '@app/creator/content-group/content-creation/answer-option-list/answer-option-list.component';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentCreation } from '@app/creator/content-group/content-creation/content-creation-page/content-creation';
import { FormComponent } from '@app/standalone/form/form.component';

@Component({
  selector: 'app-content-choice-creation',
  templateUrl: './content-choice-creation.component.html',
  styleUrls: ['./content-choice-creation.component.scss'],
  providers: [
    {
      provide: 'ContentCreation',
      useExisting: ContentChoiceCreationComponent,
    },
  ],
})
export class ContentChoiceCreationComponent
  extends FormComponent
  implements OnInit, OnChanges, ContentCreation
{
  @ViewChild(CreateAnswerOptionComponent)
  answerCreation: CreateAnswerOptionComponent;
  @ViewChild(AnswerOptionListComponent)
  answerList: AnswerOptionListComponent;

  @Input() content?: Content;
  @Input() isAnswered: boolean;
  @Input() isEditMode: boolean;

  displayAnswers: DisplayAnswer[] = [];
  multipleCorrectAnswers = false;
  noCorrectAnswers = false;

  constructor(
    private contentService: ContentService,
    protected formService: FormService
  ) {
    super(formService);
  }

  ngOnInit(): void {
    if (this.isEditMode) {
      this.initContentForEditing();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.content.currentValue) {
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
    if (!this.noCorrectAnswers) {
      this.setCorrectOptionIndexes();
    }
  }

  private setAnswerOptions(): void {
    (this.content as ContentChoice).options = this.displayAnswers.map(
      (d) => d.answerOption
    );
  }

  private setCorrectOptionIndexes(): void {
    const correctOptionIndexes: number[] = [];
    this.displayAnswers.forEach((val, index) => {
      if (val.correct) {
        correctOptionIndexes.push(index);
      }
    });
    (this.content as ContentChoice).correctOptionIndexes = correctOptionIndexes;
  }

  private initContentForEditing() {
    const content = this.content as ContentChoice;
    this.displayAnswers = this.contentService.getAnswerOptions(
      content.options,
      content.correctOptionIndexes
    );
    this.multipleCorrectAnswers = (this.content as ContentChoice).multiple;
    this.noCorrectAnswers = !(this.content as ContentChoice)
      .correctOptionIndexes;
  }
}
