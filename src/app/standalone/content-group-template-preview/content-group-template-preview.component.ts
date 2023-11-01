import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { Content } from '@app/core/models/content';
import { ContentGroupTemplate } from '@app/core/models/content-group-template';
import { ContentType } from '@app/core/models/content-type.enum';
import { LICENSES } from '@app/core/models/licenses';
import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { ContentService } from '@app/core/services/http/content.service';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { TemplateLicenseComponent } from '@app/standalone/template-license/template-license.component';

@Component({
  standalone: true,
  imports: [
    CoreModule,
    LoadingIndicatorComponent,
    TemplateLicenseComponent,
    LoadingButtonComponent,
  ],
  selector: 'app-content-group-template-preview',
  templateUrl: './content-group-template-preview.component.html',
  styleUrls: ['./content-group-template-preview.component.scss'],
})
export class ContentGroupTemplatePreviewComponent implements OnInit {
  @Output() backClicked = new EventEmitter<void>();
  @Output() addClicked = new EventEmitter<string>();

  @Input() template: ContentGroupTemplate;

  contents: Content[];
  LICENSES = LICENSES;

  isLoading = true;

  constructor(
    private templateService: BaseTemplateService,
    private contentService: ContentService
  ) {}

  ngOnInit(): void {
    this.templateService
      .getContentTemplates(this.template.templateIds)
      .subscribe((contentTemplates) => {
        this.contents = contentTemplates;
        this.isLoading = false;
      });
  }

  back(): void {
    this.backClicked.emit();
  }

  add(): void {
    this.addClicked.emit(this.template.id);
  }

  getIcon(format: ContentType): string {
    return this.contentService.getTypeIcons().get(format) || '';
  }
}
