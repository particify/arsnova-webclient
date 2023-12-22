import { Component, Input, OnInit } from '@angular/core';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService } from '@ngneat/transloco';
import { ContentWordcloud } from '@app/core/models/content-wordcloud';
import { FormService } from '@app/core/services/util/form.service';
import { FormComponent } from '@app/standalone/form/form.component';
import { Content } from '@app/core/models/content';
import { ContentForm } from '@app/creator/content-group/content-editing/content-form';

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
})
export class WordcloudContentFormComponent
  extends FormComponent
  implements OnInit, ContentForm
{
  @Input() content?: Content;
  @Input() isEditMode = false;

  maxAnswers = 3;

  constructor(
    private notificationService: NotificationService,
    private translateService: TranslocoService,
    protected formService: FormService
  ) {
    super(formService);
  }
  ngOnInit(): void {
    if (this.isEditMode) {
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
