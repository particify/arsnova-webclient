import { failedOperation } from '@testing/graphql-fixtures';
import { Type } from '@angular/core';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuHarness } from '@angular/material/menu/testing';
import { CombinedGraphQLErrors } from '@apollo/client';
import { Router } from '@angular/router';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ContentService } from '@app/core/services/http/content.service';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { ContentResultsService } from '@app/standalone/content-results/content-results.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import {
  Content,
  ContentType,
  CopyQuestionnaireContentToQuestionnaireGql,
  DeleteQuestionnaireAnswersByContentIdGql,
  DeleteQuestionnaireContentGql,
  DuplicateQuestionnaireContentGql,
  MoveQuestionnaireContentToQuestionnaireGql,
  PublishQuestionnaireUpToContentGql,
  Questionnaire,
  QuestionnairePublishingMode,
  QuestionnaireRoundsByContentIdDocument,
  QuestionnairesByRoomIdGql,
  QuestionnaireType,
  ResetBannedQuestionnaireShortAnswerContentKeywordsGql,
  ResetBannedQuestionnaireWordcloudContentKeywordsGql,
  StartQuestionnaireContentGql,
  StartQuestionnaireContentRoundGql,
  StopQuestionnaireContentGql,
  ToggleQuestionnaireTextContentAnswersPublishedGql,
  UpdateQuestionnaireContentOrderGql,
} from '@gql/generated/graphql';
import { ServerTimeService } from '@app/core/services/util/server-time.service';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { TranslocoService } from '@jsverse/transloco';
import { NEVER, Observable, of, throwError } from 'rxjs';
import { ContentListComponent } from './content-list.component';

describe('ContentListComponent', () => {
  let fixture: ComponentFixture<ContentListComponent>;
  let component: ContentListComponent;
  let gql: Map<Type<unknown>, jasmine.SpyObj<{ mutate: unknown }>>;
  let questionnairesByRoomId: jasmine.SpyObj<QuestionnairesByRoomIdGql>;
  let dialogService: jasmine.SpyObj<DialogService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let router: Router;
  let translate: jasmine.Spy;

  const contents = ['c-0', 'c-1', 'c-2', 'c-3', 'c-4'].map(
    (id, position) =>
      ({
        id,
        position,
        body: `Content ${position}`,
        formatData: { format: ContentType.Choice },
      }) as Content
  );

  function questionnaire(overrides: Partial<Questionnaire> = {}) {
    return {
      id: 'q-1',
      name: 'Questionnaire',
      published: true,
      publishingMode: QuestionnairePublishingMode.All,
      type: QuestionnaireType.Mixed,
      ...overrides,
    } as Questionnaire;
  }

  function mutationSpy(token: Type<unknown>) {
    const spy = jasmine.createSpyObj(token.name, ['mutate']);
    spy.mutate.and.returnValue(of({ data: {} }));
    gql.set(token, spy);
    return { provide: token, useValue: spy };
  }

  function mutation(token: Type<unknown>) {
    return gql.get(token)!.mutate as jasmine.Spy;
  }

  function setUp(
    q = questionnaire(),
    selectedContentId?: string,
    listedContents = contents
  ) {
    gql = new Map();
    questionnairesByRoomId = jasmine.createSpyObj('QuestionnairesByRoomIdGql', [
      'watch',
    ]);
    questionnairesByRoomId.watch.and.returnValue({
      valueChanges: of({
        data: {
          questionnairesByRoomId: [
            { id: 'q-1', name: 'Questionnaire', type: QuestionnaireType.Mixed },
            { id: 'q-2', name: 'Other', type: QuestionnaireType.Quiz },
          ],
        },
      }),
    } as never);
    const contentService = jasmine.createSpyObj('ContentService', [
      'getTypeIcons',
      'hasFormatRounds',
    ]);
    contentService.getTypeIcons.and.returnValue(new Map());
    contentService.hasFormatRounds.and.returnValue(true);
    const contentGroupService = jasmine.createSpyObj('ContentGroupService', [
      'isContentCompatibleWithQuestionnaireType',
    ]);
    contentGroupService.isContentCompatibleWithQuestionnaireType.and.returnValue(
      true
    );
    dialogService = jasmine.createSpyObj('DialogService', [
      'openDeleteDialog',
      'openQuestionnaireCreationDialog',
      'openStartNewRoundDialog',
    ]);
    notificationService = jasmine.createSpyObj('NotificationService', [
      'showAdvanced',
      'showOnRequestClientError',
    ]);

    configureTestModule(
      [getTranslocoModule(), ContentListComponent],
      [
        { provide: ContentService, useValue: contentService },
        { provide: ContentGroupService, useValue: contentGroupService },
        { provide: DialogService, useValue: dialogService },
        { provide: NotificationService, useValue: notificationService },
        { provide: FormattingService, useValue: { postString: () => of('') } },
        {
          provide: QuestionnairesByRoomIdGql,
          useValue: questionnairesByRoomId,
        },
        mutationSpy(CopyQuestionnaireContentToQuestionnaireGql),
        mutationSpy(DeleteQuestionnaireAnswersByContentIdGql),
        mutationSpy(DeleteQuestionnaireContentGql),
        mutationSpy(DuplicateQuestionnaireContentGql),
        mutationSpy(MoveQuestionnaireContentToQuestionnaireGql),
        mutationSpy(ResetBannedQuestionnaireShortAnswerContentKeywordsGql),
        mutationSpy(ResetBannedQuestionnaireWordcloudContentKeywordsGql),
        mutationSpy(UpdateQuestionnaireContentOrderGql),
        mutationSpy(PublishQuestionnaireUpToContentGql),
        mutationSpy(StartQuestionnaireContentGql),
        mutationSpy(StartQuestionnaireContentRoundGql),
        mutationSpy(StopQuestionnaireContentGql),
        mutationSpy(ToggleQuestionnaireTextContentAnswersPublishedGql),
      ]
    ).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    translate = spyOn(TestBed.inject(TranslocoService), 'translate');
    translate.and.callThrough();
    fixture = TestBed.createComponent(ContentListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('roomId', 'room-1');
    fixture.componentRef.setInput('questionnaire', q);
    fixture.componentRef.setInput('contents', listedContents);
    fixture.componentRef.setInput('selectedContentId', selectedContentId);
    fixture.detectChanges();
  }

  function confirmDeletion(id: string) {
    dialogService.openDeleteDialog.and.returnValue({
      afterClosed: () => of(true),
    } as never);
    component.deleteContent(id, 'Body');
  }

  function translationParams(key: string) {
    return translate.calls
      .allArgs()
      .filter(([k]) => k === key)
      .map(([, params]) => params);
  }

  function contentOrder() {
    return component.sortableContents().map((c) => c.id);
  }

  function submittedOrder() {
    return mutation(UpdateQuestionnaireContentOrderGql).calls.mostRecent()
      .args[0].variables;
  }

  it('lists every content of the questionnaire', () => {
    setUp();

    const items = fixture.nativeElement.querySelectorAll(
      '[data-testid="content-item"]'
    );
    expect(items.length).toBe(contents.length);
  });

  it('offers the questionnaires of the room as copy and move targets', () => {
    setUp();

    expect(questionnairesByRoomId.watch).toHaveBeenCalledWith({
      variables: { roomId: 'room-1' },
    });
    expect(component.questionnaires().map((q) => q.id)).toEqual(['q-1', 'q-2']);
  });

  it('saves the new order after a content has been moved', () => {
    setUp();

    component.dropContent(0, 2);

    expect(contentOrder()).toEqual(['c-1', 'c-2', 'c-0', 'c-3', 'c-4']);
    expect(submittedOrder()).toEqual({
      questionnaireId: 'q-1',
      contentIds: ['c-1', 'c-2', 'c-0', 'c-3', 'c-4'],
    });
  });

  it('does not save anything if a content is dropped in place', () => {
    setUp();

    component.dropContent(1, 1);

    expect(mutation(UpdateQuestionnaireContentOrderGql)).not.toHaveBeenCalled();
  });

  it('restores the previous order if saving the order fails', () => {
    setUp();
    mutation(UpdateQuestionnaireContentOrderGql).and.returnValue(
      throwError(() => new Error('failed'))
    );

    component.dropContent(0, 2);

    expect(contentOrder()).toEqual(['c-0', 'c-1', 'c-2', 'c-3', 'c-4']);
  });

  it('skips the publishing divider when sorting a range-published questionnaire', () => {
    setUp(
      questionnaire({
        publishingMode: QuestionnairePublishingMode.UpTo,
        publishedUpToContent: { id: 'c-1', position: 1 } as Content,
      })
    );

    // The divider sits at list index 2, so list index 4 is content index 3.
    component.dropContent(4, 0);

    expect(submittedOrder().contentIds).toEqual([
      'c-3',
      'c-0',
      'c-1',
      'c-2',
      'c-4',
    ]);
  });

  it('duplicates a content and confirms it', () => {
    setUp();
    mutation(DuplicateQuestionnaireContentGql).and.returnValue(
      of({ data: { duplicateQuestionnaireContent: { id: 'c-5' } } })
    );

    component.duplicateContent('c-1');

    expect(
      mutation(DuplicateQuestionnaireContentGql).calls.mostRecent().args[0]
        .variables
    ).toEqual({ id: 'c-1' });
    expect(notificationService.showAdvanced).toHaveBeenCalled();
  });

  it('copies a content to another questionnaire', () => {
    setUp();

    component.performContentAction('copy', 'c-1', { id: 'q-2', name: 'Other' });

    expect(
      mutation(CopyQuestionnaireContentToQuestionnaireGql).calls.mostRecent()
        .args[0].variables
    ).toEqual({ contentId: 'c-1', questionnaireId: 'q-2' });
    expect(
      mutation(MoveQuestionnaireContentToQuestionnaireGql)
    ).not.toHaveBeenCalled();
    expect(notificationService.showAdvanced).toHaveBeenCalled();
  });

  it('moves a content to a newly created questionnaire', () => {
    setUp();
    dialogService.openQuestionnaireCreationDialog.and.returnValue({
      afterClosed: () => of({ id: 'q-new', name: 'New' }),
    } as never);

    component.performContentAction('move', 'c-1');

    expect(dialogService.openQuestionnaireCreationDialog).toHaveBeenCalledWith(
      'room-1'
    );
    expect(
      mutation(MoveQuestionnaireContentToQuestionnaireGql).calls.mostRecent()
        .args[0].variables
    ).toEqual({ contentId: 'c-1', questionnaireId: 'q-new' });
  });

  it('moves nothing if creating a questionnaire is cancelled', () => {
    setUp();
    dialogService.openQuestionnaireCreationDialog.and.returnValue({
      afterClosed: () => of(undefined),
    } as never);

    component.performContentAction('move', 'c-1');

    expect(
      mutation(MoveQuestionnaireContentToQuestionnaireGql)
    ).not.toHaveBeenCalled();
    expect(notificationService.showAdvanced).not.toHaveBeenCalled();
  });

  it('deletes a content once confirmed', () => {
    setUp();
    dialogService.openDeleteDialog.and.returnValue({
      afterClosed: () => of(true),
    } as never);

    component.deleteContent('c-1', 'Content 1');

    const confirmAction = dialogService.openDeleteDialog.calls.mostRecent()
      .args[4] as () => Observable<unknown>;
    confirmAction().subscribe();
    expect(
      mutation(DeleteQuestionnaireContentGql).calls.mostRecent().args[0]
        .variables
    ).toEqual({ id: 'c-1' });
    expect(notificationService.showAdvanced).toHaveBeenCalled();
    // Without a selected content there is no detail view to leave.
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('stays on the selected content when another one is deleted', () => {
    setUp(questionnaire(), 'c-2');

    confirmDeletion('c-1');

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('shows the next content once the selected one is deleted', () => {
    setUp(questionnaire(), 'c-1');

    confirmDeletion('c-1');

    expect((router.navigate as jasmine.Spy).calls.mostRecent().args[0]).toEqual(
      ['.', 'c-2']
    );
  });

  it('shows the previous content once the selected last one is deleted', () => {
    setUp(questionnaire(), 'c-4');

    confirmDeletion('c-4');

    expect((router.navigate as jasmine.Spy).calls.mostRecent().args[0]).toEqual(
      ['.', 'c-3']
    );
  });

  it('opens the content creation once the only content is deleted', () => {
    setUp(questionnaire(), 'c-0', [contents[0]]);

    confirmDeletion('c-0');

    expect((router.navigate as jasmine.Spy).calls.mostRecent().args[0]).toEqual(
      ['.', 'create']
    );
  });

  it('skips the divider when published up to the first content', () => {
    setUp(
      questionnaire({
        publishingMode: QuestionnairePublishingMode.UpTo,
        publishedUpToContent: { id: 'c-0', position: 0 } as Content,
      })
    );

    // The divider sits at list index 1, so list index 2 is content index 1.
    component.dropContent(2, 0);

    expect(submittedOrder().contentIds).toEqual([
      'c-1',
      'c-0',
      'c-2',
      'c-3',
      'c-4',
    ]);
  });

  it('announces each content with its position in the list', () => {
    setUp();

    const params = translationParams(
      'creator.content.a11y-content-item-selected'
    );
    expect(params.length).toBe(contents.length);
    expect(params[1]).toEqual(
      jasmine.objectContaining({ index: 2, length: contents.length })
    );
  });

  it('announces the publishing divider by the human position', () => {
    setUp(
      questionnaire({
        publishingMode: QuestionnairePublishingMode.UpTo,
        publishedUpToContent: { id: 'c-1', position: 1 } as Content,
      })
    );

    expect(
      translationParams('creator.content.publishing-index-info')
    ).toContain({ index: 2 });
  });

  it('reloads the rounds of the content once its answers are deleted', () => {
    setUp();
    const contentResultsService = TestBed.inject(ContentResultsService);
    contentResultsService.setPresentationSelectedRoundIds(contents[1].id, [
      'round-1',
      'round-2',
    ]);

    component.deleteAnswers(contents[1]);
    (
      dialogService.openDeleteDialog.calls.mostRecent()
        .args[4] as () => Observable<unknown>
    )().subscribe();
    const { refetchQueries, update } = mutation(
      DeleteQuestionnaireAnswersByContentIdGql
    ).calls.mostRecent().args[0];
    (update as () => void)();

    expect(refetchQueries).toContain({
      query: QuestionnaireRoundsByContentIdDocument,
      variables: { contentId: contents[1].id },
    });
    expect(
      contentResultsService.presentationSelectedRoundIds(contents[1].id)
    ).toBeUndefined();
  });

  describe('publishing range', () => {
    const upTo = (position: number) =>
      questionnaire({
        publishingMode: QuestionnairePublishingMode.UpTo,
        publishedUpToContent: {
          id: `c-${position}`,
          position,
        } as Content,
      });

    function publishedUpTo() {
      return mutation(PublishQuestionnaireUpToContentGql).calls.mostRecent()
        .args[0].variables;
    }

    it('publishes up to the content above the dropped divider', () => {
      setUp(upTo(1));

      component.dropPublishingDivider({ currentIndex: 4 } as never);

      expect(publishedUpTo()).toEqual({
        questionnaireId: 'q-1',
        contentId: 'c-3',
      });
      expect(component.publishedContentId()).toBe('c-3');
    });

    it('publishes nothing if the divider is dropped in place', () => {
      setUp(upTo(1));

      component.dropPublishingDivider({ currentIndex: 2 } as never);

      expect(
        mutation(PublishQuestionnaireUpToContentGql)
      ).not.toHaveBeenCalled();
    });

    it('moves the divider back if publishing fails', () => {
      setUp(upTo(1));
      mutation(PublishQuestionnaireUpToContentGql).and.returnValue(
        throwError(() => new Error('failed'))
      );

      component.dropPublishingDivider({ currentIndex: 4 } as never);

      expect(component.publishedContentId()).toBe('c-1');
    });

    it('unlocks the contents above the divider before publishing is confirmed', () => {
      setUp(upTo(1));
      mutation(PublishQuestionnaireUpToContentGql).and.returnValue(NEVER);

      component.dropPublishingDivider({ currentIndex: 4 } as never);
      fixture.detectChanges();

      const locked = fixture.nativeElement.querySelectorAll(
        '[data-testid="content-item"].locked-item'
      );
      expect(locked.length).toBe(1);
      expect(component.isPublished(3)).toBeTrue();
      expect(component.isPublished(4)).toBeFalse();
    });

    it('moves the divider by keyboard', () => {
      setUp(upTo(1));

      component.movePublishingDividerDown(1);
      expect(publishedUpTo().contentId).toBe('c-2');

      component.movePublishingDividerUp(1);
      expect(publishedUpTo().contentId).toBe('c-0');
    });

    it('keeps the divider fixed in live mode', () => {
      setUp(
        questionnaire({
          publishingMode: QuestionnairePublishingMode.Live,
          publishedUpToContent: { id: 'c-1', position: 1 } as Content,
        })
      );

      component.movePublishingDividerDown(1);

      expect(
        mutation(PublishQuestionnaireUpToContentGql)
      ).not.toHaveBeenCalled();
    });
  });

  describe('live mode', () => {
    const live = (activeRound?: Partial<Content['activeRound']>) =>
      questionnaire({
        publishingMode: QuestionnairePublishingMode.Live,
        publishedUpToContent: { id: 'c-1', position: 1 } as Content,
        activeRound: activeRound as Questionnaire['activeRound'],
      });

    function liveRows() {
      return Array.from(
        fixture.nativeElement.querySelectorAll(
          '.live-info'
        ) as NodeListOf<HTMLElement>
      ).map((e) => e.textContent?.trim());
    }

    it('starts a content and tells the page about it', () => {
      setUp(live());
      const started = jasmine.createSpy('startedContentChanged');
      component.startedContentChanged.subscribe(started);
      mutation(StartQuestionnaireContentGql).and.returnValue(
        of({ data: { startQuestionnaireContent: { id: 'round-1' } } })
      );

      component.startContent('c-1');

      expect(
        mutation(StartQuestionnaireContentGql).calls.mostRecent().args[0]
          .variables
      ).toEqual({ contentId: 'c-1' });
      expect(started).toHaveBeenCalledWith('c-1');
      expect(notificationService.showAdvanced).toHaveBeenCalled();
    });

    it('reports a content that failed to start and tells the page nothing', () => {
      setUp(live());
      const started = jasmine.createSpy('startedContentChanged');
      component.startedContentChanged.subscribe(started);
      mutation(StartQuestionnaireContentGql).and.returnValue(failedOperation());

      component.startContent('c-1');

      expect(started).not.toHaveBeenCalled();
      expect(notificationService.showAdvanced).toHaveBeenCalledOnceWith(
        jasmine.any(String),
        AdvancedSnackBarTypes.FAILED
      );
    });

    it('stops the running content of the questionnaire', () => {
      setUp(live({ id: 'round-1', closed: false, answerable: true }));
      mutation(StopQuestionnaireContentGql).and.returnValue(
        of({ data: { stopQuestionnaireContent: { id: 'round-1' } } })
      );

      component.stopContent();

      expect(
        mutation(StopQuestionnaireContentGql).calls.mostRecent().args[0]
          .variables
      ).toEqual({ questionnaireId: 'q-1' });
      expect(notificationService.showAdvanced).toHaveBeenCalled();
    });

    it('offers starting a content of any format', () => {
      const wordcloud = contents.map((c) => ({
        ...c,
        formatData: { format: ContentType.Wordcloud },
      })) as Content[];
      setUp(live(), undefined, wordcloud);
      // Only some formats support several rounds; starting the first one must not depend on it.
      (
        TestBed.inject(ContentService) as unknown as {
          hasFormatRounds: jasmine.Spy;
        }
      ).hasFormatRounds.and.callFake((format: ContentType) =>
        [ContentType.Choice, ContentType.Scale].includes(format)
      );
      fixture.detectChanges();

      const startButtons = fixture.nativeElement.querySelectorAll(
        '.start-button'
      ) as NodeListOf<HTMLButtonElement>;
      expect(startButtons.length).toBe(contents.length);
      expect(Array.from(startButtons).some((b) => b.disabled)).toBeFalse();
    });

    it('marks only the content of the running round as live', () => {
      const withRounds = contents.map((c, i) => ({
        ...c,
        activeRound: {
          id: `round-${i}`,
          roundNo: 1,
          closed: false,
          answerable: true,
        },
      })) as Content[];
      setUp(
        live({ id: 'round-1', closed: false, answerable: true }),
        undefined,
        withRounds
      );

      // Each row renders its info twice, for small and for large screens.
      expect(liveRows()).toEqual([
        'creator.content.live',
        'creator.content.live',
      ]);
    });

    it('marks no content as live once the round is closed', () => {
      const withRounds = contents.map((c, i) => ({
        ...c,
        activeRound: {
          id: `round-${i}`,
          roundNo: 1,
          closed: i === 1,
          answerable: i !== 1,
        },
      })) as Content[];
      setUp(
        live({ id: 'round-1', closed: true, answerable: false }),
        undefined,
        withRounds
      );

      expect(liveRows()).toEqual([]);
    });
  });

  describe('rounds', () => {
    const live = questionnaire({
      publishingMode: QuestionnairePublishingMode.Live,
    });
    const withRound = (closed: boolean) =>
      ({
        ...contents[0],
        activeRound: { id: 'round-1', roundNo: 1, closed, answerable: !closed },
      }) as Content;

    it('starts a new round once confirmed', () => {
      setUp();
      const started = jasmine.createSpy('startedContentChanged');
      component.startedContentChanged.subscribe(started);
      dialogService.openStartNewRoundDialog.and.returnValue({
        afterClosed: () => of(true),
      } as never);

      component.startNewRound('c-1');

      const confirmAction =
        dialogService.openStartNewRoundDialog.calls.mostRecent()
          .args[0] as () => Observable<unknown>;
      confirmAction().subscribe();
      expect(
        mutation(StartQuestionnaireContentRoundGql).calls.mostRecent().args[0]
          .variables
      ).toEqual({ contentId: 'c-1' });
      expect(started).toHaveBeenCalledWith('c-1');
      expect(notificationService.showAdvanced).toHaveBeenCalled();
    });

    it('starts no round when cancelled', () => {
      setUp();
      const started = jasmine.createSpy('startedContentChanged');
      component.startedContentChanged.subscribe(started);
      dialogService.openStartNewRoundDialog.and.returnValue({
        afterClosed: () => of(false),
      } as never);

      component.startNewRound('c-1');

      expect(started).not.toHaveBeenCalled();
    });

    it('reports a failed new round and leaves the dialog to stay open', () => {
      setUp();
      mutation(StartQuestionnaireContentRoundGql).and.returnValue(
        failedOperation()
      );
      dialogService.openStartNewRoundDialog.and.returnValue({
        afterClosed: () => of(undefined),
      } as never);

      component.startNewRound('c-1');

      const confirmAction =
        dialogService.openStartNewRoundDialog.calls.mostRecent()
          .args[0] as () => Observable<unknown>;
      const failed = jasmine.createSpy('failed');
      confirmAction().subscribe({ error: failed });
      expect(failed).toHaveBeenCalled();
      expect(notificationService.showAdvanced).toHaveBeenCalledOnceWith(
        jasmine.any(String),
        AdvancedSnackBarTypes.FAILED
      );
    });

    it('allows changing answers and rounds freely outside live mode', () => {
      setUp();

      expect(component.canModifyAnswersOrRounds(withRound(false))).toBeTrue();
    });

    it('allows changing answers and rounds in live mode only after a round', () => {
      setUp(live);

      expect(component.canModifyAnswersOrRounds(withRound(false))).toBeFalse();
      expect(component.canModifyAnswersOrRounds(withRound(true))).toBeTrue();
      expect(component.canModifyAnswersOrRounds(contents[0])).toBeFalse();
    });

    it('offers rounds only for formats whose results support them', () => {
      setUp();

      expect(component.supportsRounds(contents[0])).toBeTrue();
      expect(
        component.supportsRounds({
          ...contents[0],
          formatData: { format: ContentType.Slide },
        } as Content)
      ).toBeFalse();
    });
  });

  describe('countdown', () => {
    const now = new Date('2026-10-01T12:00:00Z');
    const inSeconds = (seconds: number) =>
      new Date(now.getTime() + seconds * 1000).toISOString();
    const round = (answeringEndTime?: string, answerable = true) => ({
      id: 'round-1',
      roundNo: 1,
      closed: false,
      answerable,
      answeringEndTime,
    });

    function setUpRunning(answeringEndTime?: string, answerable = true) {
      const activeRound = round(answeringEndTime, answerable);
      setUp(
        questionnaire({
          publishingMode: QuestionnairePublishingMode.Live,
          publishedUpToContent: { id: 'c-1', position: 1 } as Content,
          activeRound: activeRound as Questionnaire['activeRound'],
        }),
        undefined,
        contents.map((c) =>
          c.id === 'c-1' ? ({ ...c, activeRound } as Content) : c
        )
      );
    }

    function countdowns() {
      return fixture.nativeElement.querySelectorAll('app-countdown-timer');
    }

    beforeEach(() => {
      jasmine.clock().install();
      jasmine.clock().mockDate(now);
    });

    afterEach(() => jasmine.clock().uninstall());

    it('counts down a running round with a deadline', () => {
      setUpRunning(inSeconds(30));

      expect(countdowns().length).toBeGreaterThan(0);
    });

    it('marks a running round without a deadline as live', () => {
      setUpRunning();

      expect(countdowns().length).toBe(0);
      expect(fixture.nativeElement.textContent).toContain(
        'creator.content.live'
      );
    });

    it('takes the live mark away once the countdown has finished', () => {
      setUpRunning(inSeconds(30));
      const detectChanges = spyOn(
        component['changeDetectorRef'],
        'detectChanges'
      ).and.callThrough();

      // The countdown finishes slightly ahead of the deadline.
      component.onRoundCountdownFinished(round(inSeconds(30)));

      expect(component.activeRoundOver()).toBeTrue();
      expect(detectChanges).not.toHaveBeenCalled();
      fixture.detectChanges();
      expect(countdowns().length).toBe(0);
      expect(fixture.nativeElement.textContent).not.toContain(
        'creator.content.live'
      );
    });

    it('treats a round past its deadline as over', () => {
      setUpRunning(inSeconds(-1));

      expect(
        component.isLiveRow({
          ...contents[1],
          activeRound: round(inSeconds(-1)),
        } as Content)
      ).toBeFalse();
      expect(
        component.canModifyAnswersOrRounds({
          ...contents[1],
          activeRound: round(inSeconds(-1)),
        } as Content)
      ).toBeTrue();
    });

    it('judges the deadline by server time, not by a skewed local clock', () => {
      // The local clock runs a minute ahead of the server.
      const serverTime = ServerTimeService.prototype;
      spyOnProperty(serverTime, 'averageOffset').and.returnValue(-60_000);
      setUpRunning(inSeconds(-30));

      expect(
        component.isLiveRow({
          ...contents[1],
          activeRound: round(inSeconds(-30)),
        } as Content)
      ).toBeTrue();
    });

    it('treats a round the backend no longer accepts answers for as over', () => {
      setUpRunning(inSeconds(30), false);

      expect(countdowns().length).toBe(0);
    });
  });

  describe('text answers', () => {
    const text = (answersPublished: boolean) =>
      ({
        ...contents[0],
        formatData: {
          __typename: 'TextContentFormatData',
          format: ContentType.Text,
          answersPublished,
        },
      }) as Content;

    function toggled() {
      return mutation(ToggleQuestionnaireTextContentAnswersPublishedGql);
    }

    it('publishes the answers of a text content', () => {
      setUp();

      component.toggleTextAnswersPublished(text(false));

      expect(toggled().calls.mostRecent().args[0].variables).toEqual({
        contentId: 'c-0',
        published: true,
      });
    });

    it('withdraws published answers of a text content', () => {
      setUp();

      component.toggleTextAnswersPublished(text(true));

      expect(toggled().calls.mostRecent().args[0].variables).toEqual({
        contentId: 'c-0',
        published: false,
      });
    });

    it('reports a failed toggle', () => {
      setUp();
      toggled().and.returnValue(
        throwError(
          () =>
            new CombinedGraphQLErrors({
              errors: [
                {
                  message: 'failed',
                  extensions: { classification: 'BAD_REQUEST' },
                },
              ],
            })
        )
      );

      component.toggleTextAnswersPublished(text(false));

      expect(notificationService.showOnRequestClientError).toHaveBeenCalled();
    });

    it('ignores contents of other formats', () => {
      setUp();

      component.toggleTextAnswersPublished(contents[0]);

      expect(toggled()).not.toHaveBeenCalled();
    });
  });

  describe('banned answers', () => {
    function listedWith(format: ContentType) {
      return [{ ...contents[0], formatData: { format } } as Content];
    }

    async function menuItemTexts(): Promise<string[]> {
      const menu = await TestbedHarnessEnvironment.loader(fixture).getHarness(
        MatMenuHarness.with({ selector: '[data-testid="open-more-options-0"]' })
      );
      await menu.open();
      return Promise.all((await menu.getItems()).map((item) => item.getText()));
    }

    it('resets the banned keywords of a wordcloud', () => {
      setUp(questionnaire(), undefined, listedWith(ContentType.Wordcloud));

      component.resetBannedAnswers('c-0', ContentType.Wordcloud);

      expect(
        mutation(ResetBannedQuestionnaireWordcloudContentKeywordsGql)
      ).toHaveBeenCalledWith({ variables: { contentId: 'c-0' } });
      expect(
        mutation(ResetBannedQuestionnaireShortAnswerContentKeywordsGql)
      ).not.toHaveBeenCalled();
      expect(notificationService.showAdvanced).toHaveBeenCalled();
    });

    it('resets the banned answers of a short answer', () => {
      setUp(questionnaire(), undefined, listedWith(ContentType.ShortAnswer));

      component.resetBannedAnswers('c-0', ContentType.ShortAnswer);

      expect(
        mutation(ResetBannedQuestionnaireShortAnswerContentKeywordsGql)
      ).toHaveBeenCalledWith({ variables: { contentId: 'c-0' } });
      expect(
        mutation(ResetBannedQuestionnaireWordcloudContentKeywordsGql)
      ).not.toHaveBeenCalled();
      expect(notificationService.showAdvanced).toHaveBeenCalled();
    });

    for (const [format, offered] of [
      [ContentType.ShortAnswer, true],
      [ContentType.Wordcloud, true],
      [ContentType.Text, false],
      [ContentType.Choice, false],
    ] as const) {
      it(`${offered ? 'offers' : 'does not offer'} the reset for ${format}`, async () => {
        setUp(questionnaire(), undefined, listedWith(format));

        const texts = await menuItemTexts();

        expect(
          texts.some((text) =>
            text.includes('creator.content.reset-banned-answers')
          )
        ).toBe(offered);
      });
    }
  });
});
