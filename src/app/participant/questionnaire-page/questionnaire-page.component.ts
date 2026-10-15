import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  untracked,
  viewChild,
} from '@angular/core';
import {
  provideTranslocoScope,
  TranslocoService,
  TranslocoPipe,
} from '@jsverse/transloco';
import { StepperComponent } from '@app/standalone/stepper/stepper.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { Location } from '@angular/common';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import {
  catchError,
  distinctUntilChanged,
  EMPTY,
  filter,
  ignoreElements,
  map,
  merge,
  shareReplay,
  switchMap,
  take,
} from 'rxjs';
import { ContentCarouselService } from '@app/core/services/util/content-carousel.service';
import { FocusModeService } from '@app/participant/_services/focus-mode.service';
import { ContentLicenseAttribution } from '@app/core/models/content-license-attribution';
import { LICENSES } from '@app/core/models/licenses';
import { RoomUserAlias } from '@app/core/models/room-user-alias';
import { SeriesOverviewComponent } from '@app/participant/series-overview/series-overview.component';
import { ContentParticipantComponent } from '@app/participant/content/content-participant/content-participant.component';
import { CdkStep } from '@angular/cdk/stepper';
import { FlexModule } from '@angular/flex-layout';
import { CoreModule } from '@app/core/core.module';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { BaseCardComponent } from '@app/standalone/base-card/base-card.component';
import { ContentWaitingComponent } from '@app/standalone/content-waiting/content-waiting.component';
import {
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import {
  ContentAnswerResult,
  AnswerResultState,
  Content,
  Questionnaire,
  QuestionnaireByIdGql,
  QuestionnaireContentAnswerResultsByQuestionnaireIdGql,
  QuestionnaireContentUpdatedGql,
  QuestionnairePublishedContentsByQuestionnaireIdGql,
  QuestionnairePublishingMode,
  QuestionnaireUpdatedGql,
  UserUiSettings,
  QuestionnaireType,
  ContentType,
} from '@gql/generated/graphql';
import { NotificationService } from '@app/core/services/util/notification.service';
import { onlyCompleteData } from 'apollo-angular';

function setDefaultTrue(value: boolean | undefined): boolean {
  return value ?? true;
}

function publishedContentsKey(questionnaire: Questionnaire): string {
  return [
    questionnaire.published,
    questionnaire.publishingMode,
    questionnaire.publishedUpToContent?.id,
    questionnaire.contentCount,
    questionnaire.activeRound?.id,
    questionnaire.activeRound?.closed,
    // Solutions are withheld from participants until they are published.
    questionnaire.correctOptionsPublished,
  ].join('|');
}

@Component({
  selector: 'app-questionnaire-page',
  templateUrl: './questionnaire-page.component.html',
  imports: [
    LoadingIndicatorComponent,
    CoreModule,
    FlexModule,
    StepperComponent,
    CdkStep,
    ContentParticipantComponent,
    SeriesOverviewComponent,
    TranslocoPipe,
    BaseCardComponent,
    ContentWaitingComponent,
  ],
  providers: [provideTranslocoScope('participant')],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class QuestionnairePageComponent {
  private readonly translateService = inject(TranslocoService);
  private readonly route = inject(ActivatedRoute);
  private readonly announceService = inject(AnnounceService);
  private readonly location = inject(Location);
  private readonly authenticationService = inject(AuthenticationService);
  private readonly router = inject(Router);
  private readonly contentCarouselService = inject(ContentCarouselService);
  private readonly focusModeService = inject(FocusModeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly contentsByQuestionnareId = inject(
    QuestionnairePublishedContentsByQuestionnaireIdGql
  );
  private readonly answerResultsByQuestionnaireId = inject(
    QuestionnaireContentAnswerResultsByQuestionnaireIdGql
  );
  private readonly questionnaireUpdated = inject(QuestionnaireUpdatedGql);
  private readonly questionnaireById = inject(QuestionnaireByIdGql);
  private readonly questionnaireContentUpdated = inject(
    QuestionnaireContentUpdatedGql
  );
  private readonly notificationService = inject(NotificationService);

  stepper = viewChild(StepperComponent);

  // Route data input below
  questionnaireId = input.required<string>();
  shortId = input.required<string>();
  roomId = input.required<string>();
  settings = input.required<UserUiSettings>();
  activeTab = input<string>();
  showCard = input(true, { transform: setDefaultTrue });
  showStepper = input(true, { transform: setDefaultTrue });
  language = input.required<string>();
  contentId = input<string>();
  // Set by the dedicated overview route to suppress the entry jump to the
  // content a live series is currently at.
  overview = input(false);

  readonly questionnaire = toSignal(
    toObservable(this.questionnaireId).pipe(
      switchMap((id) => {
        const questionnaire$ = this.questionnaireById
          .watch({ variables: { id } })
          .valueChanges.pipe(
            map((r) => r.data?.questionnaireById),
            filter((q): q is Questionnaire => !!q),
            shareReplay({ bufferSize: 1, refCount: true })
          );
        // Participants may only read a published questionnaire.
        const updates$ = questionnaire$.pipe(
          map((q) => q.published),
          distinctUntilChanged(),
          switchMap((published) =>
            published ? this.questionnaireUpdates(id) : EMPTY
          )
        );
        return merge(updates$, questionnaire$);
      })
    )
  );

  private readonly contentsResult = toSignal(
    toObservable(this.questionnaire).pipe(
      filter((q): q is Questionnaire => !!q),
      distinctUntilChanged(
        (a, b) => publishedContentsKey(a) === publishedContentsKey(b)
      ),
      switchMap((questionnaire) => {
        return this.contentsByQuestionnareId
          .watch({
            variables: { questionnaireId: questionnaire.id },
            fetchPolicy: 'network-only',
          })
          .valueChanges.pipe(onlyCompleteData());
      })
    )
  );

  // Feeds the answer counts into the normalized contents; only readable while
  // the questionnaire is published.
  private readonly contentUpdates = toSignal(
    toObservable(this.questionnaire).pipe(
      filter((q): q is Questionnaire => !!q),
      map((q) => (q.published ? q.id : undefined)),
      distinctUntilChanged(),
      switchMap((questionnaireId) =>
        questionnaireId
          ? this.questionnaireContentUpdated
              .subscribe({ variables: { questionnaireId } })
              .pipe(
                ignoreElements(),
                catchError(() => EMPTY)
              )
          : EMPTY
      )
    )
  );

  private readonly answerResultsResult = toSignal(
    toObservable(this.questionnaire).pipe(
      filter((q): q is Questionnaire => !!q),
      distinctUntilChanged(
        (a, b) => publishedContentsKey(a) === publishedContentsKey(b)
      ),
      switchMap((questionnaire) => {
        return this.answerResultsByQuestionnaireId
          .watch({
            variables: { questionnaireId: questionnaire.id },
            fetchPolicy: 'network-only',
          })
          .valueChanges.pipe(onlyCompleteData());
      })
    )
  );

  readonly answerResults = computed(() => {
    const results =
      this.answerResultsResult()?.data
        ?.questionnaireContentAnswerResultsByQuestionnaireId ?? [];
    return results.filter((r): r is ContentAnswerResult => !!r);
  });

  readonly loadingAnswerResults = computed(() => !this.answerResultsResult());

  readonly contents = computed(() => {
    const edges =
      this.contentsResult()?.data
        ?.questionnairePublishedContentsByQuestionnaireId?.edges;
    return edges?.map((e) => e?.node).filter((n): n is Content => !!n) ?? [];
  });

  readonly loadingContents = computed(() => !this.contentsResult());

  readonly contentIndexes = computed(() =>
    Array.from(Array(this.questionnaire()?.contentCount ?? 0).keys())
  );

  private readonly questionnaireInLiveMode = computed(() => {
    const questionnaire = this.questionnaire();
    return questionnaire?.publishingMode === QuestionnairePublishingMode.Live
      ? questionnaire
      : undefined;
  });

  private readonly activeUnansweredRound = computed(() => {
    const round = this.questionnaireInLiveMode()?.activeRound;
    if (!round?.contentId || round.closed) {
      return undefined;
    }
    const result = this.answerResults().find(
      (r) => r.contentId === round.contentId
    );
    return result?.result === AnswerResultState.Unanswered ? round : undefined;
  });

  private readonly activeUnansweredContentId = computed(
    () => this.activeUnansweredRound()?.contentId ?? undefined
  );

  private readonly liveContentId = computed(
    () =>
      this.activeUnansweredContentId() ??
      this.questionnaireInLiveMode()?.publishedUpToContent?.id
  );

  readonly userId = toSignal(
    this.authenticationService.getCurrentAuthentication().pipe(
      takeUntilDestroyed(this.destroyRef),
      map((a) => a.userId)
    )
  );

  ContentType: typeof ContentType = ContentType;
  QuestionnairePublishingMode = QuestionnairePublishingMode;

  started = false;
  currentStep?: number;
  private followedLiveContentId?: string;
  private followedLiveRoundId?: string;
  focusModeEnabled = toSignal(this.focusModeService.getFocusModeEnabled());
  private readonly contentFocusState = toSignal(
    this.focusModeService.getContentState()
  );
  currentIndex = linkedSignal(() =>
    this.contents().findIndex((c) => c.id === this.contentId())
  );

  isFinished = computed(
    () =>
      !!this.answerResults() &&
      !this.answerResults()
        .map((r) => r.result)
        .includes(AnswerResultState.Unanswered)
  );
  isPureInfoSeries = computed(() =>
    this.contents().every((c) => this.isInfoContent(c))
  );
  hasAnsweredLastContent = false;

  attributions: ContentLicenseAttribution[] = [];
  alias?: RoomUserAlias;

  private questionnaireUpdates(questionnaireId: string) {
    return this.questionnaireUpdated
      .subscribe({ variables: { questionnaireId } })
      .pipe(
        ignoreElements(),
        catchError((error) => {
          console.error('Questionnaire subscription failed', error);
          return EMPTY;
        })
      );
  }

  constructor() {
    let prevAnswerResults: ContentAnswerResult[] = [];
    effect(() => {
      if (
        this.contentIndexes().length > 0 &&
        this.answerResults().length > 0 &&
        !this.started
      ) {
        this.checkIfLastContentExists(this.route.snapshot.params.contentId);
        if (this.stepper()) {
          this.initStepper(this.currentIndex());
        }
      }

      const currentResults = this.answerResults();
      this.evaluateAnswerResultsState(prevAnswerResults, currentResults);
      prevAnswerResults = currentResults;
    });

    let prevQuestionnaireId: string | undefined;
    effect(() => {
      // The component is reused when the route switches to another questionnaire.
      const questionnaireId = this.questionnaireId();
      if (prevQuestionnaireId && questionnaireId !== prevQuestionnaireId) {
        this.started = false;
      }
      prevQuestionnaireId = questionnaireId;
    });

    effect(() => {
      const state = this.contentFocusState();
      const contents = this.contents();
      if (
        !this.focusModeEnabled() ||
        !state ||
        state.contentGroupId !== this.questionnaireId() ||
        contents.length === 0
      ) {
        return;
      }
      untracked(() => this.followFocusedContent(state.contentId));
    });

    effect(() => {
      const liveContentId = this.liveContentId();
      const liveRoundId = this.activeUnansweredRound()?.id;
      if (!this.started || !this.stepper() || this.focusModeEnabled()) {
        return;
      }
      if (liveContentId) {
        this.followLiveContent(liveContentId, liveRoundId);
      }
    });

    let prevPublishedUpToContentId: string | undefined;
    effect(() => {
      const questionnaire = this.questionnaire();
      const publishedUpToContentId = questionnaire?.publishedUpToContent?.id;
      if (
        this.started &&
        !this.focusModeEnabled() &&
        questionnaire?.publishingMode === QuestionnairePublishingMode.UpTo &&
        prevPublishedUpToContentId !== undefined &&
        publishedUpToContentId !== undefined &&
        publishedUpToContentId !== prevPublishedUpToContentId
      ) {
        this.offerReleasedContent(publishedUpToContentId);
      }
      prevPublishedUpToContentId = publishedUpToContentId;
    });
  }

  private followFocusedContent(contentId: string) {
    const index = this.getIndexOfContentById(contentId);
    if (index < 0) {
      return;
    }
    if (!this.started) {
      this.initStepper(index);
    } else if (index !== this.currentStep) {
      this.goToContent(index);
    }
  }

  /**
   * Follows each new live content and each (re)opened round once, so a
   * participant who navigated away is not pulled back by every update.
   */
  private followLiveContent(contentId: string, roundId?: string) {
    const isNewTarget =
      contentId !== this.followedLiveContentId ||
      (!!roundId && roundId !== this.followedLiveRoundId);
    // Forgetting a closed round lets reopening it count as a new start.
    this.followedLiveRoundId = roundId;
    const index = this.getIndexOfContentById(contentId);
    if (!isNewTarget || index < 0) {
      return;
    }
    this.followedLiveContentId = contentId;
    if (index !== this.currentStep) {
      this.goToContent(index);
    }
  }

  private offerReleasedContent(releasedContentId: string) {
    this.notificationService
      .show(
        this.translateService.translate('participant.answer.state-changed'),
        this.translateService.translate('participant.answer.load')
      )
      .onAction()
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const index = this.getIndexOfContentById(releasedContentId);
        if (index >= 0) {
          this.goToContent(index);
        }
      });
  }

  evaluateAnswerResultsState(
    prevResults: ContentAnswerResult[],
    currentResults: ContentAnswerResult[]
  ) {
    const answeredIndex = this.findNewlyAnsweredContentIndex(
      prevResults,
      currentResults
    );
    if (
      answeredIndex >= 0 &&
      !this.focusModeEnabled() &&
      this.started &&
      this.questionnaire()?.publishingMode !==
        QuestionnairePublishingMode.Live &&
      this.questionnaire()?.type !== QuestionnaireType.Quiz
    ) {
      setTimeout(() => {
        const nextIndex = this.findNextUnansweredContentIndex(
          currentResults,
          answeredIndex
        );
        if (nextIndex >= 0) {
          this.goToContent(nextIndex);
          setTimeout(() => {
            document.getElementById('step')?.focus();
          }, 200);
        } else {
          this.goToOverview();
        }
      }, 1000);
    }
  }

  private findNewlyAnsweredContentIndex(
    prevResults: ContentAnswerResult[],
    currentResults: ContentAnswerResult[]
  ): number {
    const wasUnanswered = new Set(
      prevResults
        .filter((r) => r.result === AnswerResultState.Unanswered)
        .map((r) => r.contentId)
    );
    const answered = currentResults.find(
      (r) =>
        r.result !== AnswerResultState.Unanswered &&
        wasUnanswered.has(r.contentId)
    );
    return answered ? this.getIndexOfContentById(answered.contentId) : -1;
  }

  private findNextUnansweredContentIndex(
    results: ContentAnswerResult[],
    after: number
  ): number {
    const unanswered = new Set(
      results
        .filter((r) => r.result === AnswerResultState.Unanswered)
        .map((r) => r.contentId)
    );
    return this.contents().findIndex(
      (c, i) => i > after && unanswered.has(c.id)
    );
  }

  getIndexOfContentById(id: string): number {
    return this.contents()
      .map((c) => c.id)
      .indexOf(id);
  }

  announce(key: string) {
    this.announceService.announce(key);
  }

  checkIfLastContentExists(contentId?: string) {
    if (this.overview()) {
      this.started = true;
      return;
    }
    if (this.enterAtActiveLiveContent()) {
      return;
    }
    const index = this.contents().findIndex((c) => c.id === contentId);
    if (index >= 0) {
      this.initStepper(index);
      return;
    }
    if (this.focusModeEnabled()) {
      return;
    }
    const liveContentId = this.liveContentId();
    const liveIndex = liveContentId
      ? this.getIndexOfContentById(liveContentId)
      : -1;
    if (liveIndex >= 0) {
      this.initStepper(liveIndex);
      this.router.navigate(this.contentUrl(liveContentId), {
        replaceUrl: true,
      });
      return;
    }
    this.getInitialStep();
  }

  initStepper(index: number) {
    setTimeout(() => {
      this.currentStep = index;
      if (this.stepper()) this.stepper()?.init(index, this.contents()?.length);
      this.followedLiveContentId = this.liveContentId();
      this.followedLiveRoundId = this.activeUnansweredRound()?.id;
      this.started = true;
    });
  }

  goToContent(index: number) {
    this.stepper()?.setHeaderPosition(index);
    this.stepper()?.onClick(index);
    this.updateContentIndexUrl(index);
  }

  updateContentIndexUrl(index: number = 0) {
    if (this.currentStep !== index) {
      this.currentStep = index || 0;
      const content = this.contents().find((c) => c.position === index);
      this.replaceUrl(this.contentUrl(content?.id));
    }
  }

  private questionnaireUrl(...segments: string[]): string[] {
    return [
      'p',
      this.shortId(),
      'questionnaire',
      this.questionnaireId(),
      ...segments,
    ];
  }

  private contentUrl(contentId?: string): string[] {
    return this.questionnaireUrl(...(contentId ? [contentId] : []));
  }

  private enterAtActiveLiveContent(): boolean {
    const activeContentId = this.activeUnansweredContentId();
    if (!activeContentId || this.focusModeEnabled()) {
      return false;
    }
    const activeIndex = this.getIndexOfContentById(activeContentId);
    if (activeIndex < 0) {
      return false;
    }
    this.initStepper(activeIndex);
    this.router.navigate(this.contentUrl(activeContentId), {
      replaceUrl: true,
    });
    return true;
  }

  private getInitialStep() {
    const firstIndex = this.getFirstUnansweredContentIndex();
    if (
      firstIndex === 0 ||
      (firstIndex &&
        !this.isPureInfoSeries() &&
        !this.contentCarouselService.isLastContentAnswered())
    ) {
      this.initStepper(firstIndex || 0);
      this.router.navigate(
        this.contentUrl(
          this.contents().find((c) => c.position === firstIndex)?.id
        ),
        { replaceUrl: true }
      );
    }
  }

  private isInfoContent(content: Content): boolean {
    return [ContentType.Slide, ContentType.Flashcard].includes(
      content.formatData.format
    );
  }

  private getFirstUnansweredContentIndex(): number | undefined {
    for (let i = 0; i < this.contents().length; i++) {
      const content = this.contents()[i];
      if (
        this.answerResults()[i].result === AnswerResultState.Unanswered &&
        !this.isInfoContent(content)
      ) {
        return i;
      }
    }
    return;
  }

  nextContent() {
    if (
      this.currentStep !== undefined &&
      this.currentStep < this.contents().length - 1 &&
      !this.isFinished()
    ) {
      this.stepper()?.next();
    } else {
      this.goToOverview();
    }
  }

  goToOverview() {
    this.router.navigate(this.questionnaireUrl('overview'), {
      replaceUrl: true,
    });
  }

  replaceUrl(url: any[]) {
    const urlTree = this.router.createUrlTree(url);
    this.location.replaceState(this.router.serializeUrl(urlTree));
  }

  getAttribution(): string | undefined {
    if (!this.attributions) {
      return;
    }
    const attribution = this.attributions.find(
      (a) =>
        this.currentStep !== undefined &&
        a.contentId === this.contents()[this.currentStep].id
    );
    if (!attribution || attribution.license === 'CC0-1.0') {
      return;
    }
    return this.translateService.translate(
      'participant.content.attribution-info',
      {
        attribution:
          attribution.attribution ||
          this.translateService.translate('general.anonymous'),
        license: LICENSES.get(attribution.license)?.name,
      }
    );
  }
}
