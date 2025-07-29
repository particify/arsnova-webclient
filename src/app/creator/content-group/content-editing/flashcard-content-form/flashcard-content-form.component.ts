import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { ContentFlashcard } from '@app/core/models/content-flashcard';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { HintType } from '@app/core/models/hint-type.enum';
import { FormComponent } from '@app/standalone/form/form.component';
import { Content } from '@app/core/models/content';
import { ContentForm } from '@app/creator/content-group/content-editing/content-form';
import { ContentType } from '@app/core/models/content-type.enum';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Dir } from '@angular/cdk/bidi';
import { HintComponent } from '@app/standalone/hint/hint.component';

@Component({
  selector: 'app-flashcard-content-form',
  templateUrl: './flashcard-content-form.component.html',
  providers: [
    {
      provide: 'ContentForm',
      useExisting: FlashcardContentFormComponent,
    },
  ],
  imports: [
    FormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    CdkTextareaAutosize,
    Dir,
    HintComponent,
    TranslocoPipe,
  ],
})
export class FlashcardContentFormComponent
  extends FormComponent
  implements OnChanges, ContentForm
{
  private notificationService = inject(NotificationService);
  private translationService = inject(TranslocoService);
  private formattingService = inject(FormattingService);

  @Input() content?: Content;
  @Input() isEditMode = false;

  answer = '';
  textContainsImage = false;
  HintType = HintType;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.content?.currentValue) {
      if (this.content?.format === ContentType.FLASHCARD) {
        this.answer = (this.content as ContentFlashcard).additionalText;
      }
    } else {
      this.answer = '';
    }
  }

  getContent(): Content | undefined {
    if (this.answer) {
      if (!this.isEditMode) {
        this.content = new ContentFlashcard();
      }
      (this.content as ContentFlashcard).additionalText = this.answer;
      return this.content;
    } else {
      const msg = this.translationService.translate(
        'creator.content.need-answer'
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      return;
    }
  }

  updateTextContainsImage(text: string) {
    this.textContainsImage = this.formattingService.containsTextAnImage(text);
  }
}
