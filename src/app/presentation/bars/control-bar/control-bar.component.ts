import { EventService } from '@app/core/services/util/event.service';
import {
  Component,
  OnDestroy,
  OnInit,
  inject,
  input,
  ChangeDetectionStrategy,
  effect,
  computed,
  viewChild,
  output,
  model,
  untracked,
} from '@angular/core';
import {
  NavBarComponent,
  NavBarItem,
} from '@app/standalone/nav-bar/nav-bar.component';
import { STORAGE_KEYS } from '@app/core/services/util/global-storage.service';
import { map, switchMap, take, takeUntil, throttleTime } from 'rxjs/operators';
import { fromEvent, Subject } from 'rxjs';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { Hotkey, HotkeyService } from '@app/core/services/util/hotkey.service';
import {
  HotkeyDirective,
  HotkeyAction,
} from '@app/core/directives/hotkey.directive';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { RoutingFeature } from '@app/core/models/routing-feature.enum';
import { DialogService } from '@app/core/services/util/dialog.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { CommentSort } from '@app/core/models/comment-sort.enum';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { ContentPresentationState } from '@app/core/models/events/content-presentation-state';
import { PresentationStepPosition } from '@app/core/models/events/presentation-step-position.enum';
import { CommentPresentationState } from '@app/core/models/events/comment-presentation-state';
import { ContentPresentationMenuComponent } from '@app/standalone/content-presentation-menu/content-presentation-menu.component';
import { CommentFilter } from '@app/core/models/comment-filter.enum';
import { ExtensionPointComponent } from '@projects/extension-point/src/lib/extension-point.component';
import { FlexModule } from '@angular/flex-layout';
import { NgClass } from '@angular/common';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { MatRipple } from '@angular/material/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { KeyButtonBarComponent } from '@app/presentation/bars/key-button-bar/key-button-bar.component';
import { CommentFilterComponent } from '@app/standalone/comment-filter/comment-filter.component';
import {
  ToggleButtonBarComponent,
  ToggleButtonOption,
} from '@app/standalone/toggle-button-bar/toggle-button-bar.component';
import { ShareOverlayComponent } from '@app/standalone/share-overlay/share-overlay.component';
import {
  EventCategory,
  TrackingService,
} from '@app/core/services/util/tracking.service';
import {
  Content,
  ContentType,
  QuestionnairesByRoomIdGql,
  QuestionnaireSummaryFragment,
  QuestionnaireType,
  Tag,
} from '@gql/generated/graphql';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ContentResultsService } from '@app/standalone/content-results/content-results.service';
import { VisualizationType } from '@app/standalone/content-results/visualization/visualization-type';

export class KeyNavBarItem extends NavBarItem {
  key: string;
  displayKey: string;
  disabled: boolean;
  highlighted: boolean;

  constructor(
    name: string,
    icon: string,
    url: string,
    key: string,
    disabled = false,
    highlighted = false
  ) {
    super(name, icon, url, false);
    const keyInfo = HotkeyService.getKeyDisplayInfo(key);
    this.key = key;
    this.displayKey = keyInfo.translateKeyName
      ? 'creator.control-bar.' + keyInfo.keyName
      : keyInfo.keySymbol;
    this.disabled = disabled;
    this.highlighted = highlighted;
  }
}

@Component({
  selector: 'app-control-bar',
  templateUrl: './control-bar.component.html',
  styleUrls: ['./control-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    ExtensionPointComponent,
    FlexModule,
    NgClass,
    ExtendedModule,
    MatRipple,
    MatTooltip,
    HotkeyDirective,
    MatIcon,
    MatButton,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    KeyButtonBarComponent,
    ContentPresentationMenuComponent,
    CommentFilterComponent,
    TranslocoPipe,
    ToggleButtonBarComponent,
    ShareOverlayComponent,
  ],
})
export class ControlBarComponent
  extends NavBarComponent
  implements OnInit, OnDestroy
{
  private readonly announceService = inject(AnnounceService);
  private readonly eventService = inject(EventService);
  private readonly hotkeyService = inject(HotkeyService);
  private readonly translateService = inject(TranslocoService);
  private readonly dialogService = inject(DialogService);
  private readonly notificationService = inject(NotificationService);
  private readonly presentationService = inject(PresentationService);
  private readonly trackingService = inject(TrackingService);
  protected readonly questionnairesByRoomId = inject(QuestionnairesByRoomIdGql);
  private readonly contentResultsService = inject(ContentResultsService);

  readonly questionnaireId = input<string>();

  readonly questionnairesResult = toSignal(
    toObservable(this.roomId).pipe(
      switchMap((roomId) => {
        return this.questionnairesByRoomId.watch({
          variables: { roomId },
        }).valueChanges;
      })
    )
  );

  readonly questionnaires = computed(() => {
    return (
      this.questionnairesResult()?.data?.questionnairesByRoomId ?? []
    ).filter((n): n is QuestionnaireSummaryFragment => !!n);
  });

  protected readonly loadingQuestionnaires = computed(
    () => this.questionnairesResult()?.loading ?? true
  );

  readonly activeQuestionnaire = model(this.questionnaires()[0] ?? undefined);

  private readonly contentResultsVisible = computed(() =>
    this.contentResultsService.resultsVisible()
  );
  private readonly contentCorrectResultsVisible = computed(() =>
    this.contentResultsService.correctResultsVisible()
  );

  moreMenu = viewChild(ContentPresentationMenuComponent);
  activeFeature = output<string | undefined>();

  isLoading = true;
  destroyed$ = new Subject<void>();
  destroyed = false;
  inFullscreen = false;
  barItems: KeyNavBarItem[] = [];
  surveyStarted = false;
  contentStepState = PresentationStepPosition.START;
  commentStepState = PresentationStepPosition.START;
  menuOpen = false;
  currentCommentZoom = 100;
  currentCommentSort?: CommentSort;
  currentCommentFilterFlags: CommentFilter[] = [];
  currentCommentPeriod?: number;
  currentCommentTags: Tag[] = [];
  commentSortTypes = [CommentSort.TIME, CommentSort.VOTEDESC];
  contentIndex = 0;
  content?: Content;

  features: NavBarItem[] = [
    new NavBarItem(RoutingFeature.COMMENTS, 'question_answer'),
    new NavBarItem(RoutingFeature.CONTENTS, 'equalizer'),
    new NavBarItem(RoutingFeature.FEEDBACK, 'thumbs_up_down'),
  ];
  groupItems: KeyNavBarItem[] = [
    new KeyNavBarItem('results', 'insert_chart', '', ' '),
  ];
  surveyItems: KeyNavBarItem[] = [
    new KeyNavBarItem('start', 'play_arrow', '', ' '),
    new KeyNavBarItem('change-type', 'swap_horiz', '', 'c'),
  ];
  arrowItems: KeyNavBarItem[] = [
    new KeyNavBarItem('left', 'arrow_back', '', 'ArrowLeft', true),
    new KeyNavBarItem('right', 'arrow_forward', '', 'ArrowRight'),
  ];
  generalItems: KeyNavBarItem[] = [
    new KeyNavBarItem('share', 'qr_code', '', 'q'),
    new KeyNavBarItem('fullscreen', 'open_in_full', '', 'f'),
    new KeyNavBarItem('exit', 'close', '', 'Escape'),
  ];
  zoomItems: KeyNavBarItem[] = [
    new KeyNavBarItem('zoom-in', 'zoom_in', '', '+'),
    new KeyNavBarItem('zoom-out', 'zoom_out', '', '-'),
  ];
  moreItem: KeyNavBarItem = new KeyNavBarItem('more', 'more_horiz', '', 'm');

  cursorTimer?: ReturnType<typeof setTimeout>;
  cursorVisible = true;
  barVisible = false;
  buttonHovered = false;
  HotkeyAction = HotkeyAction;

  private hotkeyRefs: symbol[] = [];
  private initialised = false;

  activeWordcloudVisualiation =
    this.contentResultsService.activeWordcloudVisualization;

  showShareOverlay = false;

  buttons: ToggleButtonOption[] = [
    {
      id: VisualizationType.WORDCLOUD,
      icon: 'cloud',
      tooltip: this.translateService.translate(
        'creator.statistic.show-wordcloud'
      ),
    },
    {
      id: VisualizationType.GRID,
      icon: 'grid_view',
      tooltip: this.translateService.translate(
        'creator.statistic.show-wordcloud-list'
      ),
    },
  ];

  ContentType = ContentType;

  constructor() {
    super();
    this.afterMouseMoved();
    this.currentCommentPeriod =
      this.globalStorageService.getItem(STORAGE_KEYS.COMMENT_TIME_FILTER) ||
      undefined;
    this.showShareOverlay = this.globalStorageService.getItem(
      STORAGE_KEYS.SHOW_SHARE_OVERLAY
    );
    effect(() => {
      const questionnaireId = this.questionnaireId();
      if (this.loadingQuestionnaires()) {
        return;
      }
      if (!this.initialised) {
        this.initialised = true;
        untracked(() => this.afterInit());
      }
      const questionnaires = this.questionnaires();
      if (questionnaires.length === 0) {
        this.removeContentFeatureItem();
      } else {
        const first = questionnaires[0];
        this.activeQuestionnaire.set(
          questionnaireId
            ? (questionnaires.find((q) => q.id === questionnaireId) ?? first)
            : first
        );
      }
    });
    effect(() => {
      if (this.contentResultsVisible()) {
        this.determineResultsItemHighlighted();
      }
      if (this.contentCorrectResultsVisible()) {
        this.determineContentControlCorrect();
      }
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
    this.destroyed = true;
    this.showCursor();
    clearTimeout(this.cursorTimer);
    this.hotkeyRefs.forEach((h) => this.hotkeyService.unregisterHotkey(h));
  }

  sendControlBarState() {
    this.eventService.broadcast('ControlBarVisible', this.barVisible);
  }

  isActiveFeature(feature: string): boolean {
    const featureIndex = this.barItems.map((b) => b.name).indexOf(feature);
    if (featureIndex === -1) {
      return false;
    }
    return featureIndex === this.currentRouteIndex;
  }

  afterInit() {
    const lastSort = this.globalStorageService.getItem(
      STORAGE_KEYS.COMMENT_SORT
    );
    this.subscribeFullscreen();
    this.registerHotkeys();
    this.currentCommentSort =
      lastSort && lastSort !== CommentSort.VOTEASC
        ? lastSort
        : CommentSort.TIME;
    this.setSurveyState(!!this.roomSettings()?.surveyEnabled);
    // if (this.groupName && this.contentGroups.length > 0) {
    //   this.setContentGroupState();
    // }
    this.subscribeToStates();
    this.subscribeToEvents();
    setTimeout(() => {
      this.sendControlBarState();
    }, 300);
    this.isLoading = false;
    this.subscribeToMouseEvents();
  }

  private subscribeToMouseEvents() {
    fromEvent<MouseEvent>(document, 'mousemove')
      .pipe(
        takeUntil(this.destroyed$),
        throttleTime(20),
        map((event) => {
          // Check if a button is hovered via cursor style
          const elementAtCursor = document.elementFromPoint(
            event.clientX,
            event.clientY
          );
          return elementAtCursor
            ? window.getComputedStyle(elementAtCursor).cursor === 'pointer'
            : false;
        })
      )
      .subscribe((isButtonHovered) => {
        this.buttonHovered = isButtonHovered;
        this.afterMouseMoved();
      });
  }

  hideCursor() {
    this.cursorTimer = undefined;
    document.body.style.cursor = 'none';
    this.cursorVisible = false;
    this.hideBar();
  }

  showCursor() {
    document.body.style.cursor = 'default';
    this.cursorVisible = true;
    this.showBar();
  }

  afterMouseMoved() {
    if (!this.cursorVisible) {
      this.showCursor();
    }
    if (!this.barVisible) {
      this.showBar();
    }
    if (this.cursorTimer) {
      clearTimeout(this.cursorTimer);
    }
    if (!this.buttonHovered) {
      this.cursorTimer = setTimeout(() => {
        this.hideCursor();
      }, 3000);
    }
  }

  subscribeToStates() {
    this.presentationService
      .getContentState()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((state) => {
        this.evaluateContentState(state);
      });
    this.presentationService
      .getCommentState()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((state) => {
        this.evaluateCommentState(state);
      });
    this.presentationService
      .getLeaderboardDisplayed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((leaderboardDisplayed) => {
        const leaderboardItemIndex = this.getIndexOfGroupItem('leaderboard');
        if (leaderboardItemIndex > -1) {
          this.groupItems[leaderboardItemIndex].highlighted =
            leaderboardDisplayed;
          this.groupItems.forEach((g) => {
            if (g.name !== 'leaderboard') {
              g.disabled = leaderboardDisplayed;
            }
          });
        }
      });
  }

  subscribeToEvents() {
    this.barItems.map((b) => (b.key = this.getFeatureKey(b.name)));
    this.presentationService
      .getFeedbackStarted()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((started) => {
        this.setSurveyState(started);
      });
    this.presentationService
      .getCommentZoomChanges()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((zoom) => {
        this.currentCommentZoom = Math.round(zoom);
        this.announceService.announce(
          'creator.presentation.a11y-comment-zoom-changed',
          { zoom: this.currentCommentZoom }
        );
      });
    // this.presentationService
    //   .getContentGroupChanges()
    //   .pipe(takeUntil(this.destroyed$))
    //   .subscribe((group) => {
    //     this.group = group;
    //   });
  }

  evaluateContentState(state?: ContentPresentationState) {
    if (state) {
      this.contentStepState = state.position;
      this.contentIndex = state.index;
      this.content = state.content;
      this.globalStorageService.setItem(
        STORAGE_KEYS.LAST_INDEX,
        this.contentIndex
      );
      const questionnaire = this.activeQuestionnaire();
      if (
        questionnaire &&
        questionnaire.contentCount &&
        questionnaire.contentCount > 1
      ) {
        this.setArrowsState(this.contentStepState);
      } else {
        this.setArrowItemsState(true, true);
      }
    }
    this.groupItems.forEach((item) => {
      item.disabled = false;
      item.highlighted = false;
    });
    this.determineGroupControls();
  }

  evaluateCommentState(state?: CommentPresentationState) {
    if (state) {
      this.commentStepState = state.stepState;
      if (this.isActiveFeature(RoutingFeature.COMMENTS)) {
        this.setArrowsState(this.commentStepState);
      }
    }
  }

  removeProtocolFromString(url: string): string {
    return url.replace(/^https?:\/\//, '');
  }

  setSurveyState(started: boolean) {
    this.surveyStarted = started;
    this.surveyItems[0].name = this.surveyStarted ? 'stop' : 'start';
    this.surveyItems[0].icon = this.surveyStarted ? 'stop' : 'play_arrow';
    this.surveyItems[1].disabled = this.surveyStarted;
  }

  setContentGroupState() {
    // const group = this.contentGroups.find((g) => g.name === this.groupName);
    // if (group) {
    //   this.group = group;
    // }
    // if (
    //   this.isActiveFeature(RoutingFeature.CONTENTS) &&
    //   this.group &&
    //   this.isGroupLocked(this.group)
    // ) {
    //   this.publishContentGroup(this.group);
    // }
  }

  setArrowsState(state: PresentationStepPosition) {
    switch (state) {
      case PresentationStepPosition.START:
        this.setArrowItemsState(true, false);
        break;
      case PresentationStepPosition.END:
        this.setArrowItemsState(false, true);
        break;
      default:
        this.setArrowItemsState(false, false);
    }
  }

  setArrowItemsState(leftDisabled: boolean, rightDisabled: boolean) {
    this.arrowItems[0].disabled = leftDisabled;
    this.arrowItems[1].disabled = rightDisabled;
  }

  getFeatureKey(name: string): string {
    return (this.features.map((f) => f.name).indexOf(name) + 1).toString();
  }

  updateFeature(feature?: string) {
    if (
      !feature ||
      this.currentRouteIndex !==
        this.barItems.map((i) => i.name).indexOf(feature)
    ) {
      this.getCurrentRouteIndex(feature);
      this.activeFeature.emit(feature);
      if (feature === RoutingFeature.CONTENTS) {
        this.setArrowsState(this.contentStepState);
      } else if (feature === RoutingFeature.COMMENTS) {
        this.setArrowsState(this.commentStepState);
      }
      setTimeout(() => {
        this.sendControlBarState();
      }, 300);
    }
  }

  getCurrentRouteIndex(feature?: string) {
    let index;
    if (feature) {
      index = this.barItems.map((s) => s.name).indexOf(feature);
    } else {
      const matchingRoutes = this.barItems.filter((s) =>
        this.isRouteMatching(s)
      );
      if (matchingRoutes.length > 0) {
        index = this.barItems.map((s) => s.url).indexOf(matchingRoutes[0].url);
      }
    }
    this.currentRouteIndex = index ?? -1;
  }

  subscribeFullscreen() {
    document.addEventListener('fullscreenchange', () => {
      this.inFullscreen = !!document.fullscreenElement;
    });
  }

  toggleFullscreen() {
    if (this.inFullscreen) {
      this.exitFullscreen();
    } else {
      this.requestFullscreen();
    }
  }

  requestFullscreen() {
    document.documentElement.requestFullscreen();
    this.announceService.announce(
      'creator.presentation.a11y-entered-fullscreen'
    );
  }

  exitFullscreen() {
    document.exitFullscreen();
    this.announceService.announce(
      'creator.presentation.a11y-leaved-fullscreen'
    );
  }

  exitPresentation() {
    if (this.dialogService.dialog.openDialogs.length === 0) {
      if (this.inFullscreen) {
        this.exitFullscreen();
      }
      this.router.navigateByUrl(`edit/${this.room().shortId}`);
    }
  }

  private determineGroupControls(): void {
    this.determineResultsItemHighlighted();
    this.determineContentControlCorrect();
    this.determineContentControlLeaderboard();
    if (!this.content || this.content.formatData.format === ContentType.Slide) {
      this.groupItems.forEach((g) => (g.disabled = true));
    }
  }

  private determineContentControlCorrect() {
    const correctItemIndex = this.getIndexOfGroupItem('correct');
    if (
      this.activeQuestionnaire() &&
      ![QuestionnaireType.Survey, QuestionnaireType.Flashcards].includes(
        this.activeQuestionnaire().type
      )
    ) {
      if (this.getIndexOfGroupItem('correct') === -1) {
        this.groupItems.push(
          new KeyNavBarItem('correct', 'check_circle', '', 'c')
        );
      } else {
        if (this.content && !this.content.hasCorrectAnswer) {
          this.groupItems[correctItemIndex].disabled = true;
        } else {
          this.groupItems[correctItemIndex].disabled = false;
        }
      }
      this.determineCorrectItemHighlighted();
    } else {
      if (correctItemIndex > -1) {
        this.groupItems.splice(correctItemIndex, 1);
      }
    }
  }

  private determineContentControlLeaderboard() {
    // if (this.activeQuestionnaire()?.leaderboardEnabled) {
    //   if (this.getIndexOfGroupItem('leaderboard') === -1) {
    //     this.groupItems.push(
    //       new KeyNavBarItem('leaderboard', 'emoji_events', '', 'l')
    //     );
    //   }
    // } else {
    //   if (this.getIndexOfGroupItem('leaderboard') > -1) {
    //     this.groupItems.splice(-1, 1);
    //   }
    // }
  }

  private determineResultsItemHighlighted() {
    setTimeout(() => {
      const resultsItemIndex = this.getIndexOfGroupItem('results');
      if (resultsItemIndex > -1) {
        this.groupItems[resultsItemIndex].highlighted =
          this.contentResultsVisible();
      }
    });
  }

  private determineCorrectItemHighlighted() {
    setTimeout(() => {
      const correctResultsItemIndex = this.getIndexOfGroupItem('correct');
      if (correctResultsItemIndex > -1) {
        this.groupItems[correctResultsItemIndex].highlighted =
          this.contentCorrectResultsVisible();
      }
    });
  }

  private getIndexOfGroupItem(name: string): number {
    return this.groupItems.map((i) => i.name).indexOf(name);
  }

  changeGroup(questionnaire: QuestionnaireSummaryFragment) {
    // Presenting an unpublished questionnaire offers to publish it.
    if (this.activeQuestionnaire()?.id !== questionnaire.id) {
      this.activeQuestionnaire.set(questionnaire);
    }
  }

  showBar() {
    this.barVisible = true;
    this.sendControlBarState();
  }

  hideBar() {
    if (!this.menuOpen) {
      this.barVisible = false;
      this.sendControlBarState();
    }
  }

  menuClosed() {
    this.menuOpen = false;
    this.hideBar();
  }

  changeCommentSort(sort: CommentSort) {
    this.currentCommentSort = sort;
    this.presentationService.updateCommentSort(this.currentCommentSort);
  }

  addCommentFilter(filter: CommentFilter) {
    this.currentCommentFilterFlags.push(filter);
    this.presentationService.updateCommentFilter(filter);
  }

  removeCommentFilter(filter: CommentFilter) {
    this.currentCommentFilterFlags = this.currentCommentFilterFlags.filter(
      (f) => f !== filter
    );
    this.presentationService.updateCommentFilterRemoved(filter);
  }

  changeCommentTag(tag: Tag) {
    this.currentCommentTags.push(tag);
    this.presentationService.updateCommentCategory(tag.id);
  }

  changeCommentPeriod(period?: number) {
    this.currentCommentPeriod = period;
    this.presentationService.updateCommentPeriod(period);
  }

  private registerHotkeys() {
    const actions: Record<string, () => void> = {
      share: () => {
        this.toggleShareOverview();
        this.trackingService.addEvent(
          EventCategory.UI_INTERACTION,
          'Toggle share overlay',
          this.showShareOverlay ? 'on' : 'off'
        );
      },
      fullscreen: () => this.toggleFullscreen(),
      exit: () => this.exitPresentation(),
    };
    this.generalItems.forEach((item) =>
      this.translateService
        .selectTranslate('creator.control-bar.' + item.name)
        .pipe(
          take(1),
          map(
            (t) =>
              ({
                key: item.key,
                action: actions[item.name],
                actionTitle: t,
              }) as Hotkey
          )
        )
        .subscribe((h: Hotkey) =>
          this.hotkeyService.registerHotkey(h, this.hotkeyRefs)
        )
    );
  }

  toggleWordcloudVisualiation() {
    this.contentResultsService.setActiveWordcloudVizualization(
      this.activeWordcloudVisualiation() === VisualizationType.WORDCLOUD
        ? VisualizationType.GRID
        : VisualizationType.WORDCLOUD
    );
  }

  toggleShareOverview() {
    this.showShareOverlay = !this.showShareOverlay;
    this.globalStorageService.setItem(
      STORAGE_KEYS.SHOW_SHARE_OVERLAY,
      this.showShareOverlay
    );
  }
}
