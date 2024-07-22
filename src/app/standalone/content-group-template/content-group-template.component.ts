import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ContentGroupTemplate } from '@app/core/models/content-group-template';
import { CoreModule } from '@app/core/core.module';
import { LICENSES } from '@app/core/models/licenses';
import { TemplateLicenseComponent } from '@app/standalone/template-license/template-license.component';
import { AddTemplateButtonComponent } from '@app/standalone/add-template-button/add-template-button.component';
import { Room } from '@app/core/models/room';
import { ContentGroupInfoComponent } from '@app/standalone/content-group-info/content-group-info.component';

@Component({
  standalone: true,
  imports: [
    CoreModule,
    TemplateLicenseComponent,
    AddTemplateButtonComponent,
    ContentGroupInfoComponent,
  ],
  selector: 'app-content-group-template',
  templateUrl: './content-group-template.component.html',
  styleUrls: ['./content-group-template.component.scss'],
})
export class ContentGroupTemplateComponent {
  @Input({ required: true }) template!: ContentGroupTemplate;
  @Input() room?: Room;
  @Output() previewClicked = new EventEmitter<string>();
  LICENSES = LICENSES;

  preview() {
    this.previewClicked.emit(this.template.id);
  }
}
