import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { ContentChoice } from '@app/core/models/content-choice';
import { ContentType } from '@app/core/models/content-type.enum';
import { DisplayAnswer } from '@app/creator/content-group/content-editing/_models/display-answer';
import { FormComponent } from '@app/standalone/form/form.component';
import { Content } from '@app/core/models/content';
import { AnswerOptionListComponent } from '@app/creator/content-group/content-editing/answer-option-list/answer-option-list.component';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentForm } from '@app/creator/content-group/content-editing/content-form';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-sort-content-form',
  templateUrl: './sort-content-form.component.html',
  styleUrl: '../content-editing.component.scss',
  providers: [
    {
      provide: 'ContentForm',
      useExisting: SortContentFormComponent,
    },
  ],
  imports: [AnswerOptionListComponent, TranslocoPipe],
})
export class SortContentFormComponent
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
      if (this.content?.format === ContentType.SORT) {
        const content = this.content as ContentChoice;
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
