import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NavBarComponent, NavBarItem } from '../../../shared/bars/nav-bar/nav-bar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutingService } from '../../../../services/util/routing.service';
import { GlobalStorageService, STORAGE_KEYS } from '../../../../services/util/global-storage.service';
import { RoomStatsService } from '../../../../services/http/room-stats.service';
import { FeedbackService } from '../../../../services/http/feedback.service';
import { ContentGroupService } from '../../../../services/http/content-group.service';
import { EventService } from '../../../../services/util/event.service';
import { BarItem } from '../../../shared/bars/bar-base';
import { ContentGroup } from '../../../../models/content-group';
import { map, takeUntil } from 'rxjs/operators';
import { ApiConfigService } from '../../../../services/http/api-config.service';
import { Subject } from 'rxjs';
import { CommentPresentationState, Sort } from '../../../shared/comment-list/comment-list.component';
import { AnnounceService } from '../../../../services/util/announce.service';
import { Hotkey, HotkeyService } from '../../../../services/util/hotkey.service';
import { HotkeyAction } from '../../../../directives/hotkey.directive';
import { TranslateService } from '@ngx-translate/core';
import { RemoteMessage } from '../../../../models/events/remote/remote-message.enum';
import { Features } from '../../../../models/features.enum';
import { ContentService } from '../../../../services/http/content.service';
import { Content } from '../../../../models/content';
import { DialogService } from '../../../../services/util/dialog.service';
import { ContentMessages } from '../../../../models/events/content-messages.enum';
import { ContentType } from '../../../../models/content-type.enum';
import { AdvancedSnackBarTypes, NotificationService } from '../../../../services/util/notification.service';
import { RoomService } from '../../../../services/http/room.service';

export class KeyNavBarItem extends NavBarItem {
  key: string;
  displayKey: string;
  disabled: boolean;

  constructor(name: string, icon: string, url: string, key: string, disabled = false) {
    super(name, icon, url, false);
    const keyInfo = HotkeyService.getKeyDisplayInfo(key);
    this.key = key;
    this.displayKey = keyInfo.translateKeyName ? 'control-bar.' + keyInfo.keyName : keyInfo.keySymbol;
    this.disabled = disabled;
  }
}

@Component({
  selector: 'app-control-bar',
  templateUrl: './control-bar.component.html',
  styleUrls: ['./control-bar.component.scss']
})
export class ControlBarComponent extends NavBarComponent implements OnInit, OnDestroy {

  @Input() shortId: string;
  @Output() activeFeature: EventEmitter<string> = new EventEmitter<string>();
  @Output() activeGroup: EventEmitter<string> = new EventEmitter<string>();

  isLoading = true;
  destroyed$ = new Subject<void>();
  destroyed = false;
  inFullscreen = false;
  barItems: KeyNavBarItem[] = [];
  surveyStarted = false;
  contentStepState = 'START';
  commentStepState = 'START';
  menuOpen = false;
  joinUrl: string;
  currentCommentZoom = 100;
  currentCommentSort: Sort;
  commentSortTypes = [Sort.TIME, Sort.VOTEDESC];
  isCurrentContentPublished = false;
  contentIndex = 0;
  content: Content;
  contentLoaded = false;
  resetAnswerEvent: Subject<string> = new Subject<string>();
  notificationMessage: string;
  notificationIcon: string;
  showNotification = false;

  features: BarItem[] = [
    new BarItem(Features.COMMENTS, 'question_answer'),
    new BarItem(Features.CONTENTS, 'equalizer'),
    new BarItem(Features.FEEDBACK, 'thumbs_up_down')
  ];
  groupItems: KeyNavBarItem[] = [
    new KeyNavBarItem('results', 'insert_chart', '', ' '),
    new KeyNavBarItem('correct', 'check_circle', '', 'c'),
    new KeyNavBarItem('lock', 'lock', '', 'l'),
  ];
  surveyItems: KeyNavBarItem[] = [
    new KeyNavBarItem('start', 'play_arrow', '', ' '),
    new KeyNavBarItem('change-type', 'swap_horiz', '', 'c')
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
    new KeyNavBarItem('zoom-out', 'zoom_out', '', '-')
  ];
  moreItem: KeyNavBarItem = new KeyNavBarItem('more', 'more_horiz', '', 'm');

  cursorTimer;
  barTimer;
  cursorVisible = true;
  barVisible = false;
  HotkeyAction = HotkeyAction;

  private hotkeyRefs: Symbol[] = [];

  multipleRounds = false;
  contentRounds = new Map<string, number>();
  ContentType: typeof ContentType = ContentType;

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
    private announceService: AnnounceService,
    private hotkeyService: HotkeyService,
    private translateService: TranslateService,
    private contentService: ContentService,
    private dialogService: DialogService,
    private notificationService: NotificationService
  ) {
    super(router, routingService, route, globalStorageService,
      roomStatsService, feedbackService, contentGroupService, eventService, roomService);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
    this.destroyed = true;
    this.showCursor();
    clearTimeout(this.cursorTimer);
    this.hotkeyRefs.forEach(h => this.hotkeyService.unregisterHotkey(h));
  }

  sendControlBarState() {
    this.eventService.broadcast('ControlBarVisible', this.barVisible);
  }

  isActiveFeature(feature: string): boolean {
    return this.barItems.map(b => b.name).indexOf(feature) === this.currentRouteIndex;
  }

  beforeInit() {
    this.subscribeFullscreen();
    this.registerHotkeys();
  }

  afterInit() {
    const lastSort = this.globalStorageService.getItem(STORAGE_KEYS.COMMENT_SORT);
    this.currentCommentSort = lastSort && lastSort !== Sort.VOTEASC ? lastSort : Sort.TIME;
    this.route.data.subscribe(data => {
      this.surveyStarted = !data.room.settings.feedbackLocked;
      this.setSurveyState();
      if (this.groupName && this.contentGroups.length > 0) {
        this.group = this.contentGroups.find(g => g.name === this.groupName);
        this.checkIfContentLocked();
        if (this.isActiveFeature(Features.CONTENTS) && !this.group.published) {
          this.publishContentGroup()
        }
      }
    });
    this.subscribeToEvents();
    setTimeout(() => {
      this.sendControlBarState();
    }, 300);
    this.apiConfigService.getApiConfig$().pipe(takeUntil(this.destroyed$)).subscribe(config => {
      if (config.ui.links?.join) {
        this.joinUrl = this.removeProtocolFromString(config.ui.links.join.url) + this.shortId;
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
    this.cursorTimer = null;
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

  subscribeToEvents() {
    this.barItems.map(b => b.key = this.getFeatureKey(b.name));
    this.eventService.on(RemoteMessage.SURVEY_STATE_CHANGED).subscribe(state => {
      this.surveyStarted = state === 'started';
      this.setSurveyState();
    });
    this.eventService.on<any>(ContentMessages.STEP_STATE_CHANGED).subscribe(state => {
      this.contentStepState = state.position;
      this.contentIndex = state.index;
      this.content = state.content;
      this.contentLoaded = false;
      if (!this.contentRounds.get(this.content.id)) {
        this.contentRounds.set(this.content.id, this.content.state.round - 1);
      }
      setTimeout(() => {
        this.contentLoaded = true;
      },0);
      this.globalStorageService.setItem(STORAGE_KEYS.LAST_INDEX, this.contentIndex);
      this.setArrowsState(this.contentStepState);
      this.checkIfContentLocked();
    });
    this.eventService.on<CommentPresentationState>(RemoteMessage.UPDATE_COMMENT_STATE).subscribe(state => {
      this.commentStepState = state.stepState;
      if (this.isActiveFeature(Features.COMMENTS)) {
        this.setArrowsState(this.commentStepState);
      }
    });
    this.eventService.on<number>('CommentZoomChanged').subscribe(zoom => {
      this.currentCommentZoom = Math.round(zoom);
      this.announceService.announce('presentation.a11y-comment-zoom-changed', { zoom: this.currentCommentZoom })
    });
    this.eventService.on<ContentGroup>('ContentGroupStateChanged').subscribe(updatedContentGroup => {
      this.group = updatedContentGroup;
      this.checkIfContentLocked();
    });
    this.eventService.on<string>(RemoteMessage.CONTENT_GROUP_UPDATED).subscribe(contentGroupId => {
      this.changeGroup(this.contentGroups.filter(cg => cg.id === contentGroupId)[0]);
    });
    this.eventService.on<string>(RemoteMessage.CHANGE_FEATURE_ROUTE).subscribe(feature => this.updateFeature(feature));
    this.eventService.on<boolean>(ContentMessages.MULTIPLE_ROUNDS).subscribe(multipleRounds => {
      this.multipleRounds = multipleRounds;
    })
  }

  checkIfContentLocked() {
    if (this.contentIndex !== undefined) {
      this.isCurrentContentPublished = this.contentGroupService.isIndexPublished(this.group.firstPublishedIndex, this.group.lastPublishedIndex, this.contentIndex);
      this.groupItems[2].icon = this.isCurrentContentPublished ? 'lock' : 'lock_open';
      this.groupItems[2].name = this.isCurrentContentPublished ? 'lock' : 'publish';
      if (!this.isCurrentContentPublished) {
        if (!this.showNotification) {
          this.notificationMessage = 'control-bar.content-locked';
          this.notificationIcon = 'lock';
          this.showNotification = true;
          this.announceService.announce('control-bar.content-locked');
        }
      } else if (this.showNotification) {
        this.showNotification = false;
        this.announceService.announce('control-bar.content-published')
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

  setArrowsState(state: string) {
    switch (state) {
      case 'START':
        this.setArrowItemsState(true, false);
        break;
      case 'END':
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
    return (this.features.map(f => f.name).indexOf(name) + 1).toString();
  }

  updateFeature(feature: string) {
    if (this.currentRouteIndex !== this.barItems.map(i => i.name).indexOf(feature)) {
      if (feature) {
        this.getCurrentRouteIndex(feature);
      } else {
        this.currentRouteIndex = undefined;
      }
      this.activeFeature.emit(feature);
      if (feature === Features.CONTENTS) {
        this.setArrowsState(this.contentStepState);
        if (!this.group.published) {
          this.publishContentGroup();
        }
      } else if (feature === Features.COMMENTS) {
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
      index = this.barItems.map(s => s.name).indexOf(feature);
    } else {
      const matchingRoutes = this.barItems.filter(s => this.isRouteMatching(s));
      if (matchingRoutes.length > 0) {
        index = this.barItems.map(s => s.url).indexOf(matchingRoutes[0].url);
      }
    }
    this.currentRouteIndex = index;
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
    return this.groupName && feature === Features.CONTENTS ? feature + this.getGroupUrl() : feature;
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
      this.requestFullscreen()
    }
  }

  requestFullscreen() {
    document.documentElement.requestFullscreen();
    this.announceService.announce('presentation.a11y-entered-fullscreen');
  }

  exitFullscreen() {
    document.exitFullscreen();
    this.announceService.announce('presentation.a11y-leaved-fullscreen');
  }

  exitPresentation() {
    if (this.dialogService.dialog.openDialogs.length === 0) {
      if (this.inFullscreen) {
        this.exitFullscreen();
      }
      this.router.navigateByUrl(`edit/${this.shortId}`);
    }
  }

  changeGroup(contentGroup: ContentGroup) {
    if (this.group.id !== contentGroup.id) {
      if (contentGroup.published) {
        this.updateGroup(contentGroup);
      } else {
        this.publishContentGroup(contentGroup);
      }
    }
  }

  updateGroup(contentGroup: ContentGroup) {
    this.setGroup(contentGroup);
    this.activeGroup.emit(this.groupName);
  }

  publishContentGroup(contentGroup: ContentGroup = this.group) {
    const dialogRef = this.dialogService.openPublishGroupDialog(contentGroup.name);
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'publish') {
        const changes = { published: true };
        this.contentGroupService.patchContentGroup(contentGroup, changes).subscribe(updatedGroup => {
          const msg = this.translateService.instant('content.group-published');
          this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
          this.updateGroup(updatedGroup);
        });
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
        this.barTimer = setTimeout(() => {
          this.hideBar();
        }, 1000);
      }
    }
  }

  showBar() {
    this.barVisible = true;
    this.sendControlBarState();
  }

  hideBar() {
    this.barTimer = null;
    this.barVisible = false;
    this.sendControlBarState();
  }

  menuClosed() {
    this.menuOpen = false;
    this.toggleBarVisibility(false);
  }

  changeCommentSort(sort: Sort) {
    this.currentCommentSort = sort;
    this.eventService.broadcast('CommentSortingChanged', this.currentCommentSort);
  }

  private registerHotkeys() {
    const actions = {
      'share': () => this.updateFeature(undefined),
      'fullscreen': () => this.toggleFullscreen(),
      'exit': () => this.exitPresentation()
    };
    this.generalItems.forEach(item =>
      this.translateService.get('control-bar.' + item.name).pipe(
        map(t => ({
          key: item.key,
          action: actions[item.name],
          actionTitle: t
        } as Hotkey))
      ).subscribe((h: Hotkey) => this.hotkeyService.registerHotkey(h, this.hotkeyRefs))
    );
  }

  hasFormatAnswer(format: ContentType): boolean {
    return ![ContentType.SLIDE, ContentType.FLASHCARD].includes(format);
  }

  hasFormatRounds(format: ContentType): boolean {
    return [ContentType.CHOICE, ContentType.SCALE, ContentType.BINARY].includes(format);
  }

  editContent() {
    this.contentService.goToEdit(this.content.id, this.shortId, this.group.name);
  }

  deleteContentAnswers() {
    this.eventService.on<string>(ContentMessages.ANSWERS_DELETED).subscribe(contentId => {
      this.content.state.round = 1;
      this.resetAnswerEvent.next(this.content.id);
      this.changeRound(0);
      this.multipleRounds = false;
    });
    const dialogRef = this.dialogService.openDeleteDialog('content-answers', 'really-delete-answers');
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.contentService.deleteAnswersOfContent(this.content.id, this.roomId);
      }
    });
  }

  changeRound(round: number) {
    this.contentRounds.set(this.content.id, round);
    const body = {
      contentIndex: this.contentIndex,
      round: round
    };
    this.eventService.broadcast(ContentMessages.ROUND_CHANGED, body);
  }

  afterRoundStarted(content: Content) {
    this.content = content;
    this.changeRound(this.content.state.round - 1);
    this.multipleRounds = true;
  }
}
