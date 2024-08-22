import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentService } from '@app/core/services/http/content.service';
import { Content } from '@app/core/models/content';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { Location } from '@angular/common';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ContentGroup } from '@app/core/models/content-group';
import { ContentType } from '@app/core/models/content-type.enum';
import { Subject, take, takeUntil } from 'rxjs';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { UserService } from '@app/core/services/http/user.service';
import { UserSettings } from '@app/core/models/user-settings';
import { ContentPresentationState } from '@app/core/models/events/content-presentation-state';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { Room } from '@app/core/models/room';
import { ContentLicenseAttribution } from '@app/core/models/content-license-attribution';
import { EventService } from '@app/core/services/util/event.service';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import {
  HotkeyActionButtonComponent,
  hotkeyEnterLeaveAnimation,
} from '@app/standalone/hotkey-action-button/hotkey-action-button.component';
import { TranslocoService } from '@jsverse/transloco';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { CoreModule } from '@app/core/core.module';
import { ContentResultsComponent } from '@app/standalone/content-results/content-results.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { AnswerCountComponent } from '@app/standalone/answer-count/answer-count.component';
import { StepperComponent } from '@app/standalone/stepper/stepper.component';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { AttributionsInfoComponent } from '@app/standalone/attributions-info/attributions-info.component';
import { CountdownTimerComponent } from '@app/standalone/countdown-timer/countdown-timer.component';
import { ContentWaitingComponent } from '@app/standalone/content-waiting/content-waiting.component';
import { ContentStepInfoComponent } from '@app/standalone/content-step-info/content-step-info.component';
import { ContentStepperComponent } from '@app/standalone/content-stepper/content-stepper.component';
import { LeaderboardPageComponent } from '@app/standalone/leaderboard-page/leaderboard-page.component';
import { PulsatingCircleComponent } from '@app/standalone/pulsating-circle/pulsating-circle.component';

@Component({
  selector: 'app-contents-page',
  standalone: true,
  imports: [
    CoreModule,
    ContentResultsComponent,
    LoadingIndicatorComponent,
    AnswerCountComponent,
    StepperComponent,
    CdkStepperModule,
    AttributionsInfoComponent,
    HotkeyActionButtonComponent,
    CountdownTimerComponent,
    ContentWaitingComponent,
    ContentStepInfoComponent,
    ContentStepperComponent,
    LeaderboardPageComponent,
    PulsatingCircleComponent,
  ],
  templateUrl: './contents-page.component.html',
  styleUrls: ['./contents-page.component.scss'],
  animations: [hotkeyEnterLeaveAnimation],
})
export class ContentsPageComponent implements OnInit, OnDestroy {
  destroyed$ = new Subject<void>();

  contents: Content[] = [];
  isLoading = true;
  entryIndex = 0;
  contentIndex = 0;
  room: Room;
  contentGroupName: string;
  currentStep = 0;
  answerCount = 0;
  // TODO: non-null assertion operator is used here temporaly. We need to use a resolver here to move async logic out of component.
  content!: Content;
  contentGroup!: ContentGroup;
  canAnswerContent = false;
  settings = new UserSettings();
  attributions: ContentLicenseAttribution[] = [];
  stepCount = 0;
  endDate?: Date;
  controlBarVisible = true;
  showLeaderboard = false;
  showStepInfo: boolean;
  showAnswerCount: boolean;
  showHotkeyActionButtons: boolean;
  answeringLocked = false;
  isPublishing = false;

  private hotkeyRefs: symbol[] = [];

  constructor(
    private route: ActivatedRoute,
    private contentService: ContentService,
    private contentGroupService: ContentGroupService,
    private globalStorageService: GlobalStorageService,
    private location: Location,
    private router: Router,
    private presentationService: PresentationService,
    private userService: UserService,
    private focusModeService: FocusModeService,
    private contentPublishService: ContentPublishService,
    private eventService: EventService,
    private translateService: TranslocoService,
    private hotkeyService: HotkeyService
  ) {
    const routeSeriesName = this.route.snapshot.params['seriesName'];
    // Use index from route if available. Otherwise use the stored index or 0 as fallback.
    const routeContentIndex =
      (this.route.snapshot.params['contentIndex'] ?? 0) - 1;
    const lastIndex =
      this.globalStorageService.getItem(STORAGE_KEYS.LAST_INDEX) ?? 0;
    this.entryIndex = routeContentIndex > -1 ? routeContentIndex : lastIndex;
    this.contentGroupName =
      this.globalStorageService.getItem(STORAGE_KEYS.LAST_GROUP) ||
      routeSeriesName;
    this.globalStorageService.setItem(
      STORAGE_KEYS.LAST_GROUP,
      this.contentGroupName
    );
    this.room = this.route.snapshot.data.room;
    this.showStepInfo = !!this.route.snapshot.data.showStepInfo;
    this.showAnswerCount = !!this.route.snapshot.data.showAnswerCount;
    this.showHotkeyActionButtons =
      !!this.route.snapshot.data.showHotkeyActionButtons;
    this.controlBarVisible = !this.route.snapshot.data.noControlBar;
  }

  ngOnInit() {
    const loginId = this.globalStorageService.getItem(
      STORAGE_KEYS.USER
    ).loginId;
    this.userService.getUserSettingsByLoginId(loginId).subscribe((settings) => {
      if (settings) {
        this.settings = settings;
        if (this.route.snapshot.queryParams.showResults === 'true') {
          this.settings.showContentResultsDirectly = true;
        }
      }
      this.initGroup(true);
    });
    this.eventService
      .on<boolean>('ControlBarVisible')
      .subscribe((isVisible) => {
        this.controlBarVisible = isVisible;
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
    this.presentationService.getCountdownChanged().subscribe((content) => {
      this.initScale();
      this.content.state = content.state;
      if (this.content.state.answeringEndTime) {
        this.endDate = new Date(this.content.state.answeringEndTime);
        this.answeringLocked = new Date() > this.endDate;
      } else {
        this.endDate = undefined;
      }
    });
    this.contentService
      .getAnswersDeleted()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((contentId) => {
        if (contentId && contentId === this.content.id) {
          this.presentationService.reloadCurrentContent();
        }
      });
  }

  private toggleLeaderboard() {
    this.showLeaderboard = !this.showLeaderboard;
  }

  ngOnDestroy() {
    this.hotkeyRefs.forEach((h) => this.hotkeyService.unregisterHotkey(h));
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  initScale() {
    const scale = this.presentationService.getScale();
    const stepperContainer = document.getElementById('stepper-container');
    if (stepperContainer) {
      stepperContainer.style.transform = `scale(${scale})`;
      stepperContainer.style.left = `calc(50vw - calc(305px * ${scale})`;
      stepperContainer.style.top = `calc(4vw - calc(1em * ${scale}))`;
    }
  }

  initGroup(initial = false) {
    this.contentGroupService
      .getByRoomIdAndName(this.room.id, this.contentGroupName, true)
      .subscribe((group) => {
        this.contentGroup = group;
        if (this.contentGroup.contentIds) {
          this.contentService
            .getContentsByIds(
              this.contentGroup.roomId,
              this.contentGroup.contentIds,
              true
            )
            .subscribe((contents) => {
              this.contents =
                this.contentService.getSupportedContents(contents);
              this.stepCount = this.contents.length;
              this.contentGroupService
                .getAttributions(this.room.id, this.contentGroup.id)
                .pipe(takeUntil(this.destroyed$))
                .subscribe((attributions) => {
                  if (attributions.length > 0) {
                    this.attributions = attributions;
                    this.stepCount++;
                  }
                  this.finishInit(initial);
                });
              if (this.entryIndex > -1) {
                this.contentIndex = initial ? this.entryIndex : 0;
                this.setCurrentContent(this.contentIndex);
              }
              this.sendContentStepState();
            });
        } else {
          this.finishInit(initial);
          this.sendContentStepState(true);
        }
      });
  }

  finishInit(initial: boolean) {
    this.isLoading = false;
    if (initial) {
      this.initScale();
      this.presentationService
        .getCurrentGroup()
        .pipe(takeUntil(this.destroyed$))
        .subscribe((group) => {
          this.isLoading = true;
          this.contentGroupName = group;
          this.initGroup();
        });
    }
  }

  updateRoute(index: number) {
    const currentPath = this.route.snapshot.params.contentIndex ? '..' : '.';
    const urlTree = this.router.createUrlTree([currentPath, index], {
      relativeTo: this.route,
      queryParams: this.route.snapshot.queryParams,
    });
    this.location.replaceState(this.router.serializeUrl(urlTree));
  }

  updateURL(index: number) {
    if (this.currentStep === index && !this.content) {
      return;
    }
    this.setCurrentContent(index);
    const urlIndex = index + 1;
    this.updateRoute(urlIndex);
    this.sendContentStepState();
    this.showLeaderboard = false;
    if (
      this.attributions.length > 0 &&
      this.currentStep === this.stepCount - 1
    ) {
      return;
    }
    if (this.contentGroup.published) {
      this.updateStateChange();
    }
    this.canAnswerContent = ![
      ContentType.SLIDE,
      ContentType.FLASHCARD,
    ].includes(this.content.format);
    if (index !== this.entryIndex) {
      this.contentIndex = -1;
    }
  }

  private setCurrentContent(index: number): void {
    this.currentStep = index;
    const lastAnsweringEndTime = this.content?.state.answeringEndTime;
    this.content = this.contents[index];
    if (
      this.isLiveMode() &&
      !this.isPublished() &&
      index > this.contentGroup.publishingIndex &&
      lastAnsweringEndTime &&
      this.answeringLocked
    ) {
      this.publishCurrentContent();
    }
    if (this.content.state.answeringEndTime) {
      this.endDate = new Date(this.content.state.answeringEndTime);
      this.answeringLocked = new Date() > this.endDate;
    } else {
      this.endDate = undefined;
    }
  }

  startCountdown(): void {
    this.presentationService.startContent();
  }

  stopCountdown(): void {
    this.presentationService.stopContent();
  }

  updateCounter(count: number) {
    this.answerCount = count;
  }

  updateStateChange() {
    this.focusModeService.updateContentState(
      this.room,
      this.content.id,
      this.currentStep,
      this.contentGroup.id,
      this.contentGroup.name
    );
  }

  sendContentStepState(emptyList = false) {
    let position;
    let index;
    if (!emptyList) {
      index = this.currentStep;
      position = this.presentationService.getStepState(
        this.currentStep,
        this.stepCount
      );
      const state = new ContentPresentationState(position, index, this.content);
      this.presentationService.updateContentState(state);
    }
  }

  isPublished(): boolean {
    return this.contentPublishService.isIndexPublished(
      this.contentGroup,
      this.currentStep
    );
  }

  isGroupLocked(): boolean {
    return this.contentPublishService.isGroupLocked(this.contentGroup);
  }

  publishCurrentContent(): void {
    this.isPublishing = true;
    const changes = { publishingIndex: this.currentStep };
    this.contentGroupService
      .patchContentGroup(this.contentGroup, changes)
      .subscribe(() => {
        this.contentGroup.publishingIndex = this.currentStep;
        this.isPublishing = false;
      });
  }

  isLiveMode(): boolean {
    return this.contentPublishService.isGroupLive(this.contentGroup);
  }
}
