import { BreakpointObserver } from '@angular/cdk/layout';
import { NO_ERRORS_SCHEMA, Type } from '@angular/core';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatIconButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatMenuHarness } from '@angular/material/menu/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslocoPipe } from '@jsverse/transloco';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { UserRole } from '@app/core/models/user-roles.enum';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { LocalFileService } from '@app/core/services/util/local-file.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import {
  Content,
  DeleteQuestionnaireGql,
  QuestionnaireByIdGql,
  QuestionnaireContentsByQuestionnaireIdGql,
  ResetQuestionnaireResultsGql,
  ToggleQuestionnairePublishedGql,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { BehaviorSubject, NEVER, Observable, Subject, of } from 'rxjs';
import { QuestionnairePageComponent } from './questionnaire-page.component';
import { QuestionnairePageService } from './questionnaire-page.service';

describe('QuestionnairePageComponent (creator)', () => {
  let fixture: ComponentFixture<QuestionnairePageComponent>;
  let component: QuestionnairePageComponent;
  let router: { events: Subject<unknown>; navigate: jasmine.Spy };
  let route: { firstChild: unknown };
  let contents$: BehaviorSubject<unknown>;
  let dialogService: jasmine.SpyObj<DialogService>;
  let globalStorageService: jasmine.SpyObj<GlobalStorageService>;
  let pageService: QuestionnairePageService;

  const contents = ['c-1', 'c-2'].map((id) => ({ id }) as Content);

  function childRoute(path: string, params: Record<string, string> = {}) {
    return { snapshot: { routeConfig: { path }, params } };
  }

  function spyProvider(token: Type<unknown>, methods: string[]) {
    return {
      provide: token,
      useValue: jasmine.createSpyObj(token.name, methods),
    };
  }

  function setUp(isDesktop = true, child: unknown = null, withMenu = false) {
    // The template only wires the logic exercised here to child components,
    // apart from the menu of the questionnaire.
    TestBed.overrideComponent(QuestionnairePageComponent, {
      set: withMenu
        ? {
            imports: [
              MatIconButton,
              MatMenu,
              MatMenuItem,
              MatMenuTrigger,
              TranslocoPipe,
            ],
            schemas: [NO_ERRORS_SCHEMA],
          }
        : { template: '', imports: [] },
    });
    router = { events: new Subject(), navigate: jasmine.createSpy('navigate') };
    route = { firstChild: child };
    // Like Apollo, report the pending request right on subscription.
    contents$ = new BehaviorSubject<unknown>({ loading: true });
    const contentsGql = jasmine.createSpyObj('ContentsGql', ['watch']);
    contentsGql.watch.and.returnValue({ valueChanges: contents$ });
    const questionnaireById = jasmine.createSpyObj('QuestionnaireByIdGql', [
      'watch',
    ]);
    questionnaireById.watch.and.returnValue({
      valueChanges: of({
        data: { questionnaireById: { id: 'q-1', name: 'Quiz' } },
      }),
    });
    const breakpointObserver = jasmine.createSpyObj('BreakpointObserver', [
      'observe',
    ]);
    breakpointObserver.observe.and.returnValue(
      new BehaviorSubject({ matches: isDesktop })
    );
    const authenticationService = jasmine.createSpyObj(
      'AuthenticationService',
      ['getCurrentAuthentication']
    );
    authenticationService.getCurrentAuthentication.and.returnValue(NEVER);
    const routingService = jasmine.createSpyObj('RoutingService', [
      'getRoleRoute',
    ]);
    routingService.getRoleRoute.and.returnValue('edit');
    dialogService = jasmine.createSpyObj('DialogService', [
      'openDeleteDialog',
      'openDialog',
    ]);
    globalStorageService = jasmine.createSpyObj('GlobalStorageService', [
      'setItem',
      'removeItem',
    ]);
    pageService = new QuestionnairePageService();

    configureTestModule(
      [getTranslocoModule(), QuestionnairePageComponent],
      [
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: route },
        { provide: BreakpointObserver, useValue: breakpointObserver },
        { provide: AuthenticationService, useValue: authenticationService },
        { provide: RoutingService, useValue: routingService },
        { provide: DialogService, useValue: dialogService },
        { provide: GlobalStorageService, useValue: globalStorageService },
        { provide: QuestionnairePageService, useValue: pageService },
        {
          provide: QuestionnaireContentsByQuestionnaireIdGql,
          useValue: contentsGql,
        },
        { provide: QuestionnaireByIdGql, useValue: questionnaireById },
        provideNoopAnimations(),
        spyProvider(ContentGroupService, ['updateGroupInMemoryStorage']),
        spyProvider(LocalFileService, ['generateFilename']),
        spyProvider(NotificationService, ['showAdvanced']),
        spyProvider(DeleteQuestionnaireGql, ['mutate']),
        spyProvider(ResetQuestionnaireResultsGql, ['mutate']),
        spyProvider(ToggleQuestionnairePublishedGql, ['mutate']),
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(QuestionnairePageComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('userRole', UserRole.OWNER);
    fixture.componentRef.setInput('roomId', 'room-1');
    fixture.componentRef.setInput('questionnaireId', 'q-1');
    fixture.componentRef.setInput('shortId', '12345678');
    fixture.detectChanges();
  }

  function emitContents(nodes: Content[]) {
    contents$.next({
      loading: false,
      data: {
        questionnaireContentsByQuestionnaireId: {
          edges: nodes.map((node) => ({ node })),
        },
      },
    });
    fixture.detectChanges();
  }

  function navigateTo(child: unknown) {
    route.firstChild = child;
    router.events.next(new NavigationEnd(1, '/', '/'));
  }

  it('shows the first content on desktop', () => {
    setUp();

    emitContents(contents);

    expect(router.navigate).toHaveBeenCalledWith(['c-1'], {
      relativeTo: route,
      replaceUrl: true,
    });
  });

  it('opens the content creation of an empty questionnaire on desktop', () => {
    setUp();

    emitContents([]);

    expect(router.navigate).toHaveBeenCalledWith(['create'], {
      relativeTo: route,
      replaceUrl: true,
    });
  });

  it('leaves the content list alone on mobile', () => {
    setUp(false);

    emitContents(contents);

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('keeps the content that is being edited', () => {
    setUp(true, childRoute('edit/:contentId', { contentId: 'c-2' }));

    emitContents(contents);

    expect(component.editMode).toBeTrue();
    expect(component.selectedContentId()).toBe('c-2');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('stays in the content creation', () => {
    setUp(true, childRoute('create'));

    emitContents(contents);

    expect(component.creationMode).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('returns to the selected content when the child route is left', () => {
    setUp(true, childRoute(':contentId', { contentId: 'c-2' }));
    emitContents(contents);

    navigateTo(null);

    expect(component.childActive).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['c-2'], {
      relativeTo: route,
      replaceUrl: true,
    });
  });

  it('switches between the leaderboard and the selected content', () => {
    setUp(true, childRoute(':contentId', { contentId: 'c-2' }));
    emitContents(contents);

    component.toggleLeaderboard();
    expect(router.navigate).toHaveBeenCalledWith(['.', 'leaderboard'], {
      relativeTo: route,
    });

    navigateTo(childRoute('leaderboard'));
    expect(component.showLeaderboard).toBeTrue();

    component.toggleLeaderboard();
    expect(router.navigate).toHaveBeenCalledWith(['.', 'c-2'], {
      relativeTo: route,
    });
  });

  it('stays on the attributions instead of opening the first content', () => {
    setUp(true, childRoute(':contentId', { contentId: 'c-2' }));
    emitContents(contents);
    router.navigate.calls.reset();

    navigateTo(childRoute('attributions'));
    fixture.detectChanges();

    expect(component.selectedContentId()).toBeUndefined();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('shows the content list after a content has been edited', () => {
    setUp();

    pageService.updateEditedContent(contents[0]);

    expect(router.navigate).toHaveBeenCalledWith(['.'], { relativeTo: route });
  });

  it('leaves for the room once the questionnaire has been deleted', () => {
    setUp();
    dialogService.openDeleteDialog.and.returnValue({
      afterClosed: () => of(true),
    } as never);

    component.deleteGroup();

    expect(router.navigate).toHaveBeenCalledWith(['edit', '12345678']);
    expect(globalStorageService.removeItem).toHaveBeenCalledWith(
      STORAGE_KEYS.LAST_GROUP
    );
  });

  it('resets the results of the questionnaire once confirmed', () => {
    setUp();
    const resetResults = TestBed.inject(
      ResetQuestionnaireResultsGql
    ) as unknown as jasmine.SpyObj<ResetQuestionnaireResultsGql>;
    resetResults.mutate.and.returnValue(of({}) as never);
    dialogService.openDeleteDialog.and.returnValue({
      afterClosed: () => of(true),
    } as never);

    component.deleteAllAnswers();

    const confirmAction = dialogService.openDeleteDialog.calls.mostRecent()
      .args[4] as () => Observable<unknown>;
    confirmAction().subscribe();
    expect(resetResults.mutate).toHaveBeenCalledWith(
      jasmine.objectContaining({ variables: { id: 'q-1' } })
    );
    expect(TestBed.inject(NotificationService).showAdvanced).toHaveBeenCalled();
  });

  it('drops the cached round stats once the results are reset', () => {
    setUp();
    const resetResults = TestBed.inject(
      ResetQuestionnaireResultsGql
    ) as unknown as jasmine.SpyObj<ResetQuestionnaireResultsGql>;
    resetResults.mutate.and.returnValue(of({}) as never);
    dialogService.openDeleteDialog.and.returnValue({
      afterClosed: () => of(false),
    } as never);
    component.deleteAllAnswers();
    (
      dialogService.openDeleteDialog.calls.mostRecent()
        .args[4] as () => Observable<unknown>
    )().subscribe();

    const cache = jasmine.createSpyObj('ApolloCache', ['modify']);
    const update = resetResults.mutate.calls.mostRecent().args[0]!
      .update as unknown as (cache: unknown) => void;
    update(cache);
    const { id, fields } = cache.modify.calls.mostRecent().args[0];
    expect(id).toBe('ROOT_QUERY');
    const DELETE = {};
    const modifier = fields as (
      value: unknown,
      details: { fieldName: string; DELETE: unknown }
    ) => unknown;
    expect(
      modifier('stats', {
        fieldName: 'questionnaireChoiceRoundStatsByRoundId',
        DELETE,
      })
    ).toBe(DELETE);
    expect(
      modifier('contents', {
        fieldName: 'questionnaireContentsByQuestionnaireId',
        DELETE,
      })
    ).toBe('contents');
  });

  it('keeps the results when resetting is cancelled', () => {
    setUp();
    dialogService.openDeleteDialog.and.returnValue({
      afterClosed: () => of(false),
    } as never);

    component.deleteAllAnswers();

    expect(
      TestBed.inject(NotificationService).showAdvanced
    ).not.toHaveBeenCalled();
  });

  it('remembers the questionnaire by its ID', () => {
    setUp();

    expect(globalStorageService.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.LAST_GROUP,
      'q-1'
    );
    expect(globalStorageService.setItem).not.toHaveBeenCalledWith(
      STORAGE_KEYS.LAST_GROUP,
      'Quiz'
    );
  });

  it('offers no CSV import or export while they are not available', async () => {
    setUp(true, null, true);
    emitContents(contents);
    const loader = TestbedHarnessEnvironment.loader(fixture);

    const menu = await loader.getHarness(
      MatMenuHarness.with({ selector: '[data-testid="group-more-menu"]' })
    );
    await menu.open();
    const items = await menu.getItems();
    const texts = await Promise.all(items.map((item) => item.getText()));
    expect(texts.join()).toContain('creator.content.export-content-group');
    expect(texts.join()).not.toContain('creator.import.import-contents');

    const exportItem =
      items[
        texts.findIndex((t) =>
          t.includes('creator.content.export-content-group')
        )
      ];
    const exportMenu = await exportItem.getSubmenu();
    expect(await exportMenu?.getItems()).toEqual([]);
  });
});
