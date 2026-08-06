import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { BaseDialogComponent } from '@app/standalone/_dialogs/base-dialog/base-dialog.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import { ContentService } from '@app/core/services/http/content.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { ContentResultsService } from '@app/standalone/content-results/content-results.service';
import {
  Content,
  ContentType,
  DeleteQuestionnaireAnswersByContentIdGql,
  QuestionnaireByIdGql,
  QuestionnairePublishingMode,
  QuestionnaireRoundsByContentIdDocument,
  QuestionnaireRoundsByContentIdGql,
  StartQuestionnaireContentRoundGql,
} from '@gql/generated/graphql';
import { ContentPresentationMenuComponent } from './content-presentation-menu.component';

function content(
  activeRoundClosed: boolean,
  format = ContentType.Choice
): Content {
  return {
    __typename: 'Content',
    id: 'content-1',
    body: 'Body',
    bodyRendered: null,
    formatData: {
      __typename: 'ChoiceContentFormatData',
      format,
      options: [],
      correctOptionIndexes: null,
      multiple: false,
    },
    duration: null,
    abstentionsAllowed: false,
    hasCorrectAnswer: false,
    weight: null,
    answerCount: 0,
    hasAnswers: false,
    abstentionCount: 0,
    correctAnswerCount: null,
    position: 0,
    activeRound: {
      __typename: 'Round',
      id: 'round-1',
      contentId: 'content-1',
      roundNo: 1,
      closed: activeRoundClosed,
      started: true,
      answerable: !activeRoundClosed,
    },
  } as Content;
}

function roundsResponse(
  roundNo: number,
  closed: boolean,
  answeringEndTime?: string
) {
  return {
    dataState: 'complete' as const,
    data: {
      questionnaireRoundsByContentId: [
        {
          __typename: 'Round',
          id: `round-${roundNo}`,
          contentId: 'content-1',
          roundNo,
          closed,
          answerable: !closed,
          answeringEndTime: answeringEndTime ?? null,
        },
      ],
    },
  };
}

describe('ContentPresentationMenuComponent', () => {
  let fixture: ComponentFixture<ContentPresentationMenuComponent>;
  let component: ContentPresentationMenuComponent;
  let rounds$: BehaviorSubject<ReturnType<typeof roundsResponse>>;
  let dialogService: jasmine.SpyObj<DialogService>;
  let startRound: jasmine.SpyObj<StartQuestionnaireContentRoundGql>;
  let dialogResult$: Subject<string | undefined>;

  function setUp(initialContent: Content) {
    rounds$ = new BehaviorSubject(roundsResponse(1, false));

    const questionnaireRoundsByContentId = jasmine.createSpyObj(
      'QuestionnaireRoundsByContentIdGql',
      ['watch']
    );
    questionnaireRoundsByContentId.watch.and.returnValue({
      valueChanges: rounds$,
    });

    const questionnaireById = jasmine.createSpyObj('QuestionnaireByIdGql', [
      'watch',
    ]);
    questionnaireById.watch.and.returnValue({
      valueChanges: of({
        data: {
          questionnaireById: {
            publishingMode: QuestionnairePublishingMode.Live,
          },
        },
      }),
    });

    const presentationService = jasmine.createSpyObj('PresentationService', [
      'getWordcloudVisualizationChanged',
    ]);
    presentationService.getWordcloudVisualizationChanged.and.returnValue(
      of(false)
    );

    dialogResult$ = new Subject();
    dialogService = jasmine.createSpyObj('DialogService', [
      'openDeleteDialog',
      'openStartNewRoundDialog',
    ]);
    dialogService.openStartNewRoundDialog.and.returnValue({
      afterClosed: () => dialogResult$,
    } as unknown as MatDialogRef<BaseDialogComponent>);
    startRound = jasmine.createSpyObj('StartQuestionnaireContentRoundGql', [
      'mutate',
    ]);
    startRound.mutate.and.returnValue(of({ data: undefined }) as never);

    configureTestModule(
      [getTranslocoModule(), ContentPresentationMenuComponent],
      [
        {
          provide: QuestionnaireRoundsByContentIdGql,
          useValue: questionnaireRoundsByContentId,
        },
        { provide: QuestionnaireByIdGql, useValue: questionnaireById },
        { provide: PresentationService, useValue: presentationService },
        {
          provide: ContentService,
          useValue: jasmine.createSpyObj('ContentService', ['goToEdit']),
        },
        { provide: DialogService, useValue: dialogService },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', [
            'showAdvanced',
            'showOnRequestClientError',
          ]),
        },
        {
          provide: DeleteQuestionnaireAnswersByContentIdGql,
          useValue: jasmine.createSpyObj(
            'DeleteQuestionnaireAnswersByContentIdGql',
            ['mutate']
          ),
        },
        { provide: StartQuestionnaireContentRoundGql, useValue: startRound },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(ContentPresentationMenuComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('content', initialContent);
    fixture.componentRef.setInput('questionnaireId', 'questionnaire-1');
    fixture.componentRef.setInput('shortId', 'short-1');
    fixture.detectChanges();
  }

  it('reflects a round closing even though the stale content input still says it is open', () => {
    setUp(content(false));
    expect(component.canModifyAnswersOrRounds()).toBe(false);

    rounds$.next(roundsResponse(1, true));
    fixture.detectChanges();

    expect(component.canModifyAnswersOrRounds()).toBe(true);
  });

  it('reflects a newly started round even though the stale content input still says the old one is closed', () => {
    setUp(content(true));
    rounds$.next(roundsResponse(1, true));
    fixture.detectChanges();
    expect(component.canModifyAnswersOrRounds()).toBe(true);

    rounds$.next(roundsResponse(2, false));
    fixture.detectChanges();

    expect(component.canModifyAnswersOrRounds()).toBe(false);
  });

  it('treats a round whose deadline expired without being explicitly stopped as over', () => {
    setUp(content(false));
    rounds$.next(
      roundsResponse(1, false, new Date(Date.now() - 1000).toISOString())
    );
    fixture.detectChanges();

    expect(component.canModifyAnswersOrRounds()).toBe(true);
  });

  it('falls back to the new round once the answers are deleted', () => {
    setUp(content(true));
    const deleteAnswers = TestBed.inject(
      DeleteQuestionnaireAnswersByContentIdGql
    ) as jasmine.SpyObj<DeleteQuestionnaireAnswersByContentIdGql>;
    deleteAnswers.mutate.and.returnValue(of({ data: {} }) as never);
    const contentResultsService = TestBed.inject(ContentResultsService);
    contentResultsService.setPresentationSelectedRoundIds('content-1', [
      'round-1',
      'round-2',
    ]);

    component.deleteContentAnswers();
    (
      dialogService.openDeleteDialog.calls.mostRecent()
        .args[4] as () => Observable<unknown>
    )().subscribe();
    const { refetchQueries, update } =
      deleteAnswers.mutate.calls.mostRecent().args[0]!;
    (update as unknown as () => void)();

    expect(refetchQueries).toContain({
      query: QuestionnaireRoundsByContentIdDocument,
      variables: { contentId: 'content-1' },
    });
    expect(
      contentResultsService.presentationSelectedRoundIds('content-1')
    ).toBeUndefined();
  });

  it('starts a new round only once the dialog has been confirmed', () => {
    setUp(content(true));

    component.startNewRound();

    expect(startRound.mutate).not.toHaveBeenCalled();
    const confirmAction =
      dialogService.openStartNewRoundDialog.calls.mostRecent().args[0];
    confirmAction().subscribe();
    expect(startRound.mutate).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({ variables: { contentId: 'content-1' } })
    );
  });

  it('shows the new round instead of a previously selected one', () => {
    setUp(content(true));
    const contentResultsService = TestBed.inject(ContentResultsService);
    contentResultsService.setPresentationSelectedRoundIds('content-1', [
      'round-1',
    ]);

    component.startNewRound();
    const confirmAction =
      dialogService.openStartNewRoundDialog.calls.mostRecent().args[0];
    confirmAction().subscribe();
    const { update } = startRound.mutate.calls.mostRecent().args[0]!;
    (update as unknown as () => void)();

    expect(
      contentResultsService.presentationSelectedRoundIds('content-1')
    ).toBeUndefined();
  });

  it('confirms the new round only after the dialog closed with a result', () => {
    setUp(content(true));
    const notificationService = TestBed.inject(
      NotificationService
    ) as jasmine.SpyObj<NotificationService>;

    component.startNewRound();
    dialogResult$.next(undefined);
    expect(notificationService.showAdvanced).not.toHaveBeenCalled();

    component.startNewRound();
    dialogResult$.next('creator.dialog.start');
    expect(notificationService.showAdvanced).toHaveBeenCalled();
  });

  [
    { format: ContentType.Choice, allowed: true },
    { format: ContentType.Wordcloud, allowed: true },
    { format: ContentType.Sort, allowed: false },
  ].forEach(({ format, allowed }) => {
    it(`${allowed ? 'offers' : 'hides'} a new round for ${format}`, () => {
      setUp(content(true, format));

      expect(component.allowNewRound()).toBe(allowed);
    });
  });
});
