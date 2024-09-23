import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  NavBarComponent,
  NavBarItem,
} from '@app/standalone/nav-bar/nav-bar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutingService } from '@app/core/services/util/routing.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { FeedbackService } from '@app/core/services/http/feedback.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { EventService } from '@app/core/services/util/event.service';
import { ContentGroup, GroupType } from '@app/core/models/content-group';
import { map, take, takeUntil } from 'rxjs/operators';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { Subject } from 'rxjs';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { Hotkey, HotkeyService } from '@app/core/services/util/hotkey.service';
import { HotkeyAction } from '@app/core/directives/hotkey.directive';
import { TranslocoService } from '@jsverse/transloco';
import { RoutingFeature } from '@app/core/models/routing-feature.enum';
import { Content } from '@app/core/models/content';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { RoomService } from '@app/core/services/http/room.service';
import { CommentSettingsService } from '@app/core/services/http/comment-settings.service';
import { CommentSort } from '@app/core/models/comment-sort.enum';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { ContentPresentationState } from '@app/core/models/events/content-presentation-state';
import { PresentationStepPosition } from '@app/core/models/events/presentation-step-position.enum';
import { CommentPresentationState } from '@app/core/models/events/comment-presentation-state';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { ContentPresentationMenuComponent } from '@app/standalone/content-presentation-menu/content-presentation-menu.component';

export class KeyNavBarItem extends NavBarItem {
  key: string;
  displayKey: string;
  disabled: boolean;

  constructor(
    name: string,
    icon: string,
    url: string,
    key: string,
    disabled = false
  ) {
    super(name, icon, url, false);
    const keyInfo = HotkeyService.getKeyDisplayInfo(key);
    this.key = key;
    this.displayKey = keyInfo.translateKeyName
      ? 'creator.control-bar.' + keyInfo.keyName
      : keyInfo.keySymbol;
    this.disabled = disabled;
  }
}

@Component({
  selector: 'app-control-bar',
  templateUrl: './control-bar.component.html',
  styleUrls: ['./control-bar.component.scss'],
})
export class ControlBarComponent
  extends NavBarComponent
  implements OnInit, OnDestroy
{
  @ViewChild(ContentPresentationMenuComponent)
  moreMenuComponent!: ContentPresentationMenuComponent;
  @Input({ required: true }) shortId!: string;
  @Output() activeFeature: EventEmitter<string> = new EventEmitter<string>();
  @Output() activeGroup: EventEmitter<string> = new EventEmitter<string>();

  isLoading = true;
  destroyed$ = new Subject<void>();
  destroyed = false;
  inFullscreen = false;
  barItems: KeyNavBarItem[] = [];
  surveyStarted = false;
  contentStepState = PresentationStepPosition.START;
  commentStepState = PresentationStepPosition.START;
  menuOpen = false;
  joinUrl?: string;
  currentCommentZoom = 100;
  currentCommentSort?: CommentSort;
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
  barTimer?: ReturnType<typeof setTimeout>;
  cursorVisible = true;
  barVisible = false;
  HotkeyAction = HotkeyAction;

  private hotkeyRefs: symbol[] = [];

  constructor(
    protected router: Router,
    protected routingService: RoutingService,
    protected route: ActivatedRoute,
    protected globalStorageService: GlobalStorageService,
    protected roomStatsService: RoomStatsService,
    protected feedbackService: FeedbackService,
    protected contentGroupService: ContentGroupService,
    protected eventService: EventService,
    protected apiConfigService: ApiConfigService,
    protected roomService: RoomService,
    protected commentSettingsService: CommentSettingsService,
    protected focusModeService: FocusModeService,
    private announceService: AnnounceService,
    private hotkeyService: HotkeyService,
    private translateService: TranslocoService,
    private dialogService: DialogService,
    private notificationService: NotificationService,
    private presentationService: PresentationService
  ) {
    super(
      router,
      routingService,
      route,
      globalStorageService,
      roomStatsService,
      feedbackService,
      contentGroupService,
      eventService,
      roomService,
      commentSettingsService,
      focusModeService
    );
    this.showBar();
    this.setBarTimer(3000);
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
    return (
      this.barItems.map((b) => b.name).indexOf(feature) ===
      this.currentRouteIndex
    );
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
    this.route.data.subscribe((data) => {
      this.surveyStarted = !data.room.settings.feedbackLocked;
      this.setSurveyState();
      if (this.groupName && this.contentGroups.length > 0) {
        const group = this.contentGroups.find((g) => g.name === this.groupName);
        if (group) {
          this.group = group;
          this.determineGroupControls();
        }
        if (
          this.isActiveFeature(RoutingFeature.CONTENTS) &&
          this.group &&
          this.isGroupLocked(this.group)
        ) {
          this.publishContentGroup(this.group);
        }
      }
    });
    this.subscribeToStates();
    this.subscribeToEvents();
    setTimeout(() => {
      this.sendControlBarState();
    }, 300);
    this.apiConfigService
      .getApiConfig$()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((config) => {
        if (config.ui.links?.join) {
          this.joinUrl =
            this.removeProtocolFromString(config.ui.links.join.url) +
            this.shortId;
        }
      });
    this.isLoading = false;
    document.onmousemove = () => {
      if (!this.destroyed) {
        this.afterMouseMoved();
      }
    };
  }

  hideCursor() {
    this.cursorTimer = undefined;
    document.body.style.cursor = 'none';
    this.cursorVisible = false;
  }

  showCursor() {
    document.body.style.cursor = 'default';
    this.cursorVisible = true;
  }

  afterMouseMoved() {
    if (!this.cursorVisible) {
      this.showCursor();
    }
    if (this.cursorTimer) {
      clearTimeout(this.cursorTimer);
    }
    this.cursorTimer = setTimeout(() => {
      this.hideCursor();
    }, 3000);
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
  }

  subscribeToEvents() {
    this.barItems.map((b) => (b.key = this.getFeatureKey(b.name)));
    this.presentationService
      .getFeedbackStarted()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((started) => {
        this.surveyStarted = started;
        this.setSurveyState();
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
    this.presentationService
      .getContentGroupChanges()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((group) => {
        this.group = group;
      });
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
      this.setArrowsState(this.contentStepState);
    }
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

  setSurveyState() {
    this.surveyItems[0].name = this.surveyStarted ? 'stop' : 'start';
    this.surveyItems[0].icon = this.surveyStarted ? 'stop' : 'play_arrow';
    this.surveyItems[1].disabled = this.surveyStarted;
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
        if (this.group && this.isGroupLocked(this.group)) {
          this.publishContentGroup(this.group);
        }
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

  getBaseUrl(): string {
    return `/present/${this.shortId}/`;
  }

  getFeatureUrl(feature: string): string {
    return this.groupName && feature === RoutingFeature.CONTENTS
      ? feature + this.getGroupUrl()
      : feature;
  }

  navToUrl(index: number) {
    const item = this.barItems[index];
    const url = item.url;
    if (url) {
      this.router.navigateByUrl(url);
    }
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
      this.router.navigateByUrl(`edit/${this.shortId}`);
    }
  }

  isGroupLocked(group: ContentGroup): boolean {
    return !group.published;
  }

  private determineGroupControls(): void {
    if (
      this.group &&
      ![GroupType.SURVEY, GroupType.FLASHCARDS].includes(this.group.groupType)
    ) {
      if (this.getIndexOfGroupItem('correct') === -1) {
        this.groupItems.push(
          new KeyNavBarItem('correct', 'check_circle', '', 'c')
        );
      }
    } else {
      const correctItemIndex = this.getIndexOfGroupItem('correct');
      if (correctItemIndex > -1) {
        this.groupItems.splice(correctItemIndex, 1);
      }
    }
    if (this.group?.leaderboardEnabled) {
      if (this.getIndexOfGroupItem('leaderboard') === -1) {
        this.groupItems.push(
          new KeyNavBarItem('leaderboard', 'emoji_events', '', 'l')
        );
      }
    } else {
      if (this.getIndexOfGroupItem('leaderboard') > -1) {
        this.groupItems.splice(-1, 1);
      }
    }
  }

  private getIndexOfGroupItem(name: string): number {
    return this.groupItems.map((i) => i.name).indexOf(name);
  }

  changeGroup(contentGroup: ContentGroup) {
    if (this.group?.id !== contentGroup.id) {
      if (!this.isGroupLocked(contentGroup)) {
        this.updateGroup(contentGroup);
      } else {
        this.publishContentGroup(contentGroup);
      }
    }
  }

  updateGroup(contentGroup: ContentGroup) {
    this.setGroup(contentGroup);
    this.determineGroupControls();
    this.activeGroup.emit(this.groupName);
  }

  publishContentGroup(contentGroup: ContentGroup) {
    const dialogRef = this.dialogService.openPublishGroupDialog(contentGroup);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const msg = this.translateService.translate(
          'creator.content.group-published'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.SUCCESS
        );
        contentGroup.publishingMode = result;
        this.updateGroup(contentGroup);
      }
    });
  }

  toggleBarVisibility(visible: boolean) {
    if (!this.menuOpen) {
      if (visible) {
        if (this.barTimer) {
          clearTimeout(this.barTimer);
        } else {
          this.showBar();
        }
      } else {
        this.setBarTimer(1000);
      }
    }
  }

  showBar() {
    this.barVisible = true;
    this.sendControlBarState();
  }

  hideBar() {
    this.barTimer = undefined;
    this.barVisible = false;
    this.sendControlBarState();
  }

  setBarTimer(millis: number) {
    this.barTimer = setTimeout(() => {
      this.hideBar();
    }, millis);
  }

  menuClosed() {
    this.menuOpen = false;
    this.toggleBarVisibility(false);
  }

  changeCommentSort(sort: CommentSort) {
    this.currentCommentSort = sort;
    this.presentationService.updateCommentSort(this.currentCommentSort);
  }

  private registerHotkeys() {
    const actions: Record<string, () => void> = {
      share: () => this.updateFeature(undefined),
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
}
