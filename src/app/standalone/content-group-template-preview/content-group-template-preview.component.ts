import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { CoreModule } from '@app/core/core.module';
import { Content } from '@app/core/models/content';
import { ContentGroupTemplate } from '@app/core/models/content-group-template';
import { ContentType } from '@app/core/models/content-type.enum';
import { LICENSES } from '@app/core/models/licenses';
import { Room } from '@app/core/models/room';
import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentTemplatePreviewComponent } from '@app/standalone/_dialogs/content-template-preview/content-template-preview.component';
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
  template: ContentGroupTemplate;

  room: Room;
  contents: Content[];
  LICENSES = LICENSES;

  isLoadingContentGroup = true;
  isLoadingContents = true;

  constructor(
    private templateService: BaseTemplateService,
    private contentService: ContentService,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.room = this.route.snapshot.data.room;
    this.template = history?.state?.data?.template;
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

  getIcon(format: ContentType): string {
    return this.contentService.getTypeIcons().get(format) || '';
  }

  openPreview(content: Content): void {
    this.dialog.open(ContentTemplatePreviewComponent, {
      data: {
        contents: this.contents,
        index: this.contents.map((c) => c.id).indexOf(content.id),
      },
      panelClass: 'big-dialog-panel',
    });
  }
}
