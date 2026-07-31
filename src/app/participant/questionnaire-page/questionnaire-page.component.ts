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

    // Live mode auto-follows the content the moderator just started, the
    // same way the moderator's own client jumps ahead after starting it.
    effect(() => {
      const questionnaire = this.questionnaire();
      if (
        !questionnaire ||
        !this.started ||
        !this.stepper() ||
        this.focusModeEnabled()
      ) {
        return;
      }
      const activeContentId = questionnaire.activeRound?.contentId;
      if (
        questionnaire.publishingMode !== QuestionnairePublishingMode.Live ||
        !activeContentId
      ) {
        return;
      }
      const index = this.getIndexOfContentById(activeContentId);
      if (index >= 0 && index !== this.currentStep) {
        this.goToContent(index);
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
    // Since `null >= 0` is `true` trough a type coercion with `ToPrimitive() this muste be checked seperately
    const index = this.contents().findIndex((c) => c.id === contentId);
    if (index !== undefined && (index == 0 || index > 0)) {
      this.initStepper(index);
    } else {
      if (!this.focusModeEnabled()) {
        this.getInitialStep();
      }
    }
  }

  initStepper(index: number) {
    setTimeout(() => {
      this.currentStep = index;
      if (this.stepper()) this.stepper()?.init(index, this.contents()?.length);
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
      this.replaceUrl([
        'p',
        this.shortId(),
        'questionnaire',
        this.questionnaireId(),
        content?.id,
      ]);
    }
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
        ['.', this.contents().find((c) => c.position === firstIndex)?.id],
        { relativeTo: this.route, replaceUrl: true }
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
    this.router.navigate(['..'], { relativeTo: this.route, replaceUrl: true });
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
