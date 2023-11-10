import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { MatCardAppearance } from '@angular/material/card';
import { ActivatedRoute } from '@angular/router';
import { CoreModule } from '@app/core/core.module';
import { Content } from '@app/core/models/content';
import { ContentGroupTemplate } from '@app/core/models/content-group-template';
import { ContentType } from '@app/core/models/content-type.enum';
import { LICENSES } from '@app/core/models/licenses';
import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { ContentService } from '@app/core/services/http/content.service';
import { AddTemplateButtonComponent } from '@app/standalone/add-template-button/add-template-button.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { TemplateLicenseComponent } from '@app/standalone/template-license/template-license.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  standalone: true,
  imports: [
    CoreModule,
    LoadingIndicatorComponent,
    TemplateLicenseComponent,
    AddTemplateButtonComponent,
  ],
  selector: 'app-content-group-template-preview',
  templateUrl: './content-group-template-preview.component.html',
  styleUrls: ['./content-group-template-preview.component.scss'],
})
export class ContentGroupTemplatePreviewComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();
  @Output() backClicked = new EventEmitter<void>();
  @Output() templateAdded = new EventEmitter<void>();

  @Input() template: ContentGroupTemplate;
  @Input() appearance: MatCardAppearance = 'raised';
  @Input() roomId?: string;

  contents: Content[];
  LICENSES = LICENSES;

  isLoadingContentGroup = true;
  isLoadingContents = true;

  constructor(
    private templateService: BaseTemplateService,
    private contentService: ContentService,
    private route: ActivatedRoute
  ) {}

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.template = this.template ?? history?.state?.data?.template;
    if (this.template) {
      this.getContentTemplates();
      return;
    }
    this.templateService
      .getContentGroupTemplate(this.route.snapshot.params.templateId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((template) => {
        this.template = template;
        this.getContentTemplates();
      });
  }

  getContentTemplates(): void {
    this.isLoadingContentGroup = false;
    this.templateService
      .getContentTemplates(this.template.templateIds)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((contentTemplates) => {
        this.contents = contentTemplates;
        this.isLoadingContents = false;
      });
  }

  back(): void {
    this.backClicked.emit();
  }

  afterRoomAdded(): void {
    this.templateAdded.emit();
  }

  getIcon(format: ContentType): string {
    return this.contentService.getTypeIcons().get(format) || '';
  }
}
