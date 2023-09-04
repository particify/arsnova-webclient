import { Component, Input, OnInit } from '@angular/core';
import { ContentService } from '@app/core/services/http/content.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ContentCreationComponent } from '@app/creator/content-creation/content-creation/content-creation.component';
import { ContentType } from '@app/core/models/content-type.enum';
import { ContentWordcloud } from '@app/core/models/content-wordcloud';
import { EventService } from '@app/core/services/util/event.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { FormService } from '@app/core/services/util/form.service';

const MAX_KEYWORDS = 10;

@Component({
  selector: 'app-content-wordcloud-creation',
  templateUrl: './content-wordcloud-creation.component.html',
  styleUrls: ['./content-wordcloud-creation.component.scss'],
})
export class ContentWordcloudCreationComponent
  extends ContentCreationComponent
  implements OnInit
{
  @Input() format: ContentType;

  maxAnswers = 3;

  constructor(
    public eventService: EventService,
    protected contentService: ContentService,
    protected notificationService: NotificationService,
    protected translationService: TranslateService,
    protected route: ActivatedRoute,
    protected contentGroupService: ContentGroupService,
    protected announceService: AnnounceService,
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
    this.content = new ContentWordcloud();
  }

  initContentForEditing() {
    if (this.editContent) {
      this.content = this.editContent;
    }
    this.maxAnswers = (this.content as ContentWordcloud).maxAnswers;
  }

  createContent(): boolean {
    if (this.maxAnswers >= 1 && this.maxAnswers <= MAX_KEYWORDS) {
      (this.content as ContentWordcloud).maxAnswers = this.maxAnswers;
      return true;
    } else {
      const msg = this.translationService.instant(
        'content.max-keywords-out-of-range',
        { min: 1, max: MAX_KEYWORDS }
      );
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      return false;
    }
  }
}
