import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { DisplayAnswer } from '@app/creator/content-group/content-editing/_models/display-answer';
import { ContentPrioritization } from '@app/core/models/content-prioritization';
import { FormComponent } from '@app/standalone/form/form.component';
import { Content } from '@app/core/models/content';
import { AnswerOptionListComponent } from '@app/creator/content-group/content-editing/answer-option-list/answer-option-list.component';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentForm } from '@app/creator/content-group/content-editing/content-form';
import { ContentType } from '@app/core/models/content-type.enum';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-prioritization-content-form',
  templateUrl: './prioritization-content-form.component.html',
  styleUrl: '../content-editing.component.scss',
  providers: [
    {
      provide: 'ContentForm',
      useExisting: PrioritizationContentFormComponent,
    },
  ],
  imports: [AnswerOptionListComponent, TranslocoPipe],
})
export class PrioritizationContentFormComponent
  extends FormComponent
  implements OnChanges, ContentForm
{
  private contentService = inject(ContentService);

  @ViewChild(AnswerOptionListComponent)
  answerList!: AnswerOptionListComponent;

  @Input() content?: Content;
  @Input() isEditMode = false;
  @Input() isAnswered = false;

  displayAnswers: DisplayAnswer[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.content?.currentValue) {
      if (this.content?.format === ContentType.PRIORITIZATION) {
        const content = this.content as ContentPrioritization;
        this.displayAnswers = this.contentService.getAnswerOptions(
          content.options
        );
      }
    } else {
      this.displayAnswers = [];
    }
  }

  getContent(): Content | undefined {
    if (this.answerList.isListValid(false, false)) {
      this.prepareContent();
      return this.content;
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
