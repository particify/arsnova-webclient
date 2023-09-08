import { Component, OnInit } from '@angular/core';
import { ContentService } from '@app/core/services/http/content.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService } from '@ngneat/transloco';
import { ActivatedRoute } from '@angular/router';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ContentCreationComponent } from '@app/creator/series/content-creation/content-creation/content-creation.component';
import { ContentFlashcard } from '@app/core/models/content-flashcard';
import { EventService } from '@app/core/services/util/event.service';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { HintType } from '@app/core/models/hint-type.enum';
import { FormService } from '@app/core/services/util/form.service';

@Component({
  selector: 'app-content-flashcard-creation',
  templateUrl: './content-flashcard-creation.component.html',
})
export class ContentFlashcardCreationComponent
  extends ContentCreationComponent
  implements OnInit
{
  answer?: string;
  textContainsImage: boolean;
  HintType = HintType;

  constructor(
    protected contentService: ContentService,
    protected notificationService: NotificationService,
    protected translationService: TranslocoService,
    protected route: ActivatedRoute,
    protected contentGroupService: ContentGroupService,
    protected announceService: AnnounceService,
    public eventService: EventService,
    private formattingService: FormattingService,
    protected formService: FormService
  ) {
    super(
      contentService,
      notificationService,
      translationService,
      route,
      contentGroupService,
      announceService,
      formService
    );
  }

  initContentCreation() {
    this.content = new ContentFlashcard();
  }

  resetAnswers(): void {
    this.answer = undefined;
  }

  initContentForEditing() {
    this.initContentFlashcardEditBase();
    this.answer = (this.content as ContentFlashcard).additionalText;
  }

  createContent(): boolean {
    if (this.answer) {
      (this.content as ContentFlashcard).additionalText = this.answer;
      return true;
    } else {
      const msg = this.translationService.translate(
        'creator.content.need-answer'
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      return false;
    }
  }

  updateTextContainsImage(text: string) {
    this.textContainsImage = this.formattingService.containsTextAnImage(text);
  }
}
