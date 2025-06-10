import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { DisplayAnswer } from '@app/creator/content-group/content-editing/_models/display-answer';
import { ContentPrioritization } from '@app/core/models/content-prioritization';
import { FormComponent } from '@app/standalone/form/form.component';
import { Content } from '@app/core/models/content';
import { CreateAnswerOptionComponent } from '@app/creator/content-group/content-editing/create-answer-option/create-answer-option.component';
import { AnswerOptionListComponent } from '@app/creator/content-group/content-editing/answer-option-list/answer-option-list.component';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentForm } from '@app/creator/content-group/content-editing/content-form';
import { ContentType } from '@app/core/models/content-type.enum';
import { FlexModule } from '@angular/flex-layout';
import { DividerComponent } from '@app/standalone/divider/divider.component';

@Component({
  selector: 'app-prioritization-content-form',
  templateUrl: './prioritization-content-form.component.html',
  providers: [
    {
      provide: 'ContentForm',
      useExisting: PrioritizationContentFormComponent,
    },
  ],
  imports: [
    FlexModule,
    DividerComponent,
    AnswerOptionListComponent,
    CreateAnswerOptionComponent,
  ],
})
export class PrioritizationContentFormComponent
  extends FormComponent
  implements OnInit, OnChanges, ContentForm
{
  private contentService = inject(ContentService);

  @ViewChild(CreateAnswerOptionComponent)
  answerCreation!: CreateAnswerOptionComponent;
  @ViewChild(AnswerOptionListComponent)
  answerList!: AnswerOptionListComponent;

  @Input() content?: Content;
  @Input() isEditMode = false;
  @Input() isAnswered = false;

  displayAnswers: DisplayAnswer[] = [];

  ngOnInit(): void {
    if (this.content?.format === ContentType.PRIORITIZATION) {
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
