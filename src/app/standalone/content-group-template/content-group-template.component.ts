import { Component, input, output } from '@angular/core';

import { CoreModule } from '@app/core/core.module';
import { TemplateLicenseComponent } from '@app/standalone/template-license/template-license.component';
import { QuestionnaireInfoComponent } from '@app/standalone/questionnaire-info/questionnaire-info.component';
import { TemplateDetailsFragment } from '@gql/generated/graphql';

@Component({
  imports: [CoreModule, TemplateLicenseComponent, QuestionnaireInfoComponent],
  selector: 'app-content-group-template',
  templateUrl: './content-group-template.component.html',
  styleUrls: ['./content-group-template.component.scss'],
})
export class ContentGroupTemplateComponent {
  readonly template = input.required<TemplateDetailsFragment>();
  readonly previewClicked = output<string>();

  preview() {
    this.previewClicked.emit(this.template().id);
  }
}
