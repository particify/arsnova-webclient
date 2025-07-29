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
import { ContentWordcloud } from '@app/core/models/content-wordcloud';
import { FormComponent } from '@app/standalone/form/form.component';
import { Content } from '@app/core/models/content';
import { ContentForm } from '@app/creator/content-group/content-editing/content-form';
import { ContentType } from '@app/core/models/content-type.enum';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

const MAX_KEYWORDS = 10;

@Component({
  selector: 'app-wordcloud-content-form',
  templateUrl: './wordcloud-content-form.component.html',
  styleUrls: ['./wordcloud-content-form.component.scss'],
  providers: [
    {
      provide: 'ContentForm',
      useExisting: WordcloudContentFormComponent,
    },
  ],
  imports: [MatFormField, MatLabel, MatInput, FormsModule, TranslocoPipe],
})
export class WordcloudContentFormComponent
  extends FormComponent
  implements OnChanges, ContentForm
{
  private notificationService = inject(NotificationService);
  private translateService = inject(TranslocoService);

  @Input() content?: Content;
  @Input() isEditMode = false;

  maxAnswers = 3;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.content?.currentValue &&
      this.content?.format === ContentType.WORDCLOUD
    ) {
      this.maxAnswers = (this.content as ContentWordcloud).maxAnswers;
    }
  }

  getContent(): Content | undefined {
    if (!this.isEditMode) {
      this.content = new ContentWordcloud();
    }
    if (this.maxAnswers >= 1 && this.maxAnswers <= MAX_KEYWORDS) {
      (this.content as ContentWordcloud).maxAnswers = this.maxAnswers;
      return this.content;
    } else {
      const msg = this.translateService.translate(
        'creator.content.max-keywords-out-of-range',
        { min: 1, max: MAX_KEYWORDS }
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      return;
    }
  }
}
