import { Component, Input, OnInit } from '@angular/core';
import { ContentService } from '../../../../services/http/content.service';
import { AdvancedSnackBarTypes, NotificationService } from '../../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { RoomService } from '../../../../services/http/room.service';
import { ContentGroupService } from '../../../../services/http/content-group.service';
import { ContentCreationComponent } from '../content-creation/content-creation.component';
import { ContentType } from '../../../../models/content-type.enum';
import { ContentWordcloud } from '../../../../models/content-wordcloud';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../../../../services/util/event.service';

const MAX_KEYWORDS = 10;

@Component({
  selector: 'app-content-wordcloud-creation',
  templateUrl: './content-wordcloud-creation.component.html',
  styleUrls: ['./content-wordcloud-creation.component.scss']
})
export class ContentWordcloudCreationComponent extends ContentCreationComponent implements OnInit {

  @Input() format: ContentType;

  maxAnswers = 5;

  constructor(
    public eventService: EventService,
    protected contentService: ContentService,
    protected notificationService: NotificationService,
    protected translationService: TranslateService,
    protected roomService: RoomService,
    protected contentGroupService: ContentGroupService,
    protected route: ActivatedRoute
  ) {
    super(contentService, notificationService, translationService, roomService, contentGroupService, route);
  }

  initContentCreation() {
    this.content = new ContentWordcloud(
      null,
      null,
      '',
      '',
      '',
      [],
      ContentType.WORDCLOUD,
      null,
      1
    );
  }

  initContentForEditing() {
    this.content = this.editContent;
    this.maxAnswers = (this.content as ContentWordcloud).maxAnswers;
  }

  createContent(): boolean {
    if (this.maxAnswers >= 1 && this.maxAnswers <= MAX_KEYWORDS) {
      (this.content as ContentWordcloud).maxAnswers = this.maxAnswers;
      return true;
    } else {
      const msg = this.translationService.instant('content.wordcloud-max-keywords-out-of-range', { min: 1, max: MAX_KEYWORDS });
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      return false;
    }
  }
}
