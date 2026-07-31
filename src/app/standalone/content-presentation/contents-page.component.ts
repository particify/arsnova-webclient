import {
  booleanAttribute,
  Component,
  inject,
  input,
  linkedSignal,
  ChangeDetectionStrategy,
  computed,
  effect,
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
import { filter, map, switchMap, take } from 'rxjs';
import {
  CARD_WIDTH,
  PresentationService,
} from '@app/core/services/util/presentation.service';
import {
  ContentType,
  Questionnaire,
  QuestionnaireByIdGql,
  UserUiSettings,
} from '@gql/generated/graphql';
import { ContentPresentationState } from '@app/core/models/events/content-presentation-state';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { ContentLicenseAttribution } from '@app/core/models/content-license-attribution';
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
import { AnswerResponseCounts } from '@app/core/models/answer-response-counts';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { ContentPresentationService } from '@app/presentation/content-presentation.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

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
  private readonly presentationService = inject(PresentationService);
  private readonly focusModeService = inject(FocusModeService);
  private readonly contentPublishService = inject(ContentPublishService);
  private readonly eventService = inject(EventService);
  private readonly translateService = inject(TranslocoService);
  private readonly hotkeyService = inject(HotkeyService);
  private readonly dialogService = inject(DialogService);
  private readonly notificationService = inject(NotificationService);
  private readonly contentPresentationService = inject(
    ContentPresentationService
  );
  private readonly destroyRef = inject(DestroyRef);
  private readonly questionnaireById = inject(QuestionnaireByIdGql);

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

  readonly questionnaire = toSignal(
    toObservable(this.questionnaireId).pipe(
      switchMap((id) =>
        this.questionnaireById.watch({ variables: { id } }).valueChanges.pipe(
          map((r) => r.data?.questionnaireById),
          filter((n): n is Questionnaire => !!n)
        )
      )
    )
  );

  readonly contents = computed(() =>
    this.contentPresentationService.contents()
  );
  readonly loading = computed(() =>
    this.contentPresentationService.loadingContents()
  );

  readonly stepCount = computed(() => this.contents()?.length ?? 0);

  readonly showContentResultsDirectly = linkedSignal(
    () => this.settings().showContentResultsDirectly || this.showResults()
  );

  private readonly _questionnaireId = computed(
    () =>
      this.globalStorageService.getItem(STORAGE_KEYS.LAST_GROUP) ??
      this.questionnaireId()
  );
  readonly hideControlBar = linkedSignal(() => this.noControlBar());

  readonly currentIndex = computed(() =>
    this.contentPresentationService.currentContentIndex()
  );

  readonly content = computed(() =>
    this.contentPresentationService.currentContent()
  );

  protected readonly scale = computed(() =>
    this.presentationService.getScale()
  );

  protected readonly containerStyle = computed(() => {
    const scale = this.scale();
    if (!scale) return;
    return {
      width: `${CARD_WIDTH}px`,
      transform: `scale(${scale})`,
      left: `calc(50vw - calc(${CARD_WIDTH / 2}px * ${scale}))`,
      top: `calc(4vw - calc(1em * ${scale}))`,
    };
  });

  initialized = false;
  /** The presented content carries its counts, which its queries keep current. */
  readonly responseCounts = computed<AnswerResponseCounts>(() => ({
    answers: this.content()?.answerCount ?? 0,
    abstentions: this.content()?.abstentionCount ?? 0,
  }));
  canAnswerContent = false;
  attributions: ContentLicenseAttribution[] = [];
  endDate?: Date;
  showLeaderboard = false;
  answeringLocked = false;
  isPublishing = false;

  private hotkeyRefs: symbol[] = [];
  private publishingOfferedFor?: string;

  stepper = viewChild(ContentStepperComponent);

  constructor() {
    effect(() => {
      // Use index from route if available. Otherwise use the stored index or 0 as fallback.
      if (this._questionnaireId()) {
        this.globalStorageService.setItem(
          STORAGE_KEYS.LAST_GROUP,
          this._questionnaireId()
        );
      }
      if (this.contents()?.length > 0 && this.stepper()) {
        if (!this.initialized) {
          const contentId = this.contentId();
          const entryIndex = contentId
            ? this.contents().find((c) => c.id === contentId)?.position
            : (this.globalStorageService.getItem(STORAGE_KEYS.LAST_INDEX) ?? 0);
          const index = entryIndex < this.stepCount() ? entryIndex : 0;
          this.contentPresentationService.setCurrentContentIndex(index);
          // Deferred out of the change detection pass this effect runs in, because the control bar
          // reads the step state and would otherwise change after it has been checked.
          queueMicrotask(() => this.enterContent(index));
          this.initialized = true;
        }
      }
      this.contentPresentationService.setQuestionnaireId(
        this.questionnaireId()
      );
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
  private offerPublishing(questionnaire: Questionnaire) {
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
    const currentPath = this.contentId() ? '..' : '.';
    const urlTree = this.router.createUrlTree(
      [currentPath, this.content().id],
      {
        relativeTo: this.route,
        queryParams: this.route.snapshot.queryParams,
      }
    );
    this.location.replaceState(this.router.serializeUrl(urlTree));
  }

  private enterContent(index: number) {
    this.setCurrentContent(index);
    this.sendContentStepState(index);
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
    if (
      this.attributions.length > 0 &&
      this.currentIndex() === this.stepCount() - 1
    ) {
      return;
    }
    this.contentPresentationService.setCurrentContentIndex(index);
    this.setCurrentContent(index);
    this.updateRoute();
    this.sendContentStepState(index);
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
      this.isLiveMode() &&
      !this.isPublished() &&
      (publishingIndex == null || index > publishingIndex) &&
      this.answeringLocked
    ) {
      this.publishCurrentContent();
    }
  }

  startCountdown(): void {
    this.presentationService.startContent(this.questionnaireId());
  }

  stopCountdown(): void {
    this.presentationService.stopContent();
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

  sendContentStepState(index: number, emptyList = false) {
    const content = this.content();
    if (!content) {
      return;
    }
    if (!emptyList) {
      const state = new ContentPresentationState(
        this.presentationService.getStepState(index, this.stepCount()),
        index,
        content
      );
      this.presentationService.updateContentState(state);
    }
  }

  isPublished(): boolean {
    const questionnaire = this.questionnaire();
    return (
      !!questionnaire &&
      this.contentPublishService.isIndexPublished(
        questionnaire,
        this.currentIndex()
      )
    );
  }

  publishCurrentContent(): void {
    // TODO: Publish current content
  }

  isLiveMode(): boolean {
    const questionnaire = this.questionnaire();
    return !!questionnaire && this.contentPublishService.isLive(questionnaire);
  }
}
