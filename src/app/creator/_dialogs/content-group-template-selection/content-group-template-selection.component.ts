import {
  Component,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ContentGroupTemplate } from '@app/core/models/content-group-template';
import { TemplateTag } from '@app/core/models/template-tag';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TemplateService } from '@app/creator/_services/template.service';
import { TranslocoService } from '@ngneat/transloco';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-content-group-template-selection',
  templateUrl: './content-group-template-selection.component.html',
  styleUrls: ['./content-group-template-selection.component.scss'],
})
export class ContentGroupTemplateSelectionComponent
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

  constructor(
    private dialogRef: MatDialogRef<ContentGroupTemplateSelectionComponent>,
    @Inject(MAT_DIALOG_DATA)
    private data: { roomId: string },
    private templateService: TemplateService,
    private translateService: TranslocoService,
    private notificationService: NotificationService,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.authService
      .getCurrentAuthentication()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((auth) => {
        this.creatorId = auth.userId;
      });
    this.selectedLang = this.translateService.getActiveLang();
    this.loadTemplates();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  updateTags(tags: TemplateTag[]): void {
    this.selectedTags = tags;
    this.loadTemplates();
  }

  useTemplate(templateId: string): void {
    this.templateService
      .createCopyFromContentGroupTemplate(templateId, this.data.roomId)
      .subscribe(() => {
        const msg = this.translateService.translate('templates.template-added');
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.SUCCESS
        );
        this.closeDialog();
      });
  }

  showPreview(templateId: string): void {
    this.previewTemplate = this.templates.find((t) => t.id === templateId);
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
