import { Component, OnInit } from '@angular/core';
import { ContentType } from '@app/core/models/content-type.enum';
import { ContentService } from '@app/core/services/http/content.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ContentCreationComponent } from '@app/creator/content-creation/content-creation/content-creation.component';
import { ContentFlashcard } from '@app/core/models/content-flashcard';
import { EventService } from '@app/core/services/util/event.service';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { HINT_TYPES } from '@app/shared/hint/hint.component';
import { AnnounceService } from '@app/core/services/util/announce.service';

@Component({
  selector: 'app-content-flashcard-creation',
  templateUrl: './content-flashcard-creation.component.html',
})
export class ContentFlashcardCreationComponent
  extends ContentCreationComponent
  implements OnInit
{
  answer: string;
  textContainsImage: boolean;
  warningType = HINT_TYPES.WARNING;

  constructor(
    protected contentService: ContentService,
    protected notificationService: NotificationService,
    protected translationService: TranslateService,
    protected route: ActivatedRoute,
    protected contentGroupService: ContentGroupService,
    protected announceService: AnnounceService,
    public eventService: EventService,
    private formattingService: FormattingService
  ) {
    super(
      contentService,
      notificationService,
      translationService,
      route,
      contentGroupService,
      announceService
    );
  }

  initContentCreation() {
    this.content = new ContentFlashcard(
      null,
      null,
      '',
      '',
      '',
      '',
      [],
      ContentType.FLASHCARD,
      null
    );
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
      const msg = this.translationService.instant('content.need-answer');
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      return false;
    }
  }

  resetAnswers() {
    this.answer = null;
  }

  updateTextContainsImage(text: string) {
    this.textContainsImage = this.formattingService.containsTextAnImage(text);
  }
}
