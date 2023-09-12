import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ContentChoice } from '@app/core/models/content-choice';
import { FormService } from '@app/core/services/util/form.service';
import { ContentType } from '@app/core/models/content-type.enum';
import { DisplayAnswer } from '@app/creator/series/content-creation/_models/display-answer';
import { FormComponent } from '@app/standalone/form/form.component';
import { Content } from '@app/core/models/content';
import { CreateAnswerOptionComponent } from '@app/creator/series/content-creation/create-answer-option/create-answer-option.component';
import { AnswerOptionListComponent } from '@app/creator/series/content-creation/answer-option-list/answer-option-list.component';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentCreation } from '@app/creator/series/content-creation/content-creation-page/content-creation';

@Component({
  selector: 'app-content-sort-creation',
  templateUrl: './content-sort-creation.component.html',
  providers: [
    {
      provide: 'ContentCreation',
      useExisting: ContentSortCreationComponent,
    },
  ],
})
export class ContentSortCreationComponent
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
      const content = this.content as ContentChoice;
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
      this.content = new ContentChoice();
      this.content.format = ContentType.SORT;
    }
    this.setAnswerOptions();
  }

  private setAnswerOptions(): void {
    (this.content as ContentChoice).options = this.displayAnswers.map(
      (d) => d.answerOption
    );
  }
}
