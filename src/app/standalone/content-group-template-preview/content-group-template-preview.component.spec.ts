import { ChangeDetectionStrategy, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApolloCache } from '@apollo/client/core';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { ContentService } from '@app/core/services/http/content.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { ContentTemplatePreviewComponent } from '@app/standalone/_dialogs/content-template-preview/content-template-preview.component';
import { AddTemplateButtonComponent } from '@app/standalone/add-template-button/add-template-button.component';
import { BackButtonComponent } from '@app/standalone/back-button/back-button.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { QuestionnaireInfoComponent } from '@app/standalone/questionnaire-info/questionnaire-info.component';
import { TemplateLicenseComponent } from '@app/standalone/template-license/template-license.component';
import {
  ContentType,
  DeleteTemplateGql,
  QuestionnairePublishedContentsByQuestionnaireIdGql,
  QuestionnaireType,
  TemplateByIdDocument,
  TemplateByIdGql,
  TemplateDetailsFragment,
  ContentDetailsFragment,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { Apollo } from 'apollo-angular';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { Observable, Subject, of, throwError } from 'rxjs';
import { ContentGroupTemplatePreviewComponent } from './content-group-template-preview.component';

describe('ContentGroupTemplatePreviewComponent', () => {
  let fixture: ComponentFixture<ContentGroupTemplatePreviewComponent>;
  let component: ContentGroupTemplatePreviewComponent;
  let template$: Subject<unknown>;
  let templateGql: jasmine.SpyObj<TemplateByIdGql>;
  let contentsGql: jasmine.SpyObj<QuestionnairePublishedContentsByQuestionnaireIdGql>;
  let deleteGql: jasmine.SpyObj<DeleteTemplateGql>;
  let dialogOpen: jasmine.Spy;
  let dialogService: jasmine.SpyObj<DialogService>;
  let router: jasmine.SpyObj<Router>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let authService: jasmine.SpyObj<AuthenticationService>;
  let routingService: jasmine.SpyObj<RoutingService>;

  const template: TemplateDetailsFragment = {
    __typename: 'Template',
    id: 't-1',
    aiGenerated: false,
    attribution: null,
    contentCount: 2,
    createdByCurrentUser: true,
    description: null,
    language: 'de',
    license: null,
    name: 'Template',
    published: true,
    questionnaireId: 'tq-1',
    questionnaireType: QuestionnaireType.Quiz,
    tags: [],
  };

  const contents = ['c-1', 'c-2'].map(
    (id) =>
      ({
        id,
        body: id,
        formatData: { format: ContentType.Choice },
      }) as ContentDetailsFragment
  );

  beforeEach(() => {
    template$ = new Subject();
    templateGql = jasmine.createSpyObj('TemplateByIdGql', ['watch']);
    templateGql.watch.and.returnValue({ valueChanges: template$ } as never);
    contentsGql = jasmine.createSpyObj(
      'QuestionnairePublishedContentsByQuestionnaireIdGql',
      ['fetch']
    );
    contentsGql.fetch.and.returnValue(
      of({
        data: {
          questionnairePublishedContentsByQuestionnaireId: {
            edges: contents.map((node) => ({ node })),
          },
        },
      }) as never
    );
    deleteGql = jasmine.createSpyObj('DeleteTemplateGql', ['mutate']);
    dialogService = jasmine.createSpyObj('DialogService', ['openDeleteDialog']);
    dialogService.openDeleteDialog.and.returnValue({
      afterClosed: () => of(true),
    } as never);
    router = jasmine.createSpyObj('Router', ['navigate']);
    notificationService = jasmine.createSpyObj('NotificationService', [
      'showAdvanced',
      'showOnRequestClientError',
    ]);
    authService = jasmine.createSpyObj('AuthenticationService', [
      'getCurrentAuthentication',
    ]);
    authService.getCurrentAuthentication.and.returnValue(
      of({ verified: false }) as never
    );
    routingService = jasmine.createSpyObj('RoutingService', ['getRoute']);
    routingService.getRoute.and.returnValue('https://example.test/t/t-1');
  });

  function create(asBuilt = false) {
    if (asBuilt) {
      // Without a strategy of its own, the AOT build compiles the component
      // OnPush, while TestBed's recompilation defaults to Eager. The child
      // components have their own specs.
      TestBed.overrideComponent(ContentGroupTemplatePreviewComponent, {
        set: { changeDetection: ChangeDetectionStrategy.OnPush },
      });
      TestBed.overrideComponent(ContentGroupTemplatePreviewComponent, {
        add: { schemas: [NO_ERRORS_SCHEMA] },
        remove: {
          imports: [
            AddTemplateButtonComponent,
            BackButtonComponent,
            LoadingIndicatorComponent,
            QuestionnaireInfoComponent,
            TemplateLicenseComponent,
          ],
        },
      });
    } else {
      TestBed.overrideComponent(ContentGroupTemplatePreviewComponent, {
        set: { template: '' },
      });
    }
    configureTestModule(
      [getTranslocoModule(), ContentGroupTemplatePreviewComponent],
      [
        { provide: TemplateByIdGql, useValue: templateGql },
        {
          provide: QuestionnairePublishedContentsByQuestionnaireIdGql,
          useValue: contentsGql,
        },
        { provide: DeleteTemplateGql, useValue: deleteGql },
        { provide: DialogService, useValue: dialogService },
        { provide: Router, useValue: router },
        { provide: AuthenticationService, useValue: authService },
        { provide: RoutingService, useValue: routingService },
        { provide: NotificationService, useValue: notificationService },
        {
          provide: ContentService,
          useValue: { getTypeIcons: () => new Map() },
        },
      ]
    ).compileComponents();
    fixture = TestBed.createComponent(ContentGroupTemplatePreviewComponent);
    component = fixture.componentInstance;
    // The component's own imports provide the dialog service it injects.
    dialogOpen = spyOn(fixture.debugElement.injector.get(MatDialog), 'open');
    fixture.componentRef.setInput('templateId', 't-1');
    fixture.detectChanges();
  }

  function emitTemplate(t: TemplateDetailsFragment) {
    template$.next({ data: { templateById: t } });
    fixture.detectChanges();
  }

  it('is compiled OnPush by the build', () => {
    expect(
      (
        ContentGroupTemplatePreviewComponent as unknown as {
          ɵcmp: { onPush: boolean };
        }
      ).ɵcmp.onPush
    ).toBeTrue();
  });

  it('shows the template and its contents once they have loaded', () => {
    create(true);
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('.template-name')).toBeNull();
    emitTemplate(template);
    expect(element.querySelector('.template-name')?.textContent).toContain(
      'Template'
    );
    expect(element.querySelectorAll('mat-list-item').length).toBe(2);
  });

  it('loads the contents of the template questionnaire once', () => {
    create();
    expect(contentsGql.fetch).not.toHaveBeenCalled();
    emitTemplate(template);
    emitTemplate({ ...template, name: 'Renamed' });
    expect(contentsGql.fetch).toHaveBeenCalledOnceWith({
      variables: { questionnaireId: 'tq-1' },
    });
    expect(component.contents().map((c) => c.id)).toEqual(['c-1', 'c-2']);
    expect(component.isLoadingContents()).toBeFalse();
    expect(component.template()?.name).toBe('Renamed');
  });

  it('loads the contents of a template read from the cache', () => {
    create();
    // Opening a template again emits it from the cache right on subscription.
    const apollo = TestBed.inject(Apollo);
    apollo.client.writeQuery({
      query: TemplateByIdDocument,
      variables: { id: 't-1' },
      data: { templateById: template },
    });
    templateGql.watch.and.callFake(
      (options) =>
        apollo.watchQuery({ query: TemplateByIdDocument, ...options }) as never
    );
    const reopened = TestBed.createComponent(
      ContentGroupTemplatePreviewComponent
    );
    reopened.componentRef.setInput('templateId', 't-1');
    reopened.detectChanges();
    // The contents query follows the template on the next change detection.
    reopened.detectChanges();
    expect(reopened.componentInstance.template()).toEqual(template);
    expect(contentsGql.fetch).toHaveBeenCalledOnceWith({
      variables: { questionnaireId: 'tq-1' },
    });
    expect(reopened.componentInstance.isLoadingContents()).toBeFalse();
    expect(reopened.componentInstance.contents().map((c) => c.id)).toEqual([
      'c-1',
      'c-2',
    ]);
  });

  it('returns to the templates when the template does not exist', () => {
    create();
    template$.next({ data: { templateById: null } });
    expect(notificationService.showAdvanced).toHaveBeenCalledOnceWith(
      'templates.template-not-found',
      AdvancedSnackBarTypes.WARNING
    );
    expect(router.navigate).toHaveBeenCalledOnceWith(['templates']);
    expect(contentsGql.fetch).not.toHaveBeenCalled();
  });

  it('reports a failed template query and returns to the templates', () => {
    create();
    const error = new Error('Query failed');
    template$.next({ data: undefined, error });
    expect(notificationService.showOnRequestClientError).toHaveBeenCalledWith(
      error,
      jasmine.anything()
    );
    expect(router.navigate).toHaveBeenCalledOnceWith(['templates']);
  });

  it('returns to the templates when the template query errors', () => {
    create();
    template$.error(new Error('Query failed'));
    expect(notificationService.showOnRequestClientError).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledOnceWith(['templates']);
  });

  it('stays on a shown template that goes missing', () => {
    create();
    emitTemplate(template);
    template$.next({ data: { templateById: null } });
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.template()).toEqual(template);
  });

  it('stops loading the contents when their query fails', () => {
    create();
    spyOn(console, 'error');
    contentsGql.fetch.and.returnValue(
      throwError(() => new Error('Query failed'))
    );
    emitTemplate(template);
    expect(component.isLoadingContents()).toBeFalse();
    expect(component.contents()).toEqual([]);
    expect(console.error).toHaveBeenCalled();
  });

  it('marks a guest, who cannot report the template', () => {
    create();
    expect(component.isGuest()).toBeTrue();
    expect(component.url()).toBe('https://example.test/t/t-1');
  });

  it('previews a content in the language of the template', () => {
    create();
    emitTemplate(template);
    component.openPreview(contents[1]);
    expect(dialogOpen).toHaveBeenCalledOnceWith(
      ContentTemplatePreviewComponent,
      jasmine.objectContaining({
        data: { contents: component.contents(), index: 1, lang: 'de' },
      })
    );
  });

  it('deletes the template, evicts it and returns to the templates', () => {
    create();
    deleteGql.mutate.and.returnValue(of({ data: {} }) as never);
    component.deleteTemplate();
    const confirm = dialogService.openDeleteDialog.calls.mostRecent()
      .args[4] as () => Observable<unknown>;
    confirm();
    const options = deleteGql.mutate.calls.mostRecent().args[0]!;
    expect(options.variables).toEqual({ id: 't-1' });

    const cache = jasmine.createSpyObj<ApolloCache>('ApolloCache', [
      'identify',
      'evict',
      'gc',
    ]);
    cache.identify.and.returnValue('Template:t-1');
    const update = options.update as unknown as (
      cache: ApolloCache,
      result: { data: { deleteTemplate: boolean } }
    ) => void;
    update(cache, { data: { deleteTemplate: true } });
    expect(cache.identify).toHaveBeenCalledOnceWith({
      __typename: 'Template',
      id: 't-1',
    });
    expect(cache.evict).toHaveBeenCalledOnceWith({ id: 'Template:t-1' });
    expect(cache.gc).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledOnceWith(['templates']);
  });

  it('keeps the template in the cache when it was not deleted', () => {
    create();
    deleteGql.mutate.and.returnValue(of({ data: {} }) as never);
    component.deleteTemplate();
    (dialogService.openDeleteDialog.calls.mostRecent().args[4] as () => void)();
    const cache = jasmine.createSpyObj<ApolloCache>('ApolloCache', [
      'identify',
      'evict',
      'gc',
    ]);
    const update = deleteGql.mutate.calls.mostRecent().args[0]!
      .update as unknown as (
      cache: ApolloCache,
      result: { data: { deleteTemplate: boolean } }
    ) => void;
    update(cache, { data: { deleteTemplate: false } });
    expect(cache.evict).not.toHaveBeenCalled();
  });
});
