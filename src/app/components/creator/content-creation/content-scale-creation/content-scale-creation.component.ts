import { Component, OnChanges, OnInit } from '@angular/core';
import { ContentService } from '../../../../services/http/content.service';
import { NotificationService } from '../../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { RoomService } from '../../../../services/http/room.service';
import { ContentGroupService } from '../../../../services/http/content-group.service';
import { ContentCreationComponent } from '../content-creation/content-creation.component';
import { ActivatedRoute } from '@angular/router';
import { LikertScaleTemplate, LIKERT_SCALE_TEMPLATES } from '../../../../models/likert-scale-template.enum';
import { LikertScaleService } from '../../../../services/util/likert-scale.service';
import { ContentScale } from '../../../../models/content-scale';
import { AnnounceService } from '../../../../services/util/announce.service';

@Component({
  selector: 'app-content-scale-creation',
  templateUrl: './content-scale-creation.component.html',
  styleUrls: ['./content-scale-creation.component.scss']
})
export class ContentScaleCreationComponent extends ContentCreationComponent implements OnChanges, OnInit {
  templates = LIKERT_SCALE_TEMPLATES;
  templateLabels = LIKERT_SCALE_TEMPLATES
      .map(t => 'option-template.' + t.toLowerCase().replace(/_/g, '-'));
  selectedTemplate = LikertScaleTemplate.AGREEMENT;
  neutralOption = true;

  constructor(
    protected contentService: ContentService,
    protected notificationService: NotificationService,
    protected translationService: TranslateService,
    protected roomService: RoomService,
    protected contentGroupService: ContentGroupService,
    protected likertScaleService: LikertScaleService,
    protected route: ActivatedRoute,
    protected announceService: AnnounceService
  ) {
    super(contentService, notificationService, translationService, roomService, contentGroupService, route, announceService);
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
    this.content = new ContentScale(this.selectedTemplate, this.determineOptionCount(this.neutralOption));
    this.updateOptionLabels();
  }

  initContentForEditing() {
    this.displayAnswers = this.initContentChoiceEditBase();
    this.isLoading = false;
  }

  updateOptionLabels() {
    const optionCount = this.determineOptionCount(this.neutralOption);
    this.answerLabels = this.likertScaleService.getOptionLabels(this.selectedTemplate, optionCount);
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
