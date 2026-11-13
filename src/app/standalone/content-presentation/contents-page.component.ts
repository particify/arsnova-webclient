import {
  booleanAttribute,
  Component,
  inject,
  input,
  linkedSignal,
  ChangeDetectionStrategy,
  computed,
  effect,
  signal,
  untracked,
  viewChild,
  DestroyRef,
} from '@angular/core';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { Location } from '@angular/common';
import {
  catchError,
  EMPTY,
  filter,
  fromEvent,
  ignoreElements,
  map,
  switchMap,
  take,
} from 'rxjs';
import {
  CARD_WIDTH,
  PresentationService,
} from '@app/core/services/util/presentation.service';
import {
  ContentType,
  PublishQuestionnaireUpToContentGql,
  QuestionnaireDetailsFragment,
  QuestionnaireByIdGql,
  QuestionnaireContentUpdatedGql,
  QuestionnairePublishingMode,
  StartQuestionnaireContentGql,
  StopQuestionnaireContentGql,
  TemplateContentAttributionsByQuestionnaireIdGql,
  UserUiSettings,
} from '@gql/generated/graphql';
import { ContentPresentationState } from '@app/core/models/events/content-presentation-state';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { EventService } from '@app/core/services/util/event.service';
import {
  HotkeyActionButtonComponent,
  hotkeyEnterLeaveAnimation,
} from '@app/standalone/hotkey-action-button/hotkey-action-button.component';
import { TranslocoService } from '@jsverse/transloco';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { CoreModule } from '@app/core/core.module';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { AnswerCountComponent } from '@app/standalone/answer-count/answer-count.component';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { CountdownTimerComponent } from '@app/standalone/countdown-timer/countdown-timer.component';
import { ContentStepperComponent } from '@app/standalone/content-stepper/content-stepper.component';
import { ContentGroupLeaderboardComponent } from '@app/standalone/content-group-leaderboard/content-group-leaderboard.component';
import { PulsatingCircleComponent } from '@app/standalone/pulsating-circle/pulsating-circle.component';
import { CountComponent } from '@app/standalone/count/count.component';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { ServerTimeService } from '@app/core/services/util/server-time.service';
import { ContentPresentationService } from '@app/presentation/content-presentation.service';
import {
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import { mutationHelper } from '@gql/helper/mutation-helper';
import { onlyCompleteData } from 'apollo-angular';
import { isLicensedAttribution } from '@app/standalone/attributions-info/attributions-info.component';
import {
  answeringEndDate,
  isRoundOver,
  roundKey,
} from '@app/standalone/countdown-timer/answering';

/** A step's position follows from its index and the step count. */
function stepKey(state?: ContentPresentationState): string | undefined {
  return state && [state.index, state.stepCount, state.content?.id].join('|');
}

@Component({
  selector: 'app-contents-page',
  imports: [
    CoreModule,
    LoadingIndicatorComponent,
    AnswerCountComponent,
    CdkStepperModule,
    HotkeyActionButtonComponent,
    CountdownTimerComponent,
    ContentStepperComponent,
    ContentGroupLeaderboardComponent,
    PulsatingCircleComponent,
    CountComponent,
  ],
  templateUrl: './contents-page.component.html',
  styleUrls: ['./contents-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  animations: [hotkeyEnterLeaveAnimation],
})
export class ContentsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly globalStorageService = inject(GlobalStorageService);
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly serverTimeService = inject(ServerTimeService);
  private readonly presentationService = inject(PresentationService);
  private readonly focusModeService = inject(FocusModeService);
  private readonly contentPublishService = inject(ContentPublishService);
  private readonly eventService = inject(EventService);
  private readonly translateService = inject(TranslocoService);
  private readonly hotkeyService = inject(HotkeyService);
  private readonly dialogService = inject(DialogService);
  private readonly notificationService = inject(NotificationService);
  private readonly mutations = mutationHelper();
  private readonly contentPresentationService = inject(
    ContentPresentationService
  );
  private readonly destroyRef = inject(DestroyRef);
  private readonly startQuestionnaireContent = inject(
    StartQuestionnaireContentGql
  );
  private readonly stopQuestionnaireContent = inject(
    StopQuestionnaireContentGql
  );
  private readonly questionnaireById = inject(QuestionnaireByIdGql);
  private readonly publishQuestionnaireContentUpTo = inject(
    PublishQuestionnaireUpToContentGql
  );
  private readonly attributionsByQuestionnaireId = inject(
    TemplateContentAttributionsByQuestionnaireIdGql
  );

  // Route data input below
  readonly showStepInfo = input(false, { transform: booleanAttribute });
  readonly showAnswerCount = input(false, { transform: booleanAttribute });
  readonly showHotkeyActionButtons = input(false, {
    transform: booleanAttribute,
  });
  readonly showResults = input(false, { transform: booleanAttribute });
  readonly noControlBar = input(false, { transform: booleanAttribute });
  readonly questionnaireId = input.required<string>();
  readonly contentId = input<string>();
  readonly settings = input.required<UserUiSettings>();
  readonly language = input.required<string>();

  private readonly questionnaireContentUpdated = inject(
    QuestionnaireContentUpdatedGql
  );

  /**
   * Feeds incoming answer counts into the cache, which the presented contents
   * and so the answer counter are watched from.
   */
  private readonly contentUpdates = toSignal(
    toObservable(this.questionnaireId).pipe(
      switchMap((questionnaireId) =>
        this.questionnaireContentUpdated
          .subscribe({ variables: { questionnaireId } })
          .pipe(
            ignoreElements(),
            catchError(() => EMPTY)
          )
      )
    )
  );

  readonly questionnaire = toSignal(
    toObservable(this.questionnaireId).pipe(
      switchMap((id) =>
        this.questionnaireById.watch({ variables: { id } }).valueChanges.pipe(
          map((r) => r.data?.questionnaireById),
          filter((n): n is QuestionnaireDetailsFragment => !!n)
        )
      )
    )
  );

  readonly contents = computed(() =>
    this.contentPresentationService.contents()
  );
  /** A refetch in the background keeps the presented contents on screen. */
  readonly loading = computed(
    () =>
      !!this.contentPresentationService.loadingContents() &&
      this.contents().length === 0
  );

  private readonly attributions = toSignal(
    toObservable(this.questionnaireId).pipe(
      switchMap((questionnaireId) =>
        this.attributionsByQuestionnaireId
          .watch({ variables: { questionnaireId } })
          .valueChanges.pipe(
            onlyCompleteData(),
            map((r) => r.data.templateContentAttributionsByQuestionnaireId),
            catchError(() => EMPTY)
          )
      )
    ),
    { initialValue: [] }
  );

  /** Licensed template contents are credited on a slide after the last content. */
  readonly hasAttributions = computed(() => {
    const contentIds = new Set(this.contents().map((c) => c.id));
    return this.attributions().some(
      (a) => contentIds.has(a.contentId) && isLicensedAttribution(a)
    );
  });

  readonly stepCount = computed(
    () => this.contents().length + (this.hasAttributions() ? 1 : 0)
  );

  readonly showContentResultsDirectly = linkedSignal(
    () => this.settings().showContentResultsDirectly || this.showResults()
  );

  readonly hideControlBar = linkedSignal(() => this.noControlBar());

  readonly currentIndex = computed(() =>
    this.contentPresentationService.currentContentIndex()
  );

  readonly content = computed(() =>
    this.contentPresentationService.currentContent()
  );

  readonly isAttributionStep = computed(
    () =>
      this.hasAttributions() && this.currentIndex() === this.contents().length
  );

  readonly startedContentId = computed(
    () => this.questionnaire()?.activeRound?.contentId
  );

  readonly isPublished = computed(() => {
    const questionnaire = this.questionnaire();
    if (questionnaire) {
      return this.contentPublishService.isIndexPublished(
        questionnaire.published ?? false,
        questionnaire.publishingMode,
        this.currentIndex(),
        questionnaire.publishedUpToContent?.position ?? undefined
      );
    }
  });

  readonly isLive = computed(
    () =>
      this.questionnaire()?.publishingMode === QuestionnairePublishingMode.Live
  );

  readonly endDate = computed(() =>
    answeringEndDate(this.content()?.activeRound)
  );

  readonly roundOver = linkedSignal({
    source: () => roundKey(this.questionnaire()?.activeRound),
    computation: () =>
      isRoundOver(
        this.questionnaire()?.activeRound,
        this.serverTimeService.determineServerTime().getTime(),
        this.isLive()
      ),
  });

  protected readonly scale = this.presentationService.scale;

  private readonly windowWidth = toSignal(
    fromEvent(window, 'resize').pipe(map(() => innerWidth)),
    { initialValue: innerWidth }
  );
  private readonly fontSize = parseFloat(
    getComputedStyle(document.body).fontSize
  );

  protected readonly containerStyle = computed(() => {
    const scale = this.scale();
    if (!scale) return;
    // Not a scale transform: Safari renders composited content such as chart canvases at its
    // unscaled size and stretches it, which blurs the whole card.
    // Zoom also applies to the container's own offset, hence the division.
    const top = this.windowWidth() * 0.04 - this.fontSize * scale;
    return {
      width: `${CARD_WIDTH}px`,
      zoom: scale,
      top: `${top / scale}px`,
    };
  });

  readonly initialized = signal(false);
  /** The presented content carries its counts, which its queries keep current. */
  readonly responseCounts = computed(() => ({
    answers: this.content()?.answerCount ?? 0,
    abstentions: this.content()?.abstentionCount ?? 0,
  }));
  canAnswerContent = false;
  showLeaderboard = false;
  isPublishing = false;

  /** A content's own updates, such as its answer counts, do not change its step. */
  readonly stepState = computed(
    () => {
      const content = this.content();
      if (!this.initialized() || (!content && !this.isAttributionStep())) {
        return;
      }
      const index = this.currentIndex();
      const stepCount = this.stepCount();
      return new ContentPresentationState(
        this.presentationService.getStepState(index, stepCount),
        index,
        stepCount,
        content
      );
    },
    { equal: (a, b) => stepKey(a) === stepKey(b) }
  );

  private hotkeyRefs: symbol[] = [];
  private publishingOfferedFor?: string;

  stepper = viewChild(ContentStepperComponent);

  constructor() {
    effect(() => {
      this.globalStorageService.setItem(
        STORAGE_KEYS.LAST_GROUP,
        this.questionnaireId()
      );
      if (this.contents().length > 0 && this.stepper() && !this.initialized()) {
        untracked(() => this.enterPresentation());
      }
      this.contentPresentationService.setQuestionnaireId(
        this.questionnaireId()
      );
    });
    effect(() => {
      const state = this.stepState();
      if (state) {
        untracked(() => this.presentationService.updateContentState(state));
      }
    });
    effect(() => {
      const questionnaire = this.questionnaire();
      if (
        questionnaire &&
        !questionnaire.published &&
        !this.noControlBar() &&
        this.publishingOfferedFor !== questionnaire.id
      ) {
        this.publishingOfferedFor = questionnaire.id;
        untracked(() => this.offerPublishing(questionnaire));
      }
    });
    this.eventService
      .on<boolean>('ControlBarVisible')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((isVisible) => {
        this.hideControlBar.set(!isVisible);
      });
    this.translateService
      .selectTranslate('creator.control-bar.leaderboard')
      .pipe(take(1))
      .subscribe((t) =>
        this.hotkeyService.registerHotkey(
          {
            key: 'l',
            action: () => this.toggleLeaderboard(),
            actionTitle: t,
          },
          this.hotkeyRefs
        )
      );
    this.destroyRef.onDestroy(() => {
      this.hotkeyRefs.forEach((h) => this.hotkeyService.unregisterHotkey(h));
    });
  }

  /**
   * An unpublished questionnaire shows participants nothing, so presenting it
   * starts with asking to publish it. The watched questionnaire picks up the
   * result.
   */
  private offerPublishing(questionnaire: QuestionnaireDetailsFragment) {
    this.dialogService
      .openPublishGroupDialog(questionnaire.id, questionnaire.publishingMode)
      .afterClosed()
      .subscribe((publishingMode) => {
        if (publishingMode) {
          this.notificationService.showAdvanced(
            this.translateService.translate('creator.content.group-published'),
            AdvancedSnackBarTypes.SUCCESS
          );
        }
      });
  }

  private toggleLeaderboard() {
    this.showLeaderboard = !this.showLeaderboard;
    this.presentationService.updateLeaderboardDisplayed(this.showLeaderboard);
  }

  updateRoute() {
    const content = this.content();
    if (!content) {
      return;
    }
    const currentPath = this.contentId() ? '..' : '.';
    const urlTree = this.router.createUrlTree([currentPath, content.id], {
      relativeTo: this.route,
      queryParams: this.route.snapshot.queryParams,
    });
    this.location.replaceState(this.router.serializeUrl(urlTree));
  }

  /** Enters at the content of the route, else at the stored index or the first step. */
  private enterPresentation() {
    const contentId = this.contentId();
    const entryIndex = contentId
      ? this.contents().find((c) => c.id === contentId)?.position
      : (this.globalStorageService.getItem(STORAGE_KEYS.LAST_INDEX) ?? 0);
    const index = entryIndex < this.stepCount() ? entryIndex : 0;
    this.contentPresentationService.setCurrentContentIndex(index);
    this.initialized.set(true);
    this.setCurrentContent(index);
    if (this.questionnaire()?.published) {
      this.updateStateChange();
    }
    const format = this.content()?.formatData.format;
    this.canAnswerContent =
      !!format && ![ContentType.Slide, ContentType.Flashcard].includes(format);
  }

  updateURL(index: number) {
    if (this.currentIndex() === index && !this.content()) {
      return;
    }
    this.contentPresentationService.setCurrentContentIndex(index);
    this.setCurrentContent(index);
    this.updateRoute();
    this.showLeaderboard = false;
    if (this.questionnaire()?.published) {
      this.updateStateChange();
    }
    const format = this.content()?.formatData.format;
    this.canAnswerContent =
      !!format && ![ContentType.Slide, ContentType.Flashcard].includes(format);
  }

  private setCurrentContent(index: number): void {
    const content = this.contents().find((c) => c.position === index);
    if (!content) {
      return;
    }
    const publishingIndex =
      this.questionnaire()?.publishedUpToContent?.position;
    if (
      this.isLive() &&
      !this.isPublished() &&
      (publishingIndex == null || index > publishingIndex)
    ) {
      this.publishCurrentContent();
    }
  }

  updateStateChange() {
    const contentId = this.content()?.id;
    const name = this.questionnaire()?.name;
    if (contentId && name) {
      this.focusModeService.updateContentState(
        contentId,
        this.currentIndex(),
        this.questionnaireId(),
        name
      );
    }
  }

  publishCurrentContent(): void {
    const contentId = this.content()?.id;
    if (!contentId) {
      return;
    }
    this.publishQuestionnaireContentUpTo
      .mutate({
        variables: {
          questionnaireId: this.questionnaireId(),
          contentId: contentId,
        },
      })
      .pipe(this.mutations.handleErrors())
      .subscribe();
  }

  startContent() {
    const contentId = this.content()?.id;
    if (!contentId) {
      return;
    }
    this.startQuestionnaireContent
      .mutate({ variables: { contentId } })
      .pipe(this.mutations.handleErrors())
      .subscribe();
  }

  stopContent() {
    this.stopQuestionnaireContent
      .mutate({ variables: { questionnaireId: this.questionnaireId() } })
      .pipe(this.mutations.handleErrors())
      .subscribe();
  }
}
