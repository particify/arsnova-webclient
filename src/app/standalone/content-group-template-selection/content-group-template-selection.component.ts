import { Location } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreModule } from '@app/core/core.module';
import { ContentGroupTemplate } from '@app/core/models/content-group-template';
import { Room } from '@app/core/models/room';
import { TemplateTag } from '@app/core/models/template-tag';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { FormService } from '@app/core/services/util/form.service';
import { RoutingService } from '@app/core/services/util/routing.service';
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
  templateUrl: './content-group-template-selection.component.html',
  styleUrls: ['./content-group-template-selection.component.scss'],
})
export class ContentGroupTemplateSelectionComponent
  extends FormComponent
  implements OnInit, OnDestroy
{
  protected formService: FormService;
  private templateService = inject(BaseTemplateService);
  private translateService = inject(TranslocoService);
  private authService = inject(AuthenticationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private routingService = inject(RoutingService);

  // Route data input below
  @Input() room?: Room;
  @Input() tagIds?: string[];
  @Input() lang?: string;

  destroyed$ = new Subject<void>();

  loadingTemplates = true;
  templates: ContentGroupTemplate[] = [];
  selectedLang?: string;
  selectedTags: TemplateTag[] = [];
  langChanged = new EventEmitter<string>();
  showPublic = true;
  // TODO: non-null assertion operator is used here temporaly. We need to use a resolver here to move async logic out of component.
  creatorId!: string;
  tagIdsQueryParams: string[] = [];

  constructor() {
    const formService = inject(FormService);

    super(formService);

    this.formService = formService;
  }

  ngOnInit(): void {
    // If lang is set via query param, use this one instead of active lang as default
    this.selectedLang = this.lang || this.translateService.getActiveLang();
    this.authService
      .getCurrentAuthentication()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((auth) => {
        this.creatorId = auth.userId;
        if (this.tagIds) {
          this.tagIdsQueryParams = this.tagIds;
        } else {
          this.showPublic = !this.route.snapshot.data.showMyTemplates;
          this.loadTemplates();
        }
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
    const url = this.getBaseUrl();
    url.push(templateId);
    this.router.navigate(url, {
      state: { data: { template: template } },
    });
  }

  private getBaseUrl() {
    const url = [];
    if (this.room) {
      url.push(this.routingService.getRoleRoute());
      url.push(this.room.shortId);
    }
    url.push('templates');
    return url;
  }

  updateLanguage(lang: string): void {
    this.selectedLang = lang;
    this.langChanged.emit(this.selectedLang);
  }

  switchList(event: MatTabChangeEvent): void {
    this.showPublic = event.index === 0;
    const url = this.getBaseUrl();
    if (!this.showPublic) {
      url.push('my');
    }
    this.location.replaceState(
      this.router.serializeUrl(this.router.createUrlTree(url))
    );
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
