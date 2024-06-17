import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ContentType } from '@app/core/models/content-type.enum';
import { ContentService } from '@app/core/services/http/content.service';
import { Content } from '@app/core/models/content';
import {
  ContentGroup,
  GroupType,
  PublishingMode,
} from '@app/core/models/content-group';
import { TranslocoService, TranslocoPipe } from '@ngneat/transloco';
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
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { Answer } from '@app/core/models/answer';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { EventService } from '@app/core/services/util/event.service';
import { EntityChanged } from '@app/core/models/events/entity-changed';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { ContentFocusState } from '@app/core/models/events/remote/content-focus-state';
import { RoutingService } from '@app/core/services/util/routing.service';
import { ContentCarouselService } from '@app/core/services/util/content-carousel.service';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { FocusModeService } from '@app/participant/_services/focus-mode.service';
import { EntityChangedPayload } from '@app/core/models/events/entity-changed-payload';
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
  alreadySent: Map<number, boolean> = new Map<number, boolean>();
  started = false;
  answers: (Answer | undefined)[] = [];
  currentStep = 0;
  isReloading = false;
  isReloadingCurrentContent = false;
  displaySnackBar = false;
  focusModeEnabled = false;
  lockedContentId?: string;
  changesSubscription?: Subscription;
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
    private answerService: ContentAnswerService,
    private authenticationService: AuthenticationService,
    private notificationService: NotificationService,
    private eventService: EventService,
    private router: Router,
    private routingService: RoutingService,
    private contentCarouselService: ContentCarouselService,
    private contentPublishService: ContentPublishService,
    private focusModeService: FocusModeService,
    private roomUserAliasService: RoomUserAliasService
  ) {
    this.shortId = route.snapshot.data.room.shortId;
    this.showStepper = route.snapshot.data.showStepper ?? true;
    this.showCard = route.snapshot.data.showCard ?? true;
    this.contentGroup = route.snapshot.data.contentGroup;
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
    if (this.changesSubscription) {
      this.changesSubscription.unsubscribe();
    }
    if (this.routeChangedSubscription) {
      this.routeChangedSubscription.unsubscribe();
    }
    this.destroyed$.next();
    this.destroyed$.complete();
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
    }
    this.getContents(lastContentIndex);
    this.loadAttributions();
    this.changesSubscription = this.eventService
      .on('EntityChanged')
      .subscribe((changes) => {
        this.handleStateEvent(changes as EntityChangedPayload<ContentGroup>);
      });
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
          this.contentgroupService
            .getByRoomIdAndName(this.contentGroup.roomId, newGroup)
            .subscribe((group) => {
              this.contentGroup = group;
              this.isReloading = true;
              this.getContents();
              this.loadAttributions();
            });
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
    this.contents = [];
    const publishedIds = this.contentPublishService.filterPublishedIds(
      this.contentGroup
    );
    if (
      publishedIds.length > 0 &&
      this.contentGroup.publishingMode !== PublishingMode.NONE
    ) {
      this.contentService
        .getContentsByIds(this.contentGroup.roomId, publishedIds)
        .subscribe((contents) => {
          this.contents = this.contentService.getSupportedContents(contents);
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
    setTimeout(() => {
      if ((!!index && this.currentStep !== index) || !this.isReloading) {
        this.currentStep = index || 0;
        this.replaceUrl([
          'p',
          this.shortId,
          'series',
          this.contentGroup.name,
          index + 1,
        ]);
      }
    }, STEPPER_ANIMATION_DURATION);
  }

  isContentTimerActive(content: Content): boolean {
    return new Date(content.state.answeringEndTime) > new Date();
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
        this.alreadySent.get(i) === false &&
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
      this.stepper.headerPos = 0;
      this.stepper.onClick(0);
    }
  }

  goToOverview() {
    this.showOverview = true;
    // Using `onSameUrlNavigation` reload strategy to reload components on routing if only params have been removed
    this.router.navigate(
      ['p', this.shortId, 'series', this.contentGroup.name],
      {
        onSameUrlNavigation: 'reload',
      }
    );
  }

  replaceUrl(url: any[]) {
    const urlTree = this.router.createUrlTree(url);
    this.location.replaceState(this.router.serializeUrl(urlTree));
  }

  resetAnswer(contentId: string, index: number): void {
    this.alreadySent.set(index, false);
    this.answers[this.getIndexOfContentById(contentId)] = undefined;
  }

  receiveSentStatus(answer: Answer, index: number) {
    this.alreadySent.set(index, !!answer);
    if (index === this.contents.length - 1) {
      this.hasAnsweredLastContent = this.alreadySent.get(index) || false;
    }
    this.contentCarouselService.setLastContentAnswered(
      this.hasAnsweredLastContent
    );
    this.checkState();
    this.answers[this.getIndexOfContentById(answer.contentId)] = answer;
    if (!this.focusModeEnabled) {
      if (this.started) {
        setTimeout(() => {
          if (index < this.contents.length - 1) {
            if (
              this.contentGroup.groupType !== GroupType.QUIZ ||
              (this.contentGroup.groupType === GroupType.QUIZ &&
                !this.isContentTimerActive(this.contents[this.currentStep]))
            ) {
              this.nextContent();
              setTimeout(() => {
                document.getElementById('step')?.focus();
              }, 200);
            }
          } else if (
            this.contentGroup.groupType !== GroupType.QUIZ ||
            (this.contentGroup.groupType === GroupType.QUIZ &&
              this.contents.length === this.contentGroup.contentIds.length)
          ) {
            this.goToOverview();
          }
        }, 1000);
      }
    }
  }

  getAnswers(lastContentIndex?: number) {
    this.authenticationService.getCurrentAuthentication().subscribe((auth) => {
      this.answerService
        .getAnswersByUserIdContentIds(
          this.contentGroup.roomId,
          auth.userId,
          this.contents.map((c) => c.id)
        )
        .subscribe(
          (answers) => {
            let answersAdded = 0;
            this.answers = [];
            this.alreadySent = new Map<number, boolean>();
            for (const [index, content] of this.contents.entries()) {
              if (answersAdded < answers.length) {
                for (const answer of answers) {
                  if (content.id === answer.contentId) {
                    this.answers[index] = answer;
                    answersAdded++;
                  }
                }
              }
              this.alreadySent.set(index, !!this.answers[index]);
            }
            this.finishLoading();
            this.checkIfLastContentExists(lastContentIndex);
          },
          () => {
            this.finishLoading();
            const msg = this.translateService.translate(
              'participant.answer.group-not-available'
            );
            this.notificationService.showAdvanced(
              msg,
              AdvancedSnackBarTypes.WARNING
            );
          }
        );
    });
  }

  handleStateEvent(changes: EntityChangedPayload<ContentGroup>) {
    if (changes.entity.id === this.contentGroup.id) {
      this.contentGroup = changes.entity;
      const changedEvent = new EntityChanged(
        'ContentGroup',
        changes.entity,
        changes.changedProperties
      );
      if (
        changedEvent.hasPropertyChanged('publishingMode') ||
        changedEvent.hasPropertyChanged('publishingIndex')
      ) {
        if (this.focusModeEnabled) {
          this.reloadContents();
        } else if (
          this.contentGroup.groupType === GroupType.QUIZ &&
          changedEvent.hasPropertyChanged('publishingIndex')
        ) {
          this.isReloading = true;
          this.getContents(
            this.currentStep,
            this.contentGroup.contentIds[changes.entity.publishingIndex]
          );
          this.showOverview = false;
        } else {
          if (!this.displaySnackBar) {
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
      }
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
