import {
  booleanAttribute,
  Component,
  inject,
  input,
  linkedSignal,
  ChangeDetectionStrategy,
  computed,
  effect,
  viewChild,
  DestroyRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { Location } from '@angular/common';
import { debounceTime, fromEvent, Subject, take, takeUntil } from 'rxjs';
import {
  CARD_WIDTH,
  PresentationService,
} from '@app/core/services/util/presentation.service';
import {
  ContentType,
  Questionnaire,
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
import { ContentPublishV4Service } from '@app/core/services/util/content-publish-v4.service';
import { ContentPresentationService } from '@app/presentation/content-presentation.service';

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
  private readonly contentPublishService = inject(ContentPublishV4Service);
  private readonly eventService = inject(EventService);
  private readonly translateService = inject(TranslocoService);
  private readonly hotkeyService = inject(HotkeyService);
  private readonly contentPresentationService = inject(
    ContentPresentationService
  );
  private readonly destroyRef = inject(DestroyRef);

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

  settings = input.required<UserUiSettings>();
  language = input.required<string>();
  questionnaire = input.required<Questionnaire>();

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
  private readonly destroyed$ = new Subject<void>();

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

  initialized = false;
  responseCounts: AnswerResponseCounts = { answers: 0, abstentions: 0 };
  canAnswerContent = false;
  attributions: ContentLicenseAttribution[] = [];
  endDate?: Date;
  showLeaderboard = false;
  answeringLocked = false;
  isPublishing = false;

  private hotkeyRefs: symbol[] = [];

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
        this.initScale();
        fromEvent(window, 'resize')
          .pipe(debounceTime(100), takeUntil(this.destroyed$))
          .subscribe(() => {
            this.initScale();
          });
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
        this.questionnaire().id
      );
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

  private toggleLeaderboard() {
    this.showLeaderboard = !this.showLeaderboard;
    this.presentationService.updateLeaderboardDisplayed(this.showLeaderboard);
  }

  initScale() {
    const scale = this.presentationService.getScale();
    const stepperContainer = document.getElementById('stepper-container');
    if (stepperContainer) {
      stepperContainer.style.width = `${CARD_WIDTH}px`;
      stepperContainer.style.transform = `scale(${scale})`;
      stepperContainer.style.left = `calc(50vw - calc(${CARD_WIDTH / 2}px * ${scale})`;
      stepperContainer.style.top = `calc(4vw - calc(1em * ${scale}))`;
    }
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
    if (this.questionnaire().published) {
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
    const publishingIndex = this.questionnaire().publishedUpToContent?.position;
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
    this.presentationService.startContent(this.questionnaire().id);
  }

  stopCountdown(): void {
    this.presentationService.stopContent();
  }

  updateStateChange() {
    const contentId = this.content()?.id;
    if (contentId) {
      this.focusModeService.updateContentState(
        contentId,
        this.currentIndex(),
        this.questionnaire().id,
        this.questionnaire().name
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
    return this.contentPublishService.isIndexPublished(
      this.questionnaire(),
      this.currentIndex()
    );
  }

  isGroupLocked(): boolean {
    return this.contentPublishService.isGroupLocked(this.questionnaire());
  }

  publishCurrentContent(): void {
    // TODO: Publish current content
  }

  isLiveMode(): boolean {
    return this.contentPublishService.isLive(this.questionnaire());
  }
}
