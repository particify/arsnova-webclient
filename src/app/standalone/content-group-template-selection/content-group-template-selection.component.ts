import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreModule } from '@app/core/core.module';
import { ContentGroupTemplate } from '@app/core/models/content-group-template';
import { Room } from '@app/core/models/room';
import { TemplateTag } from '@app/core/models/template-tag';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { FormService } from '@app/core/services/util/form.service';
import { ContentGroupTemplateComponent } from '@app/standalone/content-group-template/content-group-template.component';
import { FormComponent } from '@app/standalone/form/form.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { TemplateLanguageSelectionComponent } from '@app/standalone/template-language-selection/template-language-selection.component';
import { TemplateTagSelectionComponent } from '@app/standalone/template-tag-selection/template-tag-selection.component';
import { TranslocoService } from '@jsverse/transloco';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-content-group-template-selection',
  imports: [
    CoreModule,
    TemplateLanguageSelectionComponent,
    TemplateTagSelectionComponent,
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
  templates: ContentGroupTemplate[] = [];
  selectedLang: string;
  selectedTags: TemplateTag[] = [];
  langChanged = new EventEmitter<string>();
  showPublic = true;
  // TODO: non-null assertion operator is used here temporaly. We need to use a resolver here to move async logic out of component.
  creatorId!: string;
  tagIdsQueryParams: string[] = [];
  room?: Room;

  constructor(
    protected formService: FormService,
    private templateService: BaseTemplateService,
    private translateService: TranslocoService,
    private authService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super(formService);
    this.room = this.route.snapshot.data.room;
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
  }

  ngOnInit(): void {
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

  showPreview(templateId: string): void {
    const template = this.templates.find((t) => t.id === templateId);

    this.router.navigate([templateId], {
      relativeTo: this.route,
      state: { data: { template: template } },
    });
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
