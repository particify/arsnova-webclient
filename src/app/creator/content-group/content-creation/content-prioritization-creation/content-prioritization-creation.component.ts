import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { DisplayAnswer } from '@app/creator/content-group/content-creation/_models/display-answer';
import { ContentPrioritization } from '@app/core/models/content-prioritization';
import { FormService } from '@app/core/services/util/form.service';
import { FormComponent } from '@app/standalone/form/form.component';
import { Content } from '@app/core/models/content';
import { CreateAnswerOptionComponent } from '@app/creator/content-group/content-creation/create-answer-option/create-answer-option.component';
import { AnswerOptionListComponent } from '@app/creator/content-group/content-creation/answer-option-list/answer-option-list.component';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentCreation } from '@app/creator/content-group/content-creation/content-creation-page/content-creation';

@Component({
  selector: 'app-content-prioritization-creation',
  templateUrl: './content-prioritization-creation.component.html',
  providers: [
    {
      provide: 'ContentCreation',
      useExisting: ContentPrioritizationCreationComponent,
    },
  ],
})
export class ContentPrioritizationCreationComponent
  extends FormComponent
  implements OnInit, OnChanges, ContentCreation
{
  @ViewChild(CreateAnswerOptionComponent)
  answerCreation: CreateAnswerOptionComponent;
  @ViewChild(AnswerOptionListComponent)
  answerList: AnswerOptionListComponent;

  @Input() content?: Content;
  @Input() isEditMode: boolean;
  @Input() isAnswered: boolean;

  displayAnswers: DisplayAnswer[] = [];

  constructor(
    private contentService: ContentService,
    protected formService: FormService
  ) {
    super(formService);
  }
  ngOnInit(): void {
    if (this.isEditMode) {
      const content = this.content as ContentPrioritization;
      this.displayAnswers = this.contentService.getAnswerOptions(
        content.options
      );
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.content.currentValue) {
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

  private prepareContent(): void {
    if (!this.isEditMode) {
      this.content = new ContentPrioritization();
    }
    this.setAnswerOptions();
  }

  private setAnswerOptions(): void {
    (this.content as ContentPrioritization).options = this.displayAnswers.map(
      (d) => d.answerOption
    );
  }
}
