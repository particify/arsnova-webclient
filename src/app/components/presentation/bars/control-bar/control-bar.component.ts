import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FEATURES, NavBarComponent, NavBarItem } from '../../../shared/bars/nav-bar/nav-bar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutingService } from '../../../../services/util/routing.service';
import { GlobalStorageService, STORAGE_KEYS } from '../../../../services/util/global-storage.service';
import { RoomStatsService } from '../../../../services/http/room-stats.service';
import { FeedbackService } from '../../../../services/http/feedback.service';
import { ContentGroupService } from '../../../../services/http/content-group.service';
import { EventService } from '../../../../services/util/event.service';
import { BarItem } from '../../../shared/bars/bar-base';
import { UserRole } from '../../../../models/user-roles.enum';
import { KeyboardKey } from '../../../../utils/keyboard/keys';
import { KeyboardUtils } from '../../../../utils/keyboard';
import { ContentGroup } from '../../../../models/content-group';
import { takeUntil } from 'rxjs/operators';
import { ApiConfigService } from '../../../../services/http/api-config.service';
import { Subject } from 'rxjs';
import { Sort } from '../../../shared/comment-list/comment-list.component';
import { AnnounceService } from '../../../../services/util/announce.service';

export class KeyNavBarItem extends NavBarItem {
  key: string;
  disabled: boolean;

  constructor(name: string, icon: string, url: string, key: string, disabled = false) {
    super(name, icon, url, false);
    this.key = key;
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
  destroyed$ = new Subject();
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
  notificationMessage: string;
  notificationIcon: string;
  showNotification = false;

  features: BarItem[] = [
    new BarItem(FEATURES.COMMENTS, 'question_answer'),
    new BarItem(FEATURES.GROUP, 'equalizer'),
    new BarItem(FEATURES.SURVEY, 'thumbs_up_down')
  ];
  groupItems: KeyNavBarItem[] = [
    new KeyNavBarItem('results', 'insert_chart', '', 'SPACE'),
    new KeyNavBarItem('correct', 'check_circle', '', 'LetterC'),
    new KeyNavBarItem('lock', 'lock', '', 'LetterL'),
  ];
  surveyItems: KeyNavBarItem[] = [
    new KeyNavBarItem('start', 'play_arrow', '', 'SPACE'),
    new KeyNavBarItem('change-type', 'swap_horiz', '', 'LetterC')
  ];
  arrowItems: KeyNavBarItem[] = [
    new KeyNavBarItem('left', 'arrow_back', '', 'LEFT', true),
    new KeyNavBarItem('right', 'arrow_forward', '', 'RIGHT'),
  ];
  generalItems: KeyNavBarItem[] = [
    new KeyNavBarItem('share', 'qr_code', '', 'LetterQ'),
    new KeyNavBarItem('fullscreen', 'open_in_full', '', 'LetterF'),
    new KeyNavBarItem('exit', 'close', '', 'Escape'),
  ];
  zoomItems: KeyNavBarItem[] = [
    new KeyNavBarItem('zoom-in', 'zoom_in', '', 'PLUS'),
    new KeyNavBarItem('zoom-out', 'zoom_out', '', 'MINUS')
  ];

  cursorTimer;
  barTimer;
  cursorVisible = true;
  barVisible = false;

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
    private announceService: AnnounceService
  ) {
    super(router, routingService, route, globalStorageService,
      roomStatsService, feedbackService, contentGroupService, eventService);
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (!this.eventService.focusOnInput) {
      if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit1) === true) {
        this.updateFeatureWithIndex(0)
      } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit2) === true) {
        this.updateFeatureWithIndex(1)
      } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Digit3) === true) {
        this.updateFeatureWithIndex(2)
      } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.LetterQ) === true) {
        this.updateFeature(undefined);
      } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.LetterF) === true) {
        this.toggleFullscreen();
      } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.Escape) === true) {
        this.exitPresentation();
      }
    }
  }

  updateFeatureWithIndex(index: number) {
    this.updateFeature(this.barItems[index].name);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
    this.destroyed = true;
    this.showCursor();
    clearTimeout(this.cursorTimer);
  }

  sendControlBarState() {
    this.eventService.broadcast('ControlBarVisible', this.barVisible);
  }

  isActiveFeature(feature: string): boolean {
    return this.barItems.map(b => b.name).indexOf(feature) === this.currentRouteIndex;
  }

  beforeInit() {
    this.subscribeFullscreen();
  }

  afterInit() {
    const lastSort = this.globalStorageService.getItem(STORAGE_KEYS.COMMENT_SORT);
    this.currentCommentSort = lastSort && lastSort !== Sort.VOTEASC ? lastSort : Sort.TIME;
    this.route.data.subscribe(data => {
      this.surveyStarted = !data.room.settings.feedbackLocked;
      this.setSurveyState();
      this.contentGroupService.getByRoomIdAndName(data.room.id, this.groupName, true).subscribe(group => {
        this.group = group;
        this.checkIfContentLocked();
      });
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
    this.eventService.on('SurveyStateChanged').subscribe(state => {
      this.surveyStarted = state === 'started';
      this.setSurveyState();
    });
    this.eventService.on<any>('ContentStepStateChanged').subscribe(state => {
      this.contentStepState = state.position;
      this.contentIndex = state.index;
      this.globalStorageService.setItem(STORAGE_KEYS.LAST_INDEX, this.contentIndex);
      this.setArrowsState(this.contentStepState);
      this.checkIfContentLocked();
    });
    this.eventService.on<string>('CommentStepStateChanged').subscribe(state => {
      this.commentStepState = state;
      if (this.isActiveFeature(FEATURES.COMMENTS)) {
        this.setArrowsState(this.commentStepState);
      }
    });
    this.eventService.on<number>('CommentZoomChanged').subscribe(zoom => {
      this.currentCommentZoom = Math.round(zoom);
      this.announceService.announce('presentation.a11y-comment-zoom-changed', { zoom: this.currentCommentZoom })
    });
    this.eventService.on<ContentGroup>('ContentGroupStateChanged').subscribe(updatedContentGroup => {
      this.contentIndex = 0;
      this.group = updatedContentGroup;
      this.checkIfContentLocked();
    });
  }

  checkIfContentLocked() {
    if (this.contentIndex) {
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
    if (feature) {
      this.getCurrentRouteIndex(feature);
    } else {
      this.currentRouteIndex = undefined;
    }
    this.activeFeature.emit(feature);
    if (feature === FEATURES.GROUP) {
      this.setArrowsState(this.contentStepState);
    } else if (feature === FEATURES.COMMENTS) {
      this.setArrowsState(this.commentStepState);
    }
    setTimeout(() => {
      this.sendControlBarState();
    }, 300);
  }

  getCurrentRouteIndex(feature?: string) {
    let index;
    if (feature) {
      index = this.barItems.map(s => s.name).indexOf(feature);
    } else {
      const matchingRoutes = this.barItems.filter(s => this.isRouteMatching(s.url));
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
    return `/presentation/${this.shortId}/`;
  }

  getFeatureUrl(feature: string): string {
    return this.groupName && feature === FEATURES.GROUP ? this.getQuestionUrl(this.role, this.groupName) : feature;
  }

  getQuestionUrl(role: UserRole, group: string): string {
    return group;
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
    if (this.inFullscreen) {
      this.exitFullscreen();
    }
    this.router.navigateByUrl(`creator/room/${this.shortId}`);
  }

  changeGroup(contentGroup: ContentGroup) {
    this.setGroup(contentGroup);
    this.activeGroup.emit(this.groupName);
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
}
