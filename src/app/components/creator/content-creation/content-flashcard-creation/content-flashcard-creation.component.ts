import { Component, OnInit } from '@angular/core';
import { ContentType } from '../../../../models/content-type.enum';
import { ContentService } from '../../../../services/http/content.service';
import { AdvancedSnackBarTypes, NotificationService } from '../../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { RoomService } from '../../../../services/http/room.service';
import { ContentGroupService } from '../../../../services/http/content-group.service';
import { ContentCreationComponent } from '../../../../components/creator/content-creation/content-creation/content-creation.component';
import { ContentFlashcard } from '../../../../models/content-flashcard';
import { EventService } from '../../../../services/util/event.service';
import { FormattingService } from '../../../../services/http/formatting.service';
import { HINT_TYPES } from '../../../../components/shared/hint/hint.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-content-flashcard-creation',
  templateUrl: './content-flashcard-creation.component.html',
  styleUrls: ['./content-flashcard-creation.component.scss']
})
export class ContentFlashcardCreationComponent extends ContentCreationComponent implements OnInit {

  answer: string;
  textContainsImage: boolean;
  warningType = HINT_TYPES.WARNING;

  constructor(
    protected contentService: ContentService,
    protected notificationService: NotificationService,
    protected translationService: TranslateService,
    protected roomService: RoomService,
    protected contentGroupService: ContentGroupService,
    protected route: ActivatedRoute,
    public eventService: EventService,
    private formattingService: FormattingService
  ) {
    super(contentService, notificationService, translationService, roomService, contentGroupService, route);
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
