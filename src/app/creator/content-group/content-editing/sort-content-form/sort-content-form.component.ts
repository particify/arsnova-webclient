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
import { FormService } from '@app/core/services/util/form.service';
import { ContentType } from '@app/core/models/content-type.enum';
import { DisplayAnswer } from '@app/creator/content-group/content-editing/_models/display-answer';
import { FormComponent } from '@app/standalone/form/form.component';
import { Content } from '@app/core/models/content';
import { CreateAnswerOptionComponent } from '@app/creator/content-group/content-editing/create-answer-option/create-answer-option.component';
import { AnswerOptionListComponent } from '@app/creator/content-group/content-editing/answer-option-list/answer-option-list.component';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentForm } from '@app/creator/content-group/content-editing/content-form';

@Component({
  selector: 'app-sort-content-form',
  templateUrl: './sort-content-form.component.html',
  providers: [
    {
      provide: 'ContentForm',
      useExisting: SortContentFormComponent,
    },
  ],
  standalone: false,
})
export class SortContentFormComponent
  extends FormComponent
  implements OnInit, OnChanges, ContentForm
{
  private contentService = inject(ContentService);
  protected formService: FormService;

  @ViewChild(CreateAnswerOptionComponent)
  answerCreation!: CreateAnswerOptionComponent;
  @ViewChild(AnswerOptionListComponent)
  answerList!: AnswerOptionListComponent;

  @Input() content?: Content;
  @Input() isEditMode = false;
  @Input() isAnswered = false;

  displayAnswers: DisplayAnswer[] = [];

  constructor() {
    const formService = inject(FormService);

    super(formService);

    this.formService = formService;
  }

  ngOnInit(): void {
    if (this.content?.format === ContentType.SORT) {
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
    const content = this.content as ContentChoice;
    content.options = this.displayAnswers.map((d) => d.answerOption);
    content.correctOptionIndexes = Array.from(content.options.keys());
  }
}
