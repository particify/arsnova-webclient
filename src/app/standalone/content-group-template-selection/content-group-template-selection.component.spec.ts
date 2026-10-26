import { Location } from '@angular/common';
import { ChangeDetectionStrategy, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutingService } from '@app/core/services/util/routing.service';
import { ContentGroupTemplateComponent } from '@app/standalone/content-group-template/content-group-template.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { TemplateLanguageSelectionComponent } from '@app/standalone/template-language-selection/template-language-selection.component';
import { TemplateTagSelectionComponent } from '@app/standalone/template-tag-selection/template-tag-selection.component';
import {
  CurrentUserTemplatesGql,
  PublishedTemplatesGql,
  QuestionnaireType,
  TemplateDetailsFragment,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { Observable, Subject, of } from 'rxjs';
import { ContentGroupTemplateSelectionComponent } from './content-group-template-selection.component';

function template(id: string): TemplateDetailsFragment {
  return {
    __typename: 'Template',
    id,
    aiGenerated: false,
    attribution: null,
    contentCount: 3,
    createdByCurrentUser: false,
    description: null,
    language: 'en',
    license: null,
    name: `Template ${id}`,
    published: true,
    questionnaireId: id,
    questionnaireType: QuestionnaireType.Quiz,
    tags: [],
  };
}

function connection(
  ids: string[],
  endCursor: string | null = null,
  hasNextPage = false
) {
  return {
    edges: ids.map((id) => ({ node: template(id), cursor: id })),
    pageInfo: { endCursor, hasNextPage, hasPreviousPage: false },
  };
}

describe('ContentGroupTemplateSelectionComponent', () => {
  let fixture: ComponentFixture<ContentGroupTemplateSelectionComponent>;
  let component: ContentGroupTemplateSelectionComponent;
  let publishedGql: jasmine.SpyObj<PublishedTemplatesGql>;
  let currentUserGql: jasmine.SpyObj<CurrentUserTemplatesGql>;
  let router: jasmine.SpyObj<Router>;
  let location: jasmine.SpyObj<Location>;

  interface SetUpOptions {
    showMyTemplates?: boolean;
    tagIds?: string[];
    lang?: string;
    shortId?: string;
    asBuilt?: boolean;
    currentUserTemplates$?: Observable<unknown>;
  }

  function setUp(options: SetUpOptions = {}) {
    publishedGql = jasmine.createSpyObj('PublishedTemplatesGql', ['fetch']);
    publishedGql.fetch.and.returnValue(
      of({
        data: { publishedTemplates: connection(['t-1', 't-2'], 't-2', true) },
      }) as never
    );
    currentUserGql = jasmine.createSpyObj('CurrentUserTemplatesGql', ['fetch']);
    currentUserGql.fetch.and.returnValue(
      (options.currentUserTemplates$ ??
        of({ data: { currentUserTemplates: connection(['mine']) } })) as never
    );
    router = jasmine.createSpyObj('Router', [
      'navigate',
      'createUrlTree',
      'serializeUrl',
    ]);
    router.serializeUrl.and.callFake((tree) => String(tree));
    router.createUrlTree.and.callFake(
      (commands) => ('/' + commands.join('/')) as never
    );
    location = jasmine.createSpyObj('Location', ['replaceState']);
    const routingService = jasmine.createSpyObj('RoutingService', [
      'getRoleRoute',
    ]);
    routingService.getRoleRoute.and.returnValue('edit');
    if (options.asBuilt) {
      // Without a strategy of its own, the AOT build compiles the component
      // OnPush, while TestBed's recompilation defaults to Eager. The child
      // components have their own specs.
      TestBed.overrideComponent(ContentGroupTemplateSelectionComponent, {
        set: { changeDetection: ChangeDetectionStrategy.OnPush },
      });
      TestBed.overrideComponent(ContentGroupTemplateSelectionComponent, {
        add: { schemas: [NO_ERRORS_SCHEMA] },
        remove: {
          imports: [
            ContentGroupTemplateComponent,
            LoadingIndicatorComponent,
            TemplateLanguageSelectionComponent,
            TemplateTagSelectionComponent,
          ],
        },
      });
    } else {
      TestBed.overrideComponent(ContentGroupTemplateSelectionComponent, {
        set: { template: '' },
      });
    }
    configureTestModule(
      [getTranslocoModule(), ContentGroupTemplateSelectionComponent],
      [
        { provide: PublishedTemplatesGql, useValue: publishedGql },
        { provide: CurrentUserTemplatesGql, useValue: currentUserGql },
        { provide: Router, useValue: router },
        { provide: Location, useValue: location },
        { provide: RoutingService, useValue: routingService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { data: { showMyTemplates: !!options.showMyTemplates } },
          },
        },
      ]
    ).compileComponents();
    fixture = TestBed.createComponent(ContentGroupTemplateSelectionComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('tagIds', options.tagIds);
    fixture.componentRef.setInput('lang', options.lang);
    fixture.componentRef.setInput('shortId', options.shortId);
    fixture.detectChanges();
  }

  it('is compiled OnPush by the build', () => {
    expect(
      (
        ContentGroupTemplateSelectionComponent as unknown as {
          ɵcmp: { onPush: boolean };
        }
      ).ɵcmp.onPush
    ).toBeTrue();
  });

  it('shows the templates once they have loaded', () => {
    const page$ = new Subject<unknown>();
    setUp({
      showMyTemplates: true,
      asBuilt: true,
      currentUserTemplates$: page$,
    });
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('app-loading-indicator')).not.toBeNull();
    page$.next({ data: { currentUserTemplates: connection(['a', 'b']) } });
    fixture.detectChanges();
    expect(element.querySelector('app-loading-indicator')).toBeNull();
    expect(element.querySelectorAll('app-content-group-template').length).toBe(
      2
    );
  });

  it('lists the first page of published templates of the language', () => {
    setUp({ lang: 'de' });
    expect(publishedGql.fetch).toHaveBeenCalledOnceWith({
      variables: {
        query: { language: 'de', tagIds: undefined },
        first: 50,
        after: undefined,
      },
      fetchPolicy: 'network-only',
    });
    expect(component.templates().map((t) => t.id)).toEqual(['t-1', 't-2']);
    expect(component.loadingTemplates()).toBeFalse();
  });

  it('leaves loading to the tag selection when tags are preselected', () => {
    setUp({ tagIds: ['tag-1'] });
    expect(publishedGql.fetch).not.toHaveBeenCalled();
    expect(component.tagIdsQueryParams()).toEqual(['tag-1']);
  });

  it('filters by the selected tags and keeps them in the URL', () => {
    setUp({ lang: 'en' });
    publishedGql.fetch.calls.reset();
    component.updateTags([
      { __typename: 'TemplateTag', id: 'tag-1', name: 'Math', verified: true },
    ]);
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledOnceWith([], {
      queryParams: { lang: 'en', tagIds: ['tag-1'] },
      replaceUrl: true,
    });
    expect(publishedGql.fetch.calls.first().args[0]?.variables).toEqual({
      query: { language: 'en', tagIds: ['tag-1'] },
      first: 50,
      after: undefined,
    });
  });

  it('lists the templates of the user on their route', () => {
    setUp({ showMyTemplates: true, tagIds: ['tag-1'] });
    expect(publishedGql.fetch).not.toHaveBeenCalled();
    expect(currentUserGql.fetch).toHaveBeenCalledOnceWith({
      variables: { first: 50, after: undefined },
      fetchPolicy: 'network-only',
    });
    expect(component.templates().map((t) => t.id)).toEqual(['mine']);
  });

  it('switches to the templates of the user without navigating', () => {
    setUp({ shortId: '12345678' });
    component.switchList({ index: 1 } as MatTabChangeEvent);
    fixture.detectChanges();
    expect(component.showPublic()).toBeFalse();
    expect(location.replaceState).toHaveBeenCalledOnceWith(
      '/edit/12345678/templates/my'
    );
    expect(component.templates().map((t) => t.id)).toEqual(['mine']);
  });

  it('opens the preview within the room', () => {
    setUp({ shortId: '12345678' });
    component.showPreview('t-1');
    expect(router.navigate).toHaveBeenCalledOnceWith([
      'edit',
      '12345678',
      'templates',
      't-1',
    ]);
  });
});
