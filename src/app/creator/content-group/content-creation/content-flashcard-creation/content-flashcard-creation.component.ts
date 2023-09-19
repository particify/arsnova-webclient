import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService } from '@ngneat/transloco';
import { ContentFlashcard } from '@app/core/models/content-flashcard';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { HintType } from '@app/core/models/hint-type.enum';
import { FormService } from '@app/core/services/util/form.service';
import { FormComponent } from '@app/standalone/form/form.component';
import { Content } from '@app/core/models/content';
import { ContentCreation } from '@app/creator/content-group/content-creation/content-creation-page/content-creation';

@Component({
  selector: 'app-content-flashcard-creation',
  templateUrl: './content-flashcard-creation.component.html',
  providers: [
    {
      provide: 'ContentCreation',
      useExisting: ContentFlashcardCreationComponent,
    },
  ],
})
export class ContentFlashcardCreationComponent
  extends FormComponent
  implements OnInit, OnChanges, ContentCreation
{
  @Input() content?: Content;
  @Input() isEditMode: boolean;

  answer: string;
  textContainsImage: boolean;
  HintType = HintType;

  constructor(
    private notificationService: NotificationService,
    private translationService: TranslocoService,
    private formattingService: FormattingService,
    protected formService: FormService
  ) {
    super(formService);
  }

  ngOnInit(): void {
    if (this.isEditMode) {
      this.answer = (this.content as ContentFlashcard).additionalText;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.content.currentValue) {
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
