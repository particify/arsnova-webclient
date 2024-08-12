import { Component, Input, OnInit } from '@angular/core';
import {
  LikertScaleTemplate,
  LIKERT_SCALE_TEMPLATES,
} from '@app/core/models/likert-scale-template.enum';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { ContentScale } from '@app/core/models/content-scale';
import { Content } from '@app/core/models/content';
import { FormComponent } from '@app/standalone/form/form.component';
import { FormService } from '@app/core/services/util/form.service';
import { ContentForm } from '@app/creator/content-group/content-editing/content-form';
import { Room } from '@app/core/models/room';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-scale-content-form',
  templateUrl: './scale-content-form.component.html',
  styleUrls: ['./scale-content-form.component.scss'],
  providers: [
    {
      provide: 'ContentForm',
      useExisting: ScaleContentFormComponent,
    },
  ],
})
export class ScaleContentFormComponent
  extends FormComponent
  implements OnInit, ContentForm
{
  @Input() content?: Content;
  @Input() isAnswered = false;
  @Input() isEditMode = false;

  templates = LIKERT_SCALE_TEMPLATES;
  templateLabels = LIKERT_SCALE_TEMPLATES.map(
    (t) => 'creator.option-template.' + t.toLowerCase().replace(/_/g, '-')
  );
  selectedTemplate = LikertScaleTemplate.AGREEMENT;
  neutralOption = true;
  answerLabels: string[] = [];
  room: Room;

  constructor(
    private likertScaleService: LikertScaleService,
    protected formService: FormService,
    route: ActivatedRoute
  ) {
    super(formService);
    this.room = route.snapshot.data['room'];
  }

  ngOnInit(): void {
    if (this.content) {
      const scaleContent = this.content as ContentScale;
      this.selectedTemplate = scaleContent.optionTemplate;
      this.neutralOption = scaleContent.optionCount % 2 !== 0;
    }
    this.updateOptionLabels();
  }

  getContent(): Content {
    if (!this.isEditMode) {
      this.content = new ContentScale(
        this.selectedTemplate,
        this.determineOptionCount()
      );
    } else {
      (this.content as ContentScale).optionTemplate = this.selectedTemplate;
      (this.content as ContentScale).optionCount = this.determineOptionCount();
    }
    return this.content as ContentScale;
  }

  updateOptionLabels() {
    const labels = this.likertScaleService.getOptionLabels(
      this.selectedTemplate,
      this.determineOptionCount()
    );
    if (labels) {
      this.answerLabels = labels;
    }
  }

  private determineOptionCount() {
    return this.neutralOption ? 5 : 4;
  }
}
