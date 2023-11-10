import {
  Component,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
  Optional,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreModule } from '@app/core/core.module';
import { ContentGroupTemplate } from '@app/core/models/content-group-template';
import { TemplateTag } from '@app/core/models/template-tag';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { FormService } from '@app/core/services/util/form.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TemplateService } from '@app/creator/_services/template.service';
import { ContentGroupTemplatePreviewComponent } from '@app/standalone/content-group-template-preview/content-group-template-preview.component';
import { ContentGroupTemplateComponent } from '@app/standalone/content-group-template/content-group-template.component';
import { FormComponent } from '@app/standalone/form/form.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { TemplateLanguageSelectionComponent } from '@app/standalone/template-language-selection/template-language-selection.component';
import { TemplateTagSelectionComponent } from '@app/standalone/template-tag-selection/template-tag-selection.component';
import { TranslocoService } from '@ngneat/transloco';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-content-group-template-selection',
  imports: [
    CoreModule,
    TemplateLanguageSelectionComponent,
    TemplateTagSelectionComponent,
    ContentGroupTemplatePreviewComponent,
    ContentGroupTemplateComponent,
    LoadingIndicatorComponent,
  ],
  standalone: true,
  templateUrl: './content-group-template-selection.component.html',
  styleUrls: ['./content-group-template-selection.component.scss'],
})
export class ContentGroupTemplateSelectionComponent
  extends FormComponent
  implements OnInit, OnDestroy
{
  destroyed$ = new Subject<void>();

  loadingTemplates = true;
  templates: ContentGroupTemplate[];
  selectedLang: string;
  selectedTags: TemplateTag[] = [];
  langChanged = new EventEmitter<string>();
  showPublic = true;
  previewTemplate: ContentGroupTemplate | undefined;
  creatorId: string;
  previewTemplateId?: string;
  tagIdsQueryParams: string[] = [];

  constructor(
    protected formService: FormService,
    @Optional()
    private dialogRef: MatDialogRef<ContentGroupTemplateSelectionComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { roomId: string },
    private templateService: TemplateService,
    private translateService: TranslocoService,
    private notificationService: NotificationService,
    private authService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super(formService);
  }

  ngOnInit(): void {
    const queryParams = this.route.snapshot.queryParams;
    // If lang is set via query param, use this one instead of active lang as default
    this.selectedLang =
      queryParams.lang || this.translateService.getActiveLang();
    if (queryParams.tagIds) {
      this.tagIdsQueryParams =
        this.route.snapshot.queryParamMap.getAll('tagIds');
    } else {
      this.loadTemplates();
    }
    this.previewTemplateId = this.route.snapshot.params.templateId;
    if (this.previewTemplateId) {
      this.templateService
        .getContentGroupTemplate(this.previewTemplateId)
        .pipe(takeUntil(this.destroyed$))
        .subscribe((template) => {
          this.previewTemplate = template;
          this.loadingTemplates = false;
        });
      return;
    }
    this.authService
      .getCurrentAuthentication()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((auth) => {
        this.creatorId = auth.userId;
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  updateTags(tags: TemplateTag[]): void {
    this.selectedTags = tags;
    this.router.navigate([], {
      queryParams: {
        lang: this.selectedLang,
        tagIds: this.selectedTags.map((t) => t.id),
      },
      replaceUrl: true,
    });
    this.tagIdsQueryParams = this.selectedTags.map((t) => t.id);
    this.loadTemplates();
  }

  useTemplate(templateId: string): void {
    this.disableForm();
    this.templateService
      .createCopyFromContentGroupTemplate(templateId, this.data.roomId)
      .subscribe({
        next: () => {
          const msg = this.translateService.translate(
            'templates.template-added'
          );
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.SUCCESS
          );
          this.closeDialog();
        },
        error: () => {
          this.enableForm();
        },
      });
  }

  showPreview(templateId: string): void {
    const template = this.templates.find((t) => t.id === templateId);
    if (this.data.roomId) {
      if (template) {
        this.previewTemplateId = templateId;
        this.previewTemplate = template;
      }
    } else {
      this.router.navigate([templateId], {
        relativeTo: this.route,
        state: { data: { template: template } },
      });
    }
  }

  updateLanguage(lang: string): void {
    this.selectedLang = lang;
    this.langChanged.emit(this.selectedLang);
  }

  switchList(event: MatTabChangeEvent): void {
    this.showPublic = event.index === 0;
    this.loadTemplates();
  }

  private loadTemplates() {
    this.templates = [];
    this.loadingTemplates = true;
    this.templateService
      .getContentGroupTemplates(
        this.selectedTags.map((t) => t.id),
        this.selectedLang,
        this.showPublic ? undefined : this.creatorId
      )
      .subscribe((templates) => {
        this.templates = templates;
        this.loadingTemplates = false;
      });
  }
}
