import { Location } from '@angular/common';
import {
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreModule } from '@app/core/core.module';
import { RoutingService } from '@app/core/services/util/routing.service';
import { ContentGroupTemplateComponent } from '@app/standalone/content-group-template/content-group-template.component';
import { FormComponent } from '@app/standalone/form/form.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { TemplateLanguageSelectionComponent } from '@app/standalone/template-language-selection/template-language-selection.component';
import { TemplateTagSelectionComponent } from '@app/standalone/template-tag-selection/template-tag-selection.component';
import {
  CurrentUserTemplatesGql,
  Maybe,
  PublishedTemplatesGql,
  TemplateQueryInput,
  TemplateDetailsFragment,
  TemplateTagFragment,
} from '@gql/generated/graphql';
import { TranslocoService } from '@jsverse/transloco';
import { Observable, map, of, startWith, switchMap } from 'rxjs';

// Only the first page is fetched until the list gets pagination controls.
const TEMPLATE_PAGE_SIZE = 50;

interface TemplatePage {
  edges?: Maybe<Array<Maybe<{ node: TemplateDetailsFragment }>>>;
  pageInfo: { endCursor?: Maybe<string>; hasNextPage: boolean };
}

/** Published templates are filtered by `query`, the user's own are not. */
interface TemplateListRequest {
  query?: TemplateQueryInput;
}

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
export class ContentGroupTemplateSelectionComponent extends FormComponent {
  private publishedTemplatesGql = inject(PublishedTemplatesGql);
  private currentUserTemplatesGql = inject(CurrentUserTemplatesGql);
  private translateService = inject(TranslocoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private routingService = inject(RoutingService);

  // Route data input below
  readonly shortId = input<string>();
  readonly tagIds = input<string[]>();
  readonly lang = input<string>();

  // If lang is set via query param, use this one instead of active lang as default
  readonly selectedLang = linkedSignal<string | undefined>(
    () => this.lang() || this.translateService.getActiveLang()
  );
  readonly selectedTags = signal<TemplateTagFragment[]>([]);
  readonly showPublic = signal(!this.route.snapshot.data.showMyTemplates);
  readonly tagIdsQueryParams = linkedSignal(() => this.tagIds() ?? []);
  /** Preselected tag IDs are resolved by the tag selection, which reports them. */
  private readonly tagsReported = signal(false);

  private readonly request = computed((): TemplateListRequest | undefined => {
    if (!this.showPublic()) {
      return {};
    }
    if (this.tagIds()?.length && !this.tagsReported()) {
      return undefined;
    }
    const tags = this.selectedTags();
    return {
      query: {
        language: this.selectedLang(),
        tagIds: tags.length > 0 ? tags.map((t) => t.id) : undefined,
      },
    };
  });

  private readonly loadedTemplates = toSignal(
    toObservable(this.request).pipe(
      switchMap((request) =>
        request
          ? this.fetchTemplatePage(request).pipe(
              map(
                (page) =>
                  page?.edges?.flatMap((e) => (e?.node ? [e.node] : [])) ?? []
              ),
              startWith(undefined)
            )
          : of(undefined)
      )
    )
  );
  readonly templates = computed(() => this.loadedTemplates() ?? []);
  readonly loadingTemplates = computed(
    () => this.loadedTemplates() === undefined
  );

  updateTags(tags: TemplateTagFragment[]): void {
    this.selectedTags.set(tags);
    this.tagsReported.set(true);
    const tagIds = tags.map((t) => t.id);
    this.router.navigate([], {
      queryParams: {
        lang: this.selectedLang(),
        tagIds,
      },
      replaceUrl: true,
    });
    this.tagIdsQueryParams.set(tagIds);
  }

  showPreview(templateId: string): void {
    const url = this.getBaseUrl();
    url.push(templateId);
    this.router.navigate(url);
  }

  private getBaseUrl() {
    const url = [];
    const shortId = this.shortId();
    if (shortId) {
      url.push(this.routingService.getRoleRoute());
      url.push(shortId);
    }
    url.push('templates');
    return url;
  }

  /** Changing the language resets the tags, whose report reloads the list. */
  updateLanguage(lang?: string): void {
    if (!lang) {
      return;
    }
    this.selectedLang.set(lang);
  }

  switchList(event: MatTabChangeEvent): void {
    this.showPublic.set(event.index === 0);
    const url = this.getBaseUrl();
    if (!this.showPublic()) {
      url.push('my');
    }
    this.location.replaceState(
      this.router.serializeUrl(this.router.createUrlTree(url))
    );
  }

  private fetchTemplatePage(
    request: TemplateListRequest,
    after?: string
  ): Observable<Maybe<TemplatePage>> {
    const first = TEMPLATE_PAGE_SIZE;
    return request.query
      ? this.publishedTemplatesGql
          .fetch({
            variables: { query: request.query, first, after },
            fetchPolicy: 'network-only',
          })
          .pipe(map((r) => r.data?.publishedTemplates ?? null))
      : this.currentUserTemplatesGql
          .fetch({ variables: { first, after }, fetchPolicy: 'network-only' })
          .pipe(map((r) => r.data?.currentUserTemplates ?? null));
  }
}
