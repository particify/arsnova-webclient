import { Component, OnInit } from '@angular/core';
import { ContentChoice } from '@app/core/models/content-choice';
import { NotificationService } from '@app/core/services/util/notification.service';
import { ContentService } from '@app/core/services/http/content.service';
import { ActivatedRoute } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ContentCreationComponent } from '@app/creator/series/content-creation/content-creation/content-creation.component';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { FormService } from '@app/core/services/util/form.service';
import { ContentType } from '@app/core/models/content-type.enum';

@Component({
  selector: 'app-content-yes-no-creation',
  templateUrl: './content-yes-no-creation.component.html',
  styleUrls: ['./content-yes-no-creation.component.scss'],
})
export class ContentYesNoCreationComponent
  extends ContentCreationComponent
  implements OnInit
{
  yesno = -1;
  answerLabels = ['creator.content.yes', 'creator.content.no'];

  constructor(
    protected contentService: ContentService,
    protected notificationService: NotificationService,
    protected translationService: TranslocoService,
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
    this.content = new ContentChoice();
    this.content.format = ContentType.BINARY;
    this.initTemplateAnswers();
  }

  initContentForEditing() {
    this.displayAnswers = this.initContentChoiceEditBase();
    const correctOptions = (this.content as ContentChoice).correctOptionIndexes;
    this.yesno = correctOptions ? correctOptions[0] : -1;
    this.isLoading = false;
  }

  createContent(): boolean {
    if (this.yesno > -1) {
      const index = this.yesno;
      (this.content as ContentChoice).correctOptionIndexes = [index];
    }
    return true;
  }

  resetAnswers() {
    this.yesno = -1;
  }
}
