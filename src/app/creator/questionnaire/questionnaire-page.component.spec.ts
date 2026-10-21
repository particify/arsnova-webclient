import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, NO_ERRORS_SCHEMA, Type } from '@angular/core';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatIconButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatMenuHarness } from '@angular/material/menu/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { UserRole } from '@app/core/models/user-roles.enum';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { ContentCsvImportErrorReason } from '@app/core/models/content-csv-import-result';
import { DelimitedTextFormat } from '@app/core/models/delimited-text-format';
import { QuestionnaireCsvService } from '@app/core/services/http/questionnaire-csv.service';
import { ExportOptions } from '@app/creator/questionnaire/_dialogs/export/export.component';
import { BaseDialogComponent } from '@app/standalone/_dialogs/base-dialog/base-dialog.component';
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
  CreatorQuestionnaireContentUpdatedDocument,
  CreatorQuestionnaireContentUpdatedGql,
  DeleteQuestionnaireGql,
  QuestionnaireByIdDocument,
  QuestionnaireByIdGql,
  QuestionnaireChoiceRoundStatsByRoundIdDocument,
  QuestionnaireContentUpdatedGql,
  QuestionnaireContentsByQuestionnaireIdDocument,
  QuestionnaireContentsByQuestionnaireIdGql,
  QuestionnaireRoundsByContentIdDocument,
  QuestionnaireRoundsByContentIdQuery,
  QuestionnairePublishingMode,
  ResetQuestionnaireResultsDocument,
  ResetQuestionnaireResultsGql,
  ToggleQuestionnairePublishedGql,
  CreatorContentDetailsFragment,
} from '@gql/generated/graphql';
import { ApolloClient, ApolloLink, gql, InMemoryCache } from '@apollo/client';
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
  throwError,
} from 'rxjs';
import { QuestionnairePageComponent } from './questionnaire-page.component';
import { QuestionnairePageService } from './questionnaire-page.service';

describe('QuestionnairePageComponent (creator)', () => {
  let fixture: ComponentFixture<QuestionnairePageComponent>;
  let component: QuestionnairePageComponent;
  let router: { events: Subject<unknown>; navigate: jasmine.Spy };
  let route: { firstChild: unknown };
  let contents$: BehaviorSubject<unknown>;
  let breakpoint$: BehaviorSubject<{ matches: boolean }>;
  let dialogService: jasmine.SpyObj<DialogService>;
  let globalStorageService: jasmine.SpyObj<GlobalStorageService>;
  let pageService: QuestionnairePageService;
  let creatorContentUpdated: jasmine.SpyObj<CreatorQuestionnaireContentUpdatedGql>;
  let contentUpdated: jasmine.SpyObj<QuestionnaireContentUpdatedGql>;

  const contents = ['c-1', 'c-2'].map(
    (id) => ({ id }) as CreatorContentDetailsFragment
  );

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
    breakpoint$ = new BehaviorSubject({ matches: isDesktop });
    breakpointObserver.observe.and.returnValue(breakpoint$);
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
      'openExportDialog',
    ]);
    globalStorageService = jasmine.createSpyObj('GlobalStorageService', [
      'setItem',
      'removeItem',
    ]);
    pageService = new QuestionnairePageService();
    creatorContentUpdated = jasmine.createSpyObj(
      'CreatorQuestionnaireContentUpdatedGql',
      ['subscribe']
    );
    creatorContentUpdated.subscribe.and.returnValue(NEVER);
    contentUpdated = jasmine.createSpyObj('QuestionnaireContentUpdatedGql', [
      'subscribe',
    ]);
    contentUpdated.subscribe.and.returnValue(NEVER);

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
        {
          provide: CreatorQuestionnaireContentUpdatedGql,
          useValue: creatorContentUpdated,
        },
        { provide: QuestionnaireContentUpdatedGql, useValue: contentUpdated },
        provideNoopAnimations(),
        spyProvider(ContentGroupService, ['updateGroupInMemoryStorage']),
        spyProvider(LocalFileService, [
          'download',
          'generateFilename',
          'upload',
        ]),
        spyProvider(QuestionnaireCsvService, [
          'exportContents',
          'importContents',
        ]),
        spyProvider(NotificationService, [
          'showAdvanced',
          'showOnRequestClientError',
        ]),
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

    expect(component.editMode()).toBeTrue();
    expect(component.selectedContentId()).toBe('c-2');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('stays in the content creation', () => {
    setUp(true, childRoute('create'));

    emitContents(contents);

    expect(component.creationMode()).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('returns to the selected content when the child route is left', () => {
    setUp(true, childRoute(':contentId', { contentId: 'c-2' }));
    emitContents(contents);

    navigateTo(null);

    expect(component.childActive()).toBeFalse();
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
    expect(component.showLeaderboard()).toBeTrue();

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
          __typename: 'ContentConnection',
          edges: [
            {
              __typename: 'ContentEdge',
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

  it('marks a content answered once its first answer is pushed', () => {
    // The editor locks a content by its hasAnswers, read from the cached contents.
    const answered = gql`
      fragment Answered on Content {
        id
        hasAnswers
      }
    `;
    const cache = new InMemoryCache();
    cache.writeFragment({
      fragment: answered,
      data: { __typename: 'Content', id: 'c-1', hasAnswers: false },
    });

    cache.writeQuery({
      query: CreatorQuestionnaireContentUpdatedDocument,
      variables: { questionnaireId: 'q-1' },
      data: {
        questionnaireContentUpdated: {
          __typename: 'Content',
          id: 'c-1',
          answerCount: 1,
          abstentionCount: 0,
          correctAnswerCount: 1,
          hasAnswers: true,
          activeRound: null,
        },
      },
    });

    expect(
      cache.readFragment<{ hasAnswers: boolean }>({
        fragment: answered,
        id: 'Content:c-1',
      })?.hasAnswers
    ).toBeTrue();
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

  it('follows the answer counts through the creator-only content updates', () => {
    setUp();

    expect(creatorContentUpdated.subscribe).toHaveBeenCalledOnceWith({
      variables: { questionnaireId: 'q-1' },
    });
    expect(contentUpdated.subscribe).not.toHaveBeenCalled();
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

  /**
   * Without a strategy of its own, the AOT build compiles the page OnPush,
   * while TestBed's recompilation of an overridden component defaults to Eager.
   */
  function compileAsBuilt() {
    TestBed.overrideComponent(QuestionnairePageComponent, {
      set: { changeDetection: ChangeDetectionStrategy.OnPush },
    });
  }

  it('is compiled OnPush by the build', () => {
    expect(
      (QuestionnairePageComponent as unknown as { ɵcmp: { onPush: boolean } })
        .ɵcmp.onPush
    ).toBeTrue();
  });

  it('shows the creation on mobile as soon as it is navigated to', () => {
    compileAsBuilt();
    setUp(false, null, true);
    emitContents(contents);
    expect(query('.group-container')).not.toBeNull();

    navigateTo(childRoute('create'));
    fixture.detectChanges();

    expect(query('router-outlet')).not.toBeNull();
    expect(query('.group-container')).toBeNull();
  });

  it('shows the content list on mobile as soon as the creation is left', () => {
    compileAsBuilt();
    setUp(false, childRoute('create'), true);
    emitContents(contents);
    expect(query('router-outlet')).not.toBeNull();

    navigateTo(null);
    fixture.detectChanges();

    expect(query('.group-container')).not.toBeNull();
    expect(query('router-outlet')).toBeNull();
  });

  it('shows the content list next to the child view on desktop', () => {
    setUp(true, childRoute(':contentId', { contentId: 'c-2' }), true);
    emitContents(contents);
    fixture.detectChanges();

    expect(query('.group-container')).not.toBeNull();
    expect(query('.action-container router-outlet')).not.toBeNull();
    expect(query('app-back-button')).toBeNull();
  });

  it('offers CSV import and export in the questionnaire menu', async () => {
    setUp(true, null, true);
    emitContents(contents);
    const loader = TestbedHarnessEnvironment.loader(fixture);

    const menu = await loader.getHarness(
      MatMenuHarness.with({ selector: '[data-testid="group-more-menu"]' })
    );
    await menu.open();
    const items = await menu.getItems();
    const texts = await Promise.all(items.map((item) => item.getText()));
    expect(texts.join()).toContain('creator.import.import-contents');

    const exportItem =
      items[
        texts.findIndex((t) =>
          t.includes('creator.content.export-content-group')
        )
      ];
    // Hovering alone does not open the submenu in time.
    await exportItem.click();
    const exportMenu = await exportItem.getSubmenu();
    const exportItems = (await exportMenu?.getItems()) ?? [];
    expect(exportItems.length).toBe(1);
    expect(await exportItems[0].getText()).toBe('creator.export.export-series');
  });

  describe('CSV export', () => {
    let csvService: jasmine.SpyObj<QuestionnaireCsvService>;
    let localFileService: jasmine.SpyObj<LocalFileService>;
    const file$ = of(new Blob(['format\tbody']));

    function exportWith(options?: ExportOptions) {
      dialogService.openExportDialog.and.returnValue({
        afterClosed: () => of(options),
      } as never);
      component.exportToCsv();
    }

    beforeEach(() => {
      setUp();
      csvService = TestBed.inject(
        QuestionnaireCsvService
      ) as jasmine.SpyObj<QuestionnaireCsvService>;
      csvService.exportContents.and.returnValue(file$);
      localFileService = TestBed.inject(
        LocalFileService
      ) as jasmine.SpyObj<LocalFileService>;
      localFileService.generateFilename.and.returnValue('Quiz_12345678');
    });

    it('downloads the contents in the chosen format and charset', () => {
      exportWith({
        exportType: DelimitedTextFormat.TSV,
        charset: 'UTF-16LE',
      });

      expect(csvService.exportContents).toHaveBeenCalledOnceWith(
        'q-1',
        DelimitedTextFormat.TSV,
        'UTF-16LE'
      );
      expect(localFileService.download).toHaveBeenCalledOnceWith(
        file$,
        'Quiz_12345678.csv'
      );
    });

    it('does nothing when the export is cancelled', () => {
      exportWith(undefined);

      expect(csvService.exportContents).not.toHaveBeenCalled();
      expect(localFileService.download).not.toHaveBeenCalled();
    });
  });

  describe('CSV import', () => {
    let csvService: jasmine.SpyObj<QuestionnaireCsvService>;
    let notificationService: jasmine.SpyObj<NotificationService>;
    let refetchQueries: jasmine.Spy;

    function importFile(file: File, result$: Observable<unknown>) {
      const localFileService = TestBed.inject(
        LocalFileService
      ) as jasmine.SpyObj<LocalFileService>;
      localFileService.upload.and.returnValue(of(file));
      csvService.importContents.and.returnValue(result$ as never);
      component.importFromCsv();
    }

    beforeEach(() => {
      setUp();
      csvService = TestBed.inject(
        QuestionnaireCsvService
      ) as jasmine.SpyObj<QuestionnaireCsvService>;
      notificationService = TestBed.inject(
        NotificationService
      ) as jasmine.SpyObj<NotificationService>;
      refetchQueries = spyOn(
        TestBed.inject(Apollo).client,
        'refetchQueries'
      ).and.returnValue(Promise.resolve([]) as never);
    });

    it('uploads the file and refreshes the contents', () => {
      const file = new File(['format,body'], 'contents.csv');

      importFile(file, of({ totalLines: 1, importedLines: 1, errorLines: [] }));

      expect(csvService.importContents).toHaveBeenCalledOnceWith('q-1', file);
      expect(refetchQueries).toHaveBeenCalledOnceWith({
        include: [
          QuestionnaireContentsByQuestionnaireIdDocument,
          QuestionnaireByIdDocument,
        ],
      });
      expect(notificationService.showAdvanced).toHaveBeenCalledWith(
        'creator.content.import-successful',
        jasmine.anything()
      );
      expect(dialogService.openDialog).not.toHaveBeenCalled();
    });

    it('leaves a rejected file to the service', () => {
      importFile(
        new File(['nonsense'], 'contents.csv'),
        throwError(() => new Error('400'))
      );

      expect(refetchQueries).not.toHaveBeenCalled();
      expect(notificationService.showAdvanced).not.toHaveBeenCalled();
      expect(dialogService.openDialog).not.toHaveBeenCalled();
    });

    it('lists the skipped entries by reason', () => {
      const translate = spyOn(
        TestBed.inject(TranslocoService),
        'translate'
      ).and.callThrough();
      const file = new File(['format,body'], 'contents.csv');

      importFile(
        file,
        of({
          totalLines: 4,
          importedLines: 1,
          errorLines: [
            { line: 2, reason: ContentCsvImportErrorReason.UNKNOWN_FORMAT },
            { line: 3, reason: ContentCsvImportErrorReason.MISSING_BODY },
            { line: 4, reason: ContentCsvImportErrorReason.UNKNOWN_FORMAT },
          ],
        })
      );

      expect(translate).toHaveBeenCalledWith(
        'creator.dialog.csv-import-error-unknown-format',
        { entries: '2, 4' }
      );
      expect(translate).toHaveBeenCalledWith(
        'creator.dialog.csv-import-error-missing-body',
        { entries: '3' }
      );
      expect(dialogService.openDialog).toHaveBeenCalledOnceWith(
        BaseDialogComponent,
        jasmine.objectContaining({
          data: jasmine.objectContaining({
            headerLabel: 'creator.dialog.csv-import-errors-header',
          }),
        })
      );
      expect(notificationService.showAdvanced).not.toHaveBeenCalled();
    });
  });

  describe('quiz progress', () => {
    const scoredContents = [
      {
        id: 'c-1',
        hasCorrectAnswer: true,
        answerCount: 4,
        correctAnswerCount: 3,
        abstentionCount: 1,
      },
      {
        id: 'c-2',
        hasCorrectAnswer: true,
        answerCount: 5,
        correctAnswerCount: 2,
        abstentionCount: 0,
      },
      {
        id: 'c-3',
        hasCorrectAnswer: false,
        answerCount: 10,
        correctAnswerCount: null,
        abstentionCount: 5,
      },
    ] as Content[];

    it('averages the correct answers of the contents with a correct answer', () => {
      setUp();

      emitContents(scoredContents);

      // (75 % + 40 %) / 2, and 1 abstention of 10 responses
      expect(component.totalCorrect()).toBe(58);
      expect(component.totalAbstentions()).toBe(10);
      expect(component.progressColor()).toBe('orange');
    });

    it('follows the counts of the contents', () => {
      setUp();
      emitContents(scoredContents);

      emitContents([
        { ...scoredContents[0], correctAnswerCount: 4 },
        { ...scoredContents[1], correctAnswerCount: 5 },
      ]);

      expect(component.totalCorrect()).toBe(100);
      expect(component.progressColor()).toBe('blue');
    });

    it('has no progress before a content with a correct answer is answered', () => {
      setUp();

      emitContents([
        { ...scoredContents[0], answerCount: 0, correctAnswerCount: 0 },
        scoredContents[2],
      ]);

      expect(component.totalCorrect()).toBeUndefined();
    });

    it('shows the progress bar on the page', () => {
      setUp(true, childRoute(':contentId', { contentId: 'c-1' }), true);

      emitContents(scoredContents);
      fixture.detectChanges();

      expect(query('mat-progress-bar')?.className).toContain('progress-orange');
    });

    it('hides the progress bar while no answer is correct', () => {
      setUp(true, childRoute(':contentId', { contentId: 'c-1' }), true);

      emitContents([
        { ...scoredContents[0], correctAnswerCount: 0 },
        { ...scoredContents[1], correctAnswerCount: 0 },
      ]);
      fixture.detectChanges();

      expect(component.totalCorrect()).toBe(0);
      expect(query('mat-progress-bar')).toBeNull();
    });
  });

  it('hands the questionnaire to the results export extension', async () => {
    setUp(true, null, true, { published: true });
    emitContents(contents);
    const loader = TestbedHarnessEnvironment.loader(fixture);

    const menu = await loader.getHarness(
      MatMenuHarness.with({ selector: '[data-testid="group-more-menu"]' })
    );
    await menu.open();
    const items = await menu.getItems();
    const texts = await Promise.all(items.map((item) => item.getText()));
    await items[
      texts.findIndex((t) => t.includes('creator.content.export-content-group'))
    ].click();

    const extensionPoint = document.querySelector(
      'lib-extension-point[extensionid="series-results-export"]'
    ) as (Element & { extensionData?: unknown }) | null;
    expect(extensionPoint?.extensionData).toEqual({
      questionnaire: jasmine.objectContaining({ id: 'q-1', name: 'Quiz' }),
      shortId: '12345678',
    });
  });

  it('stops observing the breakpoint once destroyed', () => {
    setUp();
    expect(breakpoint$.observed).toBeTrue();

    fixture.destroy();

    expect(breakpoint$.observed).toBeFalse();
  });
});
