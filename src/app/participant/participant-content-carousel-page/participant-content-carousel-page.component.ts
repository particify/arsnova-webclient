import {
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ContentType } from '@app/core/models/content-type.enum';
import { ContentService } from '@app/core/services/http/content.service';
import { Content } from '@app/core/models/content';
import {
  ContentGroup,
  GroupType,
  PublishingMode,
} from '@app/core/models/content-group';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import {
  STEPPER_ANIMATION_DURATION,
  StepperComponent,
} from '@app/standalone/stepper/stepper.component';
import { ActivatedRoute, Router } from '@angular/router';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { Location, AsyncPipe } from '@angular/common';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { EntityChanged } from '@app/core/models/events/entity-changed';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { ContentFocusState } from '@app/core/models/events/remote/content-focus-state';
import { RoutingService } from '@app/core/services/util/routing.service';
import { ContentCarouselService } from '@app/core/services/util/content-carousel.service';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { FocusModeService } from '@app/participant/_services/focus-mode.service';
import { ContentLicenseAttribution } from '@app/core/models/content-license-attribution';
import { LICENSES } from '@app/core/models/licenses';
import { RoomUserAliasService } from '@app/core/services/http/room-user-alias.service';
import { RoomUserAlias } from '@app/core/models/room-user-alias';
import { SeriesOverviewComponent } from '@app/participant/series-overview/series-overview.component';
import { ContentParticipantComponent } from '@app/participant/content/content-participant/content-participant.component';
import { CdkStep } from '@angular/cdk/stepper';
import { FlexModule } from '@angular/flex-layout';
import { CoreModule } from '@app/core/core.module';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { BaseCardComponent } from '@app/standalone/base-card/base-card.component';
import { ContentWaitingComponent } from '@app/standalone/content-waiting/content-waiting.component';
import { AnswerResultType } from '@app/core/models/answer-result';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-participant-content-carousel-page',
  templateUrl: './participant-content-carousel-page.component.html',
  standalone: true,
  imports: [
    LoadingIndicatorComponent,
    CoreModule,
    FlexModule,
    StepperComponent,
    CdkStep,
    ContentParticipantComponent,
    SeriesOverviewComponent,
    AsyncPipe,
    TranslocoPipe,
    BaseCardComponent,
    ContentWaitingComponent,
  ],
  providers: [FocusModeService],
})
export class ParticipantContentCarouselPageComponent
  implements OnInit, OnDestroy
{
  @ViewChild(StepperComponent) stepper!: StepperComponent;

  private destroyed$ = new Subject<void>();

  ContentType: typeof ContentType = ContentType;

  contents: Content[] = [];
  contentGroup: ContentGroup;
  shortId: string;
  isLoading = true;
  started = false;
  answerResults = new Map<number, AnswerResultType>();
  AnswerResultType = AnswerResultType;
  userId?: string;
  currentStep = 0;
  isReloading = false;
  isReloadingCurrentContent = false;
  displaySnackBar = false;
  focusModeEnabled = false;
  lockedContentId?: string;
  routeChangedSubscription?: Subscription;

  isFinished = false;
  isPureInfoSeries = false;
  hasAnsweredLastContent = false;
  showOverview = false;

  attributions: ContentLicenseAttribution[] = [];
  GroupType = GroupType;
  alias?: RoomUserAlias;
  showStepper: boolean;
  showCard: boolean;

  constructor(
    private contentService: ContentService,
    protected translateService: TranslocoService,
    private contentgroupService: ContentGroupService,
    protected route: ActivatedRoute,
    private announceService: AnnounceService,
    private globalStorageService: GlobalStorageService,
    private location: Location,
    private authenticationService: AuthenticationService,
    private notificationService: NotificationService,
    private router: Router,
    private routingService: RoutingService,
    private contentCarouselService: ContentCarouselService,
    private contentPublishService: ContentPublishService,
    private focusModeService: FocusModeService,
    private roomUserAliasService: RoomUserAliasService,
    private contentGroupService: ContentGroupService,
    private destroyRef: DestroyRef
  ) {
    this.shortId = route.snapshot.data.room.shortId;
    this.showStepper = route.snapshot.data.showStepper ?? true;
    this.showCard = route.snapshot.data.showCard ?? true;
    this.contentGroup = route.snapshot.data.contentGroup;
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
    if (this.routeChangedSubscription) {
      this.routeChangedSubscription.unsubscribe();
    }
    this.contentCarouselService.setLastContentAnswered(false);
  }

  ngOnInit() {
    this.focusModeService
      .getFocusModeEnabled()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((focusModeEnabled) => {
        this.focusModeEnabled = focusModeEnabled;
      });
    this.translateService.setActiveLang(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
    const params = this.route.snapshot.params;
    const lastContentIndex = params['contentIndex'] - 1;
    if (this.contentGroup.leaderboardEnabled) {
      this.roomUserAliasService
        .generateAlias(this.contentGroup.roomId)
        .subscribe((alias) => {
          this.alias = alias;
        });
      this.roomUserAliasService.getCurrentAlias().subscribe((alias) => {
        if (this.alias) {
          if (alias) {
            this.alias.id = alias.id;
            if (alias.alias) {
              this.alias.alias = alias.alias;
            }
          }
        } else {
          this.alias = alias;
        }
      });
    }
    this.getContents(lastContentIndex);
    this.loadAttributions();
    this.contentGroupService
      .getChangesStreamForEntity(this.contentGroup)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((e) => this.handleStateEvent(e));
    this.focusModeService
      .getContentState()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((state) => {
        this.evaluateNewContentState(state);
      });
    this.routeChangedSubscription = this.routingService
      .getRouteChanges()
      .subscribe((route) => {
        const newGroup = route.params['seriesName'];
        if (newGroup && newGroup !== this.contentGroup.name) {
          this.router
            .navigateByUrl('/', { skipLocationChange: true })
            .then(() => {
              this.router.navigate(['..', newGroup], {
                relativeTo: this.route,
              });
            });
        }
        if (this.showOverview && route.params['contentIndex']) {
          this.showOverview = false;
          this.initStepper(route.params['contentIndex'] - 1);
        }
      });
  }

  evaluateNewContentState(state: ContentFocusState) {
    if (this.contentGroup.id === state.contentGroupId) {
      if (
        !this.currentStep ||
        this.contents[this.currentStep]?.id !== state.contentId
      ) {
        const newIndex = this.getIndexOfContentById(state.contentId);
        if (newIndex > -1) {
          if (this.started) {
            this.stepper.onClick(newIndex);
          } else {
            this.initStepper(newIndex, STEPPER_ANIMATION_DURATION);
          }
        } else {
          this.lockedContentId = state.contentId;
        }
      }
    } else {
      this.contentgroupService
        .getById(state.contentGroupId, { roomId: this.contentGroup.roomId })
        .subscribe((group) => {
          this.router
            .navigate(['p', 'room', this.shortId, 'group', group.name])
            .then(() => {
              this.contentGroup = group;
              this.isReloading = true;
              this.getContents(undefined, state.contentId);
            });
        });
    }
  }

  getIndexOfContentById(id: string): number {
    return this.contents.map((c) => c.id).indexOf(id);
  }

  getContents(lastContentIndex?: number, nextContentId?: string) {
    const publishedIds = this.contentPublishService.filterPublishedIds(
      this.contentGroup
    );
    if (publishedIds.length > 0 && this.contentGroup.published) {
      this.contentService
        .getContentsByIds(
          this.contentGroup.roomId,
          this.contentGroup.contentIds
        )
        .subscribe((contents: Content[]) => {
          this.contents = this.contentService.getSupportedContents(
            contents.filter(
              (c, i) =>
                !!c &&
                this.contentPublishService.isIndexPublished(
                  this.contentGroup,
                  i
                )
            )
          );
          if (nextContentId) {
            lastContentIndex = this.getIndexOfContentById(nextContentId);
          }
          if (
            lastContentIndex !== undefined &&
            lastContentIndex >= this.contents.length
          ) {
            lastContentIndex = this.contents.length - 1;
          }
          if (this.isReloading) {
            if (this.lockedContentId) {
              const newIndex = this.getIndexOfContentById(this.lockedContentId);
              if (newIndex) {
                lastContentIndex = newIndex;
                this.lockedContentId = undefined;
              }
            }
            this.updateContentIndexUrl(lastContentIndex);
          }
          this.getAnswers(lastContentIndex);
        });
    } else {
      this.contents = [];
      this.finishLoading();
    }
  }

  reloadContents() {
    this.isReloading = true;
    this.getContents(this.currentStep);
  }

  finishLoading() {
    this.isLoading = false;
    this.isReloading = false;
  }

  announce(key: string) {
    this.announceService.announce(key);
  }

  checkIfLastContentExists(contentIndex?: number) {
    this.checkState();
    // Since `null >= 0` is `true` trough a type coercion with `ToPrimitive() this muste be checked seperately
    if (contentIndex !== undefined && (contentIndex == 0 || contentIndex > 0)) {
      this.initStepper(contentIndex);
    } else {
      if (!this.focusModeEnabled) {
        this.getInitialStep();
      }
    }
  }

  initStepper(index: number, delay = 0) {
    setTimeout(() => {
      this.currentStep = index;
      this.stepper.init(index, this.contents.length);
    }, delay);
    this.started = true;
  }

  goToContent(index: number) {
    this.stepper.setHeaderPosition(index);
    this.stepper.onClick(index);
    this.updateContentIndexUrl(index);
  }

  updateContentIndexUrl(index: number = 0) {
    if (this.currentStep !== index && (!!index || !this.isReloading)) {
      setTimeout(() => {
        this.currentStep = index || 0;
        this.replaceUrl([
          'p',
          this.shortId,
          'series',
          this.contentGroup.name,
          index + 1,
        ]);
      }, STEPPER_ANIMATION_DURATION);
    }
  }

  isContentTimerActive(content: Content): boolean {
    return (
      !!content.state.answeringEndTime &&
      new Date(content.state.answeringEndTime) > new Date()
    );
  }

  getInitialStep() {
    const firstIndex = this.getFirstUnansweredContentIndex();
    if (
      (firstIndex === 0 ||
        (firstIndex && this.isContentTimerActive(this.contents[firstIndex]))) &&
      !this.isPureInfoSeries &&
      !this.contentCarouselService.isLastContentAnswered()
    ) {
      this.showOverview = false;
      this.initStepper(firstIndex || 0);
      this.updateContentIndexUrl(firstIndex);
    } else {
      this.showOverview = true;
    }
  }

  checkIfPureInfoSeries(): boolean {
    return this.contents.every((c) => this.isInfoContent(c));
  }

  isInfoContent(content: Content): boolean {
    return [ContentType.SLIDE, ContentType.FLASHCARD].includes(content.format);
  }

  getFirstUnansweredContentIndex(): number | undefined {
    for (let i = 0; i < this.contents.length; i++) {
      const content = this.contents[i];
      if (
        this.answerResults.get(i) === AnswerResultType.UNANSWERED &&
        (!content.state.answeringEndTime ||
          this.isContentTimerActive(content)) &&
        !this.isInfoContent(content)
      ) {
        return i;
      }
    }
    return;
  }

  checkState() {
    this.isPureInfoSeries = this.checkIfPureInfoSeries();
    this.isFinished =
      this.getFirstUnansweredContentIndex() === undefined ||
      this.contentCarouselService.isLastContentAnswered();
  }

  nextContent() {
    if (this.currentStep < this.contents.length - 1) {
      this.stepper.next();
    } else {
      this.goToOverview();
    }
  }

  goToOverview() {
    this.showOverview = true;
    this.replaceUrl(['p', this.shortId, 'series', this.contentGroup.name]);
  }

  replaceUrl(url: any[]) {
    const urlTree = this.router.createUrlTree(url);
    this.location.replaceState(this.router.serializeUrl(urlTree));
  }

  resetAnswer(index: number): void {
    this.answerResults.set(index, AnswerResultType.UNANSWERED);
  }

  receiveSentStatus(answerResultType: AnswerResultType, index: number) {
    this.answerResults.set(index, answerResultType);
    if (index === this.contents.length - 1) {
      this.hasAnsweredLastContent =
        answerResultType !== AnswerResultType.UNANSWERED;
    }
    this.contentCarouselService.setLastContentAnswered(
      this.hasAnsweredLastContent
    );
    this.checkState();
    if (
      !this.focusModeEnabled &&
      this.started &&
      this.contentGroup.publishingMode !== PublishingMode.LIVE &&
      this.contentGroup.groupType !== GroupType.QUIZ
    ) {
      setTimeout(() => {
        if (index < this.contents.length - 1) {
          this.nextContent();
          setTimeout(() => {
            document.getElementById('step')?.focus();
          }, 200);
        } else {
          this.goToOverview();
        }
      }, 1000);
    }
  }

  getAnswers(lastContentIndex?: number) {
    this.authenticationService.getCurrentAuthentication().subscribe((auth) => {
      this.userId = auth.userId;
      this.contentGroupService
        .getAnswerStats(
          this.contentGroup.roomId,
          this.contentGroup.id,
          this.userId
        )
        .subscribe({
          next: (resultOverview) => {
            this.contents.forEach((c, i) => {
              this.answerResults.set(i, resultOverview.answerResults[i].state);
            });
            this.finishLoading();
            this.checkIfLastContentExists(lastContentIndex);
          },
          error: () => {
            this.finishLoading();
            const msg = this.translateService.translate(
              'participant.answer.group-not-available'
            );
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.WARNING
            );
          },
        });
    });
  }

  handleStateEvent(changedEvent: EntityChanged<ContentGroup>) {
    this.contentGroup = changedEvent.payload.entity;
    if (
      !changedEvent.hasPropertyChanged('publishingMode') &&
      !changedEvent.hasPropertyChanged('publishingIndex')
    ) {
      return;
    }
    if (this.focusModeEnabled) {
      this.reloadContents();
    } else if (
      this.contentGroup.publishingMode === PublishingMode.LIVE &&
      changedEvent.hasPropertyChanged('publishingIndex')
    ) {
      this.getContents(
        this.currentStep,
        this.contentGroup.contentIds[
          changedEvent.payload.entity.publishingIndex
        ]
      );
      this.showOverview = false;
    } else if (!this.displaySnackBar) {
      this.displaySnackBar = true;
      const contentsChangedMessage = this.translateService.translate(
        'participant.answer.state-changed'
      );
      const loadString = this.translateService.translate(
        'participant.answer.load'
      );
      this.notificationService.show(contentsChangedMessage, loadString, {
        duration: 5000,
      });
      this.notificationService.snackRef.onAction().subscribe(() => {
        this.displaySnackBar = false;
        this.reloadContents();
      });
      this.notificationService.snackRef.afterDismissed().subscribe(() => {
        this.displaySnackBar = false;
      });
    }
  }

  loadAttributions(): void {
    this.contentgroupService
      .getAttributions(this.contentGroup.roomId, this.contentGroup.id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((attributions) => {
        if (attributions.length > 0) {
          this.attributions = attributions;
        }
      });
  }

  getAttribution(): string | undefined {
    if (!this.attributions) {
      return;
    }
    const attribution = this.attributions.find(
      (a) => a.contentId === this.contents[this.currentStep].id
    );
    if (!attribution || attribution.license === 'CC0-1.0') {
      return;
    }
    return this.translateService.translate(
      'participant.content.attribution-info',
      {
        attribution:
          attribution.attribution ||
          this.translateService.translate('templates.anonymous'),
        license: LICENSES.get(attribution.license)?.name,
      }
    );
  }
}
