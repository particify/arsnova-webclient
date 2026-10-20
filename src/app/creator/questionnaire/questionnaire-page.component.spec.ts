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
import { ContentResultsService } from '@app/standalone/content-results/content-results.service';
import {
  Content,
  DeleteQuestionnaireGql,
  QuestionnaireByIdGql,
  QuestionnaireChoiceRoundStatsByRoundIdDocument,
  QuestionnaireContentsByQuestionnaireIdDocument,
  QuestionnaireContentsByQuestionnaireIdGql,
  QuestionnaireRoundsByContentIdDocument,
  QuestionnaireRoundsByContentIdQuery,
  QuestionnairePublishingMode,
  ResetQuestionnaireResultsDocument,
  ResetQuestionnaireResultsGql,
  ToggleQuestionnairePublishedGql,
} from '@gql/generated/graphql';
import { ApolloClient, ApolloLink } from '@apollo/client';
import { Apollo } from 'apollo-angular';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import {
  BehaviorSubject,
  NEVER,
  Observable,
  Subject,
  from,
  lastValueFrom,
  of,
} from 'rxjs';
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

  function setUp(
    isDesktop = true,
    child: unknown = null,
    withTemplate = false,
    questionnaire: Record<string, unknown> = {}
  ) {
    // Most of the logic exercised here is only wired to child components by
    // the template, so it is rendered only where the layout itself is tested.
    TestBed.overrideComponent(QuestionnairePageComponent, {
      set: withTemplate
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
        data: {
          questionnaireById: { id: 'q-1', name: 'Quiz', ...questionnaire },
        },
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

  it('shows the content a live questionnaire is running on desktop', () => {
    setUp(true, null, false, {
      publishingMode: QuestionnairePublishingMode.Live,
      activeRound: { id: 'r-1', contentId: 'c-2', roundNo: 1, closed: false },
    });
    emitContents(contents);

    expect(router.navigate).toHaveBeenCalledWith(['c-2'], {
      relativeTo: route,
      replaceUrl: true,
    });
  });

  it('shows the first content once the live round is stopped', () => {
    setUp(true, null, false, {
      publishingMode: QuestionnairePublishingMode.Live,
      activeRound: { id: 'r-1', contentId: 'c-2', roundNo: 1, closed: true },
    });
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

  function openSettingsWith(nodes: Content[]): unknown {
    setUp();
    emitContents(nodes);
    dialogService.openDialog.and.returnValue({
      afterClosed: () => of(undefined),
    } as never);

    component.openSettings();

    const config = dialogService.openDialog.calls.mostRecent().args[1] as {
      data: { alreadyAnswered: boolean };
    };
    return config.data.alreadyAnswered;
  }

  it('tells the settings that answers exist once any content has them', () => {
    expect(
      openSettingsWith([
        { id: 'c-1', hasAnswers: false, answerCount: 0 },
        { id: 'c-2', hasAnswers: true, answerCount: 0 },
      ] as Content[])
    ).toBeTrue();
  });

  it('tells the settings that no answers exist without any content having them', () => {
    expect(
      openSettingsWith([
        { id: 'c-1', hasAnswers: false, answerCount: 0 },
        { id: 'c-2', hasAnswers: false, answerCount: 0 },
      ] as Content[])
    ).toBeFalse();
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

  it('reloads the contents once the results are reset', () => {
    setUp();
    const resetResults = TestBed.inject(
      ResetQuestionnaireResultsGql
    ) as unknown as jasmine.SpyObj<ResetQuestionnaireResultsGql>;
    resetResults.mutate.and.returnValue(of({}) as never);
    dialogService.openDeleteDialog.and.returnValue({
      afterClosed: () => of(false),
    } as never);
    const contentResultsService = TestBed.inject(ContentResultsService);
    contentResultsService.setPresentationSelectedRoundIds('c-1', ['round-1']);
    component.deleteAllAnswers();
    (
      dialogService.openDeleteDialog.calls.mostRecent()
        .args[4] as () => Observable<unknown>
    )().subscribe();

    const { refetchQueries, awaitRefetchQueries, update } =
      resetResults.mutate.calls.mostRecent().args[0]!;
    (update as unknown as () => void)();

    expect(refetchQueries).toEqual([
      {
        query: QuestionnaireContentsByQuestionnaireIdDocument,
        variables: { questionnaireId: 'q-1' },
      },
    ]);
    expect(awaitRefetchQueries).toBeTrue();
    expect(
      contentResultsService.presentationSelectedRoundIds('c-1')
    ).toBeUndefined();
  });

  describe('reset against the cache', () => {
    let client: ApolloClient;
    let roundId: string;

    function round(id: string) {
      return {
        __typename: 'Round',
        id,
        contentId: 'c-1',
        roundNo: 1,
        closed: false,
        started: true,
        answeringEndTime: null,
        answerable: true,
      };
    }

    // The server deletes every round and starts each content over with a new one.
    const responses: Record<string, () => unknown> = {
      QuestionnaireRoundsByContentId: () => ({
        questionnaireRoundsByContentId: [round(roundId)],
      }),
      QuestionnaireChoiceRoundStatsByRoundId: () => ({
        questionnaireChoiceRoundStatsByRoundId: {
          __typename: 'ChoiceContentRoundStats',
          selectionCounts: roundId === 'round-old' ? [3, 1] : [0, 0],
        },
      }),
      QuestionnaireContentsByQuestionnaireId: () => ({
        questionnaireContentsByQuestionnaireId: {
          __typename: 'QuestionnaireContentConnection',
          edges: [
            {
              __typename: 'QuestionnaireContentEdge',
              node: {
                __typename: 'Content',
                id: 'c-1',
                body: 'Quiz question',
                bodyRendered: null,
                formatData: {
                  __typename: 'SlideContentFormatData',
                  format: 'SLIDE',
                },
                duration: null,
                abstentionsAllowed: true,
                hasCorrectAnswer: false,
                weight: 1,
                answerCount: 0,
                abstentionCount: 0,
                position: 0,
                correctAnswerCount: 0,
                hasAnswers: false,
                activeRound: round(roundId),
              },
            },
          ],
        },
      }),
      ResetQuestionnaireResults: () => ({ resetQuestionnaireResults: true }),
    };

    async function roundIds() {
      const { data } = await client.query<QuestionnaireRoundsByContentIdQuery>({
        query: QuestionnaireRoundsByContentIdDocument,
        variables: { contentId: 'c-1' },
      });
      return data?.questionnaireRoundsByContentId?.map((r) => r.id);
    }

    function cachedStats(id: string) {
      return client.cache.readQuery({
        query: QuestionnaireChoiceRoundStatsByRoundIdDocument,
        variables: { roundId: id },
      });
    }

    async function reset() {
      const resetResults = TestBed.inject(
        ResetQuestionnaireResultsGql
      ) as unknown as jasmine.SpyObj<ResetQuestionnaireResultsGql>;
      resetResults.mutate.and.callFake(
        (options) =>
          from(
            client.mutate({
              ...(options as object),
              mutation: ResetQuestionnaireResultsDocument,
            })
          ) as never
      );
      dialogService.openDeleteDialog.and.returnValue({
        afterClosed: () => of(false),
      } as never);
      component.deleteAllAnswers();
      roundId = 'round-new';
      await lastValueFrom(
        (
          dialogService.openDeleteDialog.calls.mostRecent()
            .args[4] as () => Observable<unknown>
        )()
      );
    }

    beforeEach(async () => {
      setUp();
      roundId = 'round-old';
      client = TestBed.inject(Apollo).client;
      client.setLink(
        new ApolloLink(
          (operation) =>
            of({ data: responses[operation.operationName!]() }) as never
        )
      );
      // The presentation showed the results of the content before it was left.
      expect(await roundIds()).toEqual(['round-old']);
      await client.query({
        query: QuestionnaireChoiceRoundStatsByRoundIdDocument,
        variables: { roundId: 'round-old' },
      });
    });

    it('replaces the cached rounds of contents not on screen', async () => {
      await reset();

      // Entering the presentation again reads the rounds like before.
      expect(await roundIds()).toEqual(['round-new']);
    });

    it('forgets the stats of the deleted rounds', async () => {
      await reset();

      expect(cachedStats('round-old')).toBeNull();
    });
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

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  it('shows the child view with a back button on mobile', () => {
    setUp(false, childRoute(':contentId', { contentId: 'c-2' }), true);
    emitContents(contents);
    fixture.detectChanges();

    expect(query('app-back-button')).not.toBeNull();
    expect(query('router-outlet')).not.toBeNull();
    expect(query('.group-container')).toBeNull();
  });

  it('shows only the content list on mobile without a child view', () => {
    setUp(false, null, true);
    emitContents(contents);
    fixture.detectChanges();

    expect(query('.group-container')).not.toBeNull();
    expect(query('router-outlet')).toBeNull();
    expect(query('app-back-button')).toBeNull();
  });

  it('shows the content list next to the child view on desktop', () => {
    setUp(true, childRoute(':contentId', { contentId: 'c-2' }), true);
    emitContents(contents);
    fixture.detectChanges();

    expect(query('.group-container')).not.toBeNull();
    expect(query('.action-container router-outlet')).not.toBeNull();
    expect(query('app-back-button')).toBeNull();
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
