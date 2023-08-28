import { Component, OnChanges, OnInit } from '@angular/core';
import { ContentService } from '@app/core/services/http/content.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ContentCreationComponent } from '@app/creator/content-creation/content-creation/content-creation.component';
import {
  LikertScaleTemplate,
  LIKERT_SCALE_TEMPLATES,
} from '@app/core/models/likert-scale-template.enum';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { ContentScale } from '@app/core/models/content-scale';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { FormService } from '@app/core/services/util/form.service';

@Component({
  selector: 'app-content-scale-creation',
  templateUrl: './content-scale-creation.component.html',
  styleUrls: ['./content-scale-creation.component.scss'],
})
export class ContentScaleCreationComponent
  extends ContentCreationComponent
  implements OnChanges, OnInit
{
  templates = LIKERT_SCALE_TEMPLATES;
  templateLabels = LIKERT_SCALE_TEMPLATES.map(
    (t) => 'option-template.' + t.toLowerCase().replace(/_/g, '-')
  );
  selectedTemplate = LikertScaleTemplate.AGREEMENT;
  neutralOption = true;

  constructor(
    protected contentService: ContentService,
    protected notificationService: NotificationService,
    protected translationService: TranslateService,
    protected route: ActivatedRoute,
    protected contentGroupService: ContentGroupService,
    protected likertScaleService: LikertScaleService,
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

  ngOnInit() {
    super.ngOnInit();
    const scaleContent = this.content as ContentScale;
    this.selectedTemplate = scaleContent.optionTemplate;
    this.neutralOption = scaleContent.optionCount % 2 !== 0;
  }

  ngOnChanges() {
    if (this.content) {
      this.updateOptionLabels();
    }
  }

  initContentCreation() {
    this.content = new ContentScale(
      this.selectedTemplate,
      this.determineOptionCount(this.neutralOption)
    );
    this.updateOptionLabels();
  }

  initContentForEditing() {
    this.displayAnswers = this.initContentChoiceEditBase();
    this.checkIfAnswersExist();
  }

  updateOptionLabels() {
    const optionCount = this.determineOptionCount(this.neutralOption);
    const labels = this.likertScaleService.getOptionLabels(
      this.selectedTemplate,
      optionCount
    );
    if (labels) {
      this.answerLabels = labels;
    }
    this.isLoading = false;
  }

  createContent() {
    const scaleContent = this.content as ContentScale;
    scaleContent.optionTemplate = this.selectedTemplate;
    scaleContent.optionCount = this.determineOptionCount(this.neutralOption);
    return true;
  }

  private determineOptionCount(neutralOption: boolean) {
    return neutralOption ? 5 : 4;
  }
}
