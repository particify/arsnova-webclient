import { Component, Input, OnInit, inject } from '@angular/core';
import {
  LikertScaleTemplate,
  LIKERT_SCALE_TEMPLATES,
} from '@app/core/models/likert-scale-template.enum';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { ContentScale } from '@app/core/models/content-scale';
import { Content } from '@app/core/models/content';
import { FormComponent } from '@app/standalone/form/form.component';
import { ContentForm } from '@app/creator/content-group/content-editing/content-form';
import { LanguageService } from '@app/core/services/util/language.service';
import { ContentType } from '@app/core/models/content-type.enum';

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
  standalone: false,
})
export class ScaleContentFormComponent
  extends FormComponent
  implements OnInit, ContentForm
{
  private likertScaleService = inject(LikertScaleService);
  private languageService = inject(LanguageService);

  @Input() content?: Content;
  @Input() isAnswered = false;
  @Input() isEditMode = false;
  @Input() language?: string;

  templates = LIKERT_SCALE_TEMPLATES;
  templateLabels = LIKERT_SCALE_TEMPLATES.map(
    (t) => 'creator.option-template.' + t.toLowerCase().replace(/_/g, '-')
  );
  selectedTemplate = LikertScaleTemplate.AGREEMENT;
  neutralOption = true;
  answerLabels: string[] = [];

  ngOnInit(): void {
    if (this.content?.format === ContentType.SCALE) {
      const scaleContent = this.content as ContentScale;
      this.selectedTemplate = scaleContent.optionTemplate;
      this.neutralOption = scaleContent.optionCount % 2 !== 0;
    }
    this.updateOptionLabels();
    this.language = this.languageService.ensureValidLang(this.language);
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
