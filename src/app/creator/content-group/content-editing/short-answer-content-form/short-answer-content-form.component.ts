import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { DisplayAnswer } from '@app/creator/content-group/content-editing/_models/display-answer';
import { CreateAnswerOptionComponent } from '@app/creator/content-group/content-editing/create-answer-option/create-answer-option.component';
import { FormService } from '@app/core/services/util/form.service';
import { Content } from '@app/core/models/content';
import { AnswerOptionListComponent } from '@app/creator/content-group/content-editing/answer-option-list/answer-option-list.component';
import { ContentForm } from '@app/creator/content-group/content-editing/content-form';
import { FormComponent } from '@app/standalone/form/form.component';
import { ContentShortAnswer } from '@app/core/models/content-short-answer';
import { AnswerOption } from '@app/core/models/answer-option';
import { ContentState } from '@app/core/models/content-state';
import { ContentType } from '@app/core/models/content-type.enum';

@Component({
  selector: 'app-short-answer-content-form',
  templateUrl: './short-answer-content-form.component.html',
  providers: [
    {
      provide: 'ContentForm',
      useExisting: ShortAnswerContentFormComponent,
    },
  ],
  standalone: false,
})
export class ShortAnswerContentFormComponent
  extends FormComponent
  implements OnInit, OnChanges, ContentForm
{
  @ViewChild(CreateAnswerOptionComponent)
  answerCreation!: CreateAnswerOptionComponent;
  @ViewChild(AnswerOptionListComponent)
  answerList!: AnswerOptionListComponent;

  @Input() content?: Content;
  @Input() isAnswered = false;
  @Input() isEditMode = false;

  displayAnswers: DisplayAnswer[] = [];

  constructor(protected formService: FormService) {
    super(formService);
  }

  ngOnInit(): void {
    if (this.content?.format === ContentType.SHORT_ANSWER) {
      this.initContentForEditing();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.content?.currentValue) {
      this.displayAnswers = [];
    }
  }

  getContent(): Content | undefined {
    if (!this.answerCreation || this.answerCreation.isFormValid()) {
      if (this.answerList.isListValid(false, false)) {
        this.prepareContent();
        return this.content;
      }
    }
    return;
  }

  private prepareContent() {
    if (!this.isEditMode) {
      this.content = new ContentShortAnswer();
      this.content.state = new ContentState(1, undefined, true);
    }
    this.setAnswerOptions();
  }

  private setAnswerOptions(): void {
    (this.content as ContentShortAnswer).correctTerms = this.displayAnswers.map(
      (d) => d.answerOption.label
    );
  }

  private initContentForEditing() {
    const content = this.content as ContentShortAnswer;
    this.displayAnswers = content.correctTerms.map(
      (c) => new DisplayAnswer(new AnswerOption(c), false)
    );
  }
}
